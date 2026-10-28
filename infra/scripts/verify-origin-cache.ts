import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface LearningOptions { expectedAccount: string; stack: string; region: string }
export interface LearningDependencies {
  aws: (args: string[]) => unknown | Promise<unknown>;
  fetch: typeof globalThis.fetch;
}
export const LIMITS = Object.freeze({ requests: 4, htmlBytes: 1_048_576, assetBytes: 4_194_304, timeoutMs: 10_000 });
const READ_COMMANDS = new Set(['sts get-caller-identity', 'cloudformation describe-stacks', 's3api get-bucket-tagging', 's3api head-object']);
const USAGE = 'pnpm --filter @danielgaio/infra learn:origin-cache --expected-account ACCOUNT_ID [--stack DanielGaioWebsite] [--region us-east-1]';
class LearningFailure extends Error {}
function requireThat(condition: unknown, message: string): asserts condition {
  if (!condition) throw new LearningFailure(message);
}
function object(value: unknown): Record<string, unknown> {
  requireThat(value !== null && typeof value === 'object' && !Array.isArray(value), 'AWS returned incomplete read-only metadata.');
  return value as Record<string, unknown>;
}

export function parseOptions(args: string[]): LearningOptions {
  const values: Record<string, string> = { stack: 'DanielGaioWebsite', region: 'us-east-1' };
  const seen = new Set<string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index]?.replace(/^--/, '');
    requireThat(args[index]?.startsWith('--') && ['expected-account', 'stack', 'region'].includes(key) && !seen.has(key), 'Use only the documented, non-repeated options.');
    requireThat(args[index + 1] && !args[index + 1].startsWith('--'), 'Each option needs a value.');
    seen.add(key); values[key] = args[index + 1];
  }
  requireThat(/^\d{12}$/.test(values['expected-account'] ?? ''), 'Supply --expected-account with the verified 12-digit account ID.');
  requireThat(/^[A-Za-z][A-Za-z0-9-]{0,127}$/.test(values.stack), 'Supply a valid website stack name.');
  requireThat(/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/.test(values.region), 'Supply a valid AWS region.');
  return { expectedAccount: values['expected-account'], stack: values.stack, region: values.region };
}

function cliRead(args: string[]): unknown {
  requireThat(READ_COMMANDS.has(args.slice(0, 2).join(' ')), 'Only the documented AWS read operations are permitted.');
  const result = spawnSync(process.env.AWS_CLI_BIN ?? 'aws', args, {
    encoding: 'utf8', timeout: LIMITS.timeoutMs, maxBuffer: 1_048_576,
    env: { ...process.env, AWS_PAGER: '', AWS_CLI_AUTO_PROMPT: 'off', AWS_MAX_ATTEMPTS: '1' },
  });
  requireThat(!result.error && result.status === 0, 'AWS read failed. Check the existing session and read permissions; no access changes were attempted.');
  try { return JSON.parse(result.stdout); }
  catch { throw new LearningFailure('AWS read did not return valid JSON metadata.'); }
}

function cacheObservation(response: Response) {
  const age = response.headers.get('age');
  return { cacheControl: response.headers.get('cache-control'), xCache: response.headers.get('x-cache'), ageSeconds: age !== null && /^\d+$/.test(age) ? Number(age) : null, edgeLocation: response.headers.get('x-amz-cf-pop') };
}
function cachePolicyMatches(response: Response, expected: string[]): boolean {
  const values = (response.headers.get('cache-control') ?? '').toLowerCase().split(',').map(value => value.trim());
  const names = values.map(value => value.split('=', 1)[0].trim());
  if (names.some(name => ['no-store', 'private', 'no-cache'].includes(name))) return false;
  for (const name of ['max-age', 's-maxage']) {
    const freshness = values.filter((_, index) => names[index] === name);
    // Duplicates are ambiguous even if equal. Only this website's expected
    // freshness values are accepted, including the absence of asset s-maxage.
    if (freshness.length > 1 || freshness.some(value => !expected.includes(value))) return false;
  }
  return expected.every(value => values.includes(value));
}
function entityTag(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  // CloudFront can weaken a representation's tag; keep the opaque tag itself.
  return /^(?:W\/)?("[\x21\x23-\x7e\x80-\xff]+")$/.exec(value.trim())?.[1];
}
function discoverAsset(html: string, origin: string): URL {
  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*(["'])(.*?)\1/gi)) {
    const candidate = match[2].replaceAll('&amp;', '&');
    if (!candidate.startsWith('/') || candidate.startsWith('//') || /[\\\r\n]/.test(candidate)) continue;
    const url = new URL(candidate, origin);
    if (url.origin !== origin || url.search || url.hash || /%(?:2f|5c|00)/i.test(url.pathname)) continue;
    if (/^\/(?:_next\/static|blog-imports|media)\/[^/]/.test(url.pathname)) return url;
  }
  throw new LearningFailure('The rendered page contains no eligible same-origin shared asset.');
}

export async function verifyOriginCache(options: LearningOptions, dependencies: LearningDependencies = { aws: cliRead, fetch: globalThis.fetch }) {
  let requests = 0;
  async function read(args: string[]): Promise<Record<string, unknown>> {
    requireThat(READ_COMMANDS.has(args.slice(0, 2).join(' ')), 'Only AWS read operations are permitted.');
    try { return object(await dependencies.aws([...args, '--region', options.region, '--output', 'json'])); }
    catch { throw new LearningFailure('AWS read failed. Check the existing session and read permissions; private AWS diagnostics were not printed.'); }
  }
  async function probe(url: URL, method: 'GET' | 'HEAD', maximum: number) {
    requireThat(++requests <= LIMITS.requests, 'The four-request HTTP limit was reached.');
    let response: Response;
    try {
      response = await dependencies.fetch(url.href, { method, redirect: 'error', signal: AbortSignal.timeout(LIMITS.timeoutMs), headers: { 'Accept-Encoding': 'identity' } });
    } catch { throw new LearningFailure('An HTTPS probe failed or tried to redirect. Check the existing endpoint without changing access.'); }
    requireThat(!response.redirected, 'HTTPS probes must not follow redirects.');
    const length = response.headers.get('content-length');
    if (method === 'HEAD') return { response, body: Buffer.alloc(0) };
    if (length !== null && /^\d+$/.test(length) && Number(length) > maximum) {
      await response.body?.cancel(); throw new LearningFailure('An HTTPS response exceeded the bounded body size.');
    }
    const chunks: Uint8Array[] = []; let bytes = 0;
    if (response.body) {
      const reader = response.body.getReader();
      try {
        while (true) {
          const chunk = await reader.read(); if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > maximum) { await reader.cancel(); throw new LearningFailure('An HTTPS response exceeded the bounded body size.'); }
          chunks.push(chunk.value);
        }
      } finally { reader.releaseLock(); }
    }
    return { response, body: Buffer.concat(chunks) };
  }

  const identity = await read(['sts', 'get-caller-identity']);
  requireThat(identity.Account === options.expectedAccount, 'AWS identity does not match the expected account; no HTTP probes were made.');
  const description = await read(['cloudformation', 'describe-stacks', '--stack-name', options.stack]);
  requireThat(Array.isArray(description.Stacks) && description.Stacks.length === 1, 'The selected website stack is missing.');
  const stack = object(description.Stacks[0]);
  requireThat(['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE'].includes(String(stack.StackStatus)), 'Wait for the website stack to reach a completed state.');
  requireThat(Array.isArray(stack.Outputs) && Array.isArray(stack.Parameters), 'Website stack outputs or release parameters are incomplete.');
  function output(key: string): string {
    const item = (stack.Outputs as Record<string, unknown>[]).find(value => value.OutputKey === key);
    requireThat(typeof item?.OutputValue === 'string' && item.OutputValue.length > 0, 'Required website stack outputs are missing.');
    return item.OutputValue;
  }
  const bucket = output('ContentBucketName'); const distribution = output('DistributionId'); const release = output('ActiveReleaseId');
  requireThat(/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(bucket) && /^[A-Z0-9]{1,64}$/.test(distribution), 'Website resource outputs are invalid.');
  requireThat(/^[a-z0-9][a-z0-9-]{0,63}$/.test(release), 'The active website release is invalid.');
  const releaseParameter = (stack.Parameters as Record<string, unknown>[]).find(value => value.ParameterKey === 'ReleaseId');
  requireThat(releaseParameter?.ParameterValue === release, 'The active release output and stack parameter disagree.');
  let preview: URL;
  try { preview = new URL(output('PreviewUrl')); }
  catch { throw new LearningFailure('The website endpoint output is invalid.'); }
  requireThat(preview.protocol === 'https:' && /^[a-z0-9-]+\.cloudfront\.net$/.test(preview.hostname) && !preview.port && !preview.username && !preview.password && preview.pathname === '/' && !preview.search && !preview.hash, 'Use the stack-provided HTTPS CloudFront endpoint.');
  const tags = await read(['s3api', 'get-bucket-tagging', '--bucket', bucket]);
  requireThat(Array.isArray(tags.TagSet) && tags.TagSet.some(value => object(value).Key === 'Project' && object(value).Value === 'DanielGaioWebsite'), 'The content bucket is not tagged for this website; no HTTP probes were made.');
  const key = `releases/${release}/en/index.html`;
  const head = await read(['s3api', 'head-object', '--bucket', bucket, '--key', key]);
  requireThat(Number.isSafeInteger(head.ContentLength) && Number(head.ContentLength) > 0 && Number(head.ContentLength) <= LIMITS.htmlBytes, 'The active English object is missing or exceeds the learning size limit.');
  const htmlTag = entityTag(head.ETag);
  requireThat(htmlTag, 'The active English object metadata is missing a valid entity tag.');

  const direct = await probe(new URL(`https://${bucket}.s3.${options.region}.amazonaws.com/${key}`), 'HEAD', 0);
  requireThat(direct.response.status === 403, 'The known existing object was not denied to an unsigned S3 request.');
  const observations = [];
  let firstBody: Buffer | undefined;
  for (let index = 0; index < 2; index++) {
    const { response, body } = await probe(new URL('/en/', preview), 'GET', LIMITS.htmlBytes);
    requireThat(response.status === 200 && /^text\/html(?:;|$)/i.test(response.headers.get('content-type') ?? ''), 'The CloudFront English page must return HTTP 200 HTML.');
    requireThat(body.byteLength === head.ContentLength && /<html\b[^>]*\blang\s*=\s*(["'])en\1/i.test(body.toString('utf8')), 'CloudFront content does not match the known English object length and language.');
    requireThat(entityTag(response.headers.get('etag')) === htmlTag, 'The CloudFront English entity tag is missing or does not match the known object.');
    requireThat(!firstBody || body.equals(firstBody), 'The two ordinary CloudFront responses have different content.');
    requireThat(cachePolicyMatches(response, ['public', 'max-age=0', 's-maxage=60', 'must-revalidate']), 'The English document does not have the expected short cache policy.');
    requireThat(/^(?:Hit|RefreshHit|Miss) from cloudfront$/.test(response.headers.get('x-cache') ?? ''), 'The page does not expose a recognized CloudFront cache observation.');
    firstBody = body;
    observations.push({ status: response.status, bytes: body.byteLength, entityTagVerified: true, sha256: createHash('sha256').update(body).digest('hex'), ...cacheObservation(response) });
  }
  const assetUrl = discoverAsset(firstBody!.toString('utf8'), preview.origin);
  let assetKey: string;
  try { assetKey = decodeURIComponent(assetUrl.pathname.slice(1)); }
  catch { throw new LearningFailure('The shared asset path is not valid URI encoding.'); }
  const assetHead = await read(['s3api', 'head-object', '--bucket', bucket, '--key', assetKey]);
  requireThat(Number.isSafeInteger(assetHead.ContentLength) && Number(assetHead.ContentLength) > 0 && Number(assetHead.ContentLength) <= LIMITS.assetBytes, 'The shared asset is missing or exceeds the learning size limit.');
  const assetTag = entityTag(assetHead.ETag);
  requireThat(assetTag, 'The shared asset metadata is missing a valid entity tag.');
  const asset = await probe(assetUrl, 'GET', LIMITS.assetBytes);
  requireThat(asset.response.status === 200 && asset.body.byteLength === assetHead.ContentLength && !/^text\/html(?:;|$)/i.test(asset.response.headers.get('content-type') ?? ''), 'The shared asset response does not match the known object length and asset type.');
  requireThat(entityTag(asset.response.headers.get('etag')) === assetTag, 'The shared asset entity tag is missing or does not match the known object.');
  requireThat(cachePolicyMatches(asset.response, ['public', 'max-age=31536000', 'immutable']), 'The shared asset does not have the expected immutable cache policy.');
  return {
    result: 'PASS', mode: 'read-only', activeRelease: release, httpRequests: requests,
    origin: { knownObjectExists: true, unsignedStatus: direct.response.status },
    page: observations,
    asset: { path: assetUrl.pathname, status: asset.response.status, bytes: asset.body.byteLength, entityTagVerified: true, ...cacheObservation(asset.response) },
    note: 'Cache observations are local to the responding edge. A warm cache or revalidation can produce Hit or RefreshHit immediately; this is not a rollback or load test.',
  };
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  if (process.argv.slice(2).length === 1 && process.argv[2] === '--help') console.log(USAGE);
  else {
    try {
      const result = await verifyOriginCache(parseOptions(process.argv.slice(2)));
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(error instanceof LearningFailure ? error.message : 'The read-only learning check could not complete. No access or resource changes were attempted.');
      process.exitCode = 1;
    }
  }
}
