import assert from 'node:assert/strict';
import test from 'node:test';
import { LIMITS, parseOptions, verifyOriginCache } from '../scripts/verify-origin-cache.js';
import type { LearningDependencies } from '../scripts/verify-origin-cache.js';

const options = parseOptions(['--expected-account', '123456789012']);
const html = '<html lang="en"><link rel="stylesheet" href="/_next/static/chunks/example.css"><h1>Daniel</h1></html>';
const pageHeaders = { 'content-type': 'text/html', 'cache-control': 'public,max-age=0,s-maxage=60,must-revalidate', 'x-cache': 'Hit from cloudfront', age: '12', etag: '"html-version"' };
function fixture(change: { account?: string; tag?: string; missing?: boolean; stackStatus?: string; output?: string; preview?: string; headLength?: number; assetHeadLength?: number; html?: string; cache?: string; pageCache?: string; assetCache?: string; direct?: number; redirect?: boolean; oversized?: boolean; changingBody?: boolean; headEtag?: string | null; pageEtag?: string | null; assetHeadEtag?: string | null; assetEtag?: string | null } = {}) {
  const commands: string[][] = []; const requests: { url: string; init?: RequestInit }[] = [];
  const source = change.html ?? html;
  const aws: LearningDependencies['aws'] = (args) => {
    commands.push(args); const command = args.slice(0, 2).join(' ');
    if (command === 'sts get-caller-identity') return { Account: change.account ?? '123456789012', Arn: 'PRIVATE_IDENTITY_NOT_FOR_OUTPUT' };
    if (command === 'cloudformation describe-stacks') return { Stacks: [{ StackStatus: change.stackStatus ?? 'UPDATE_COMPLETE', Parameters: [{ ParameterKey: 'ReleaseId', ParameterValue: 'initial' }], Outputs: [
      { OutputKey: 'ContentBucketName', OutputValue: 'website-example-content' },
      { OutputKey: 'DistributionId', OutputValue: 'EXAMPLEDISTRIBUTION' },
      { OutputKey: 'ActiveReleaseId', OutputValue: change.output ?? 'initial' },
      { OutputKey: 'PreviewUrl', OutputValue: change.preview ?? 'https://example.cloudfront.net/' },
    ] }] };
    if (command === 's3api get-bucket-tagging') return { TagSet: [{ Key: 'Project', Value: change.tag ?? 'DanielGaioWebsite' }] };
    if (command === 's3api head-object') {
      if (change.missing) throw new Error('PRIVATE_AWS_STDERR_ACCOUNT_123456789012');
      if (args[args.indexOf('--key') + 1] !== 'releases/initial/en/index.html') return { ContentLength: change.assetHeadLength ?? 6, ETag: change.assetHeadEtag === null ? undefined : change.assetHeadEtag ?? '"asset-version"' };
      return { ContentLength: change.headLength ?? Buffer.byteLength(source), ETag: change.headEtag === null ? undefined : change.headEtag ?? '"html-version"' };
    }
    throw new Error('A mutation or unexpected command was attempted.');
  };
  const fetch: LearningDependencies['fetch'] = async (input, init) => {
    const url = String(input); requests.push({ url, init });
    if (init?.method === 'HEAD') return new Response(null, { status: change.direct ?? 403 });
    if (url.endsWith('/en/')) {
      if (change.redirect) return new Response(null, { status: 301, headers: { location: 'https://untrusted.example/' } });
      const headers = new Headers({ ...pageHeaders, 'cache-control': change.pageCache ?? pageHeaders['cache-control'], 'x-cache': change.cache ?? 'Hit from cloudfront', ...(change.oversized ? { 'content-length': String(LIMITS.htmlBytes + 1) } : {}) });
      if (change.pageEtag === null) headers.delete('etag');
      else if (change.pageEtag !== undefined) headers.set('etag', change.pageEtag);
      return new Response(change.changingBody && requests.length === 3 ? source.replace('Daniel', 'Daniil') : source, { headers });
    }
    return new Response('body{}', { headers: { 'content-type': 'text/css', 'cache-control': change.assetCache ?? 'public,max-age=31536000,immutable', 'x-cache': 'Miss from cloudfront', ...(change.assetEtag === null ? {} : { etag: change.assetEtag ?? '"asset-version"' }) } });
  };
  return { dependencies: { aws, fetch }, commands, requests };
}

test('ordinary observations use only AWS reads and four bounded unsigned HTTPS probes; warm caches pass', async () => {
  for (const cache of ['Hit from cloudfront', 'RefreshHit from cloudfront', 'Miss from cloudfront']) {
    const f = fixture({ cache }); const result = await verifyOriginCache(options, f.dependencies);
    assert.equal(result.result, 'PASS'); assert.equal(result.httpRequests, 4);
    assert.deepEqual(f.commands.map(args => args.slice(0, 2).join(' ')), ['sts get-caller-identity', 'cloudformation describe-stacks', 's3api get-bucket-tagging', 's3api head-object', 's3api head-object']);
    assert(f.commands.every(args => args.includes('--region') && args.includes('--output')));
    assert.deepEqual(f.requests.map(request => request.init?.method), ['HEAD', 'GET', 'GET', 'GET']);
    assert(f.requests.every(request => request.init?.redirect === 'error' && request.init.signal instanceof AbortSignal && !JSON.stringify(request.init.headers).includes('Authorization')));
    assert.equal(f.requests[1].url, f.requests[2].url); assert(!f.requests.some(request => new URL(request.url).search));
    assert.equal(result.page[0].xCache, cache);
    const output = JSON.stringify(result);
    assert(!output.includes('123456789012') && !output.includes('PRIVATE_IDENTITY') && !output.includes('website-example-content') && !output.includes('EXAMPLEDISTRIBUTION'));
  }
});

test('identity, project, stack and object failures stop before network probes and redact AWS diagnostics', async () => {
  const failures: Parameters<typeof fixture>[0][] = [{ account: '999999999999' }, { tag: 'OtherProject' }, { stackStatus: 'UPDATE_IN_PROGRESS' }, { output: '../other' }, { output: 'different' }, { preview: 'https://example.cloudfront.net.untrusted.example/' }, { preview: 'https://user:secret@example.cloudfront.net/' }, { headLength: 0 }, { headLength: LIMITS.htmlBytes + 1 }, { missing: true }];
  for (const change of failures) {
    const f = fixture(change);
    await assert.rejects(verifyOriginCache(options, f.dependencies), error => {
      assert(error instanceof Error); assert(!error.message.includes('PRIVATE_AWS_STDERR')); return true;
    });
    assert.equal(f.requests.length, 0);
    if (change?.account) assert.equal(f.commands.length, 1);
    if (change?.tag) assert.equal(f.commands.length, 3);
  }
});

test('an object must be privately denied while the matching English page succeeds', async () => {
  for (const change of [{ direct: 200 }, { direct: 404 }, { headLength: 42 }, { html: html.replace('lang="en"', 'lang="pt"') }, { redirect: true }, { changingBody: true }]) {
    const f = fixture(change); await assert.rejects(verifyOriginCache(options, f.dependencies));
    assert(f.requests.length <= 3);
  }
});

test('same-sized English content with a different entity is rejected; weak representation tags are comparable', async () => {
  const wrong = fixture({ html: html.replace('Daniel', 'Daniil'), pageEtag: '"other-entity"' });
  await assert.rejects(verifyOriginCache(options, wrong.dependencies), /English entity tag/);
  assert.equal(wrong.requests.length, 2);
  const weak = fixture({ pageEtag: 'W/"html-version"', assetEtag: 'W/"asset-version"' });
  const result = await verifyOriginCache(options, weak.dependencies);
  assert(result.page.every(page => page.entityTagVerified)); assert(result.asset.entityTagVerified);
});

test('HTML and asset entity tags must be present and agree with authenticated metadata', async () => {
  for (const change of [{ headEtag: null }, { pageEtag: null }, { pageEtag: 'unquoted' }, { assetHeadEtag: null }, { assetEtag: null }, { assetEtag: '"other-asset"' }]) {
    const f = fixture(change);
    await assert.rejects(verifyOriginCache(options, f.dependencies), /entity tag/);
    if (change.headEtag === null) assert.equal(f.requests.length, 0);
    if (change.assetHeadEtag === null) assert.equal(f.requests.length, 3);
  }
});

test('oversized advertised and streamed responses stop instead of reading without bounds', async () => {
  const advertised = fixture({ oversized: true });
  await assert.rejects(verifyOriginCache(options, advertised.dependencies), /bounded body size/);
  assert.equal(advertised.requests.length, 2);
  const streamed = fixture(); const ordinaryFetch = streamed.dependencies.fetch;
  streamed.dependencies.fetch = async (input, init) => String(input).endsWith('/en/')
    ? new Response(new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(LIMITS.htmlBytes + 1)); controller.close(); } }), { headers: pageHeaders })
    : ordinaryFetch(input, init);
  await assert.rejects(verifyOriginCache(options, streamed.dependencies), /bounded body size/);
  const asset = fixture({ assetHeadLength: LIMITS.assetBytes + 1 });
  await assert.rejects(verifyOriginCache(options, asset.dependencies), /shared asset.*size limit/);
  assert.equal(asset.requests.length, 3, 'an oversized known asset must not be downloaded');
  const mismatch = fixture({ assetHeadLength: 7 });
  await assert.rejects(verifyOriginCache(options, mismatch.dependencies), /known object length/);
});

test('external, protocol-relative and traversal assets are ignored; only whitelisted shared assets are requested', async () => {
  const unsafe = '<html lang="en"><img src="https://untrusted.example/blog-imports/a.png"><img src="//untrusted.example/media/a.png"><img src="/_next/static/../../private.png"><img src="/_next/static/%2fprivate.png">';
  const absent = fixture({ html: unsafe + '</html>' });
  await assert.rejects(verifyOriginCache(options, absent.dependencies), /no eligible/); assert.equal(absent.requests.length, 3);
  const safe = fixture({ html: unsafe + '<img src="/blog-imports/post/hashed.png"></html>' });
  const result = await verifyOriginCache(options, safe.dependencies);
  assert.equal(result.asset.path, '/blog-imports/post/hashed.png');
  assert(safe.requests.every(request => !request.url.includes('untrusted.example')));
});

test('unexpected cache headers are reported rather than declared a successful lesson', async () => {
  const cache = fixture({ cache: 'Error from cloudfront' }); await assert.rejects(verifyOriginCache(options, cache.dependencies), /recognized CloudFront/);
  const immutable = fixture({ assetCache: 'public,max-age=60' }); await assert.rejects(verifyOriginCache(options, immutable.dependencies), /immutable cache/);
  const short = fixture(); const original = short.dependencies.fetch;
  short.dependencies.fetch = async (input, init) => {
    const response = await original(input, init);
    if (String(input).endsWith('/en/')) response.headers.set('cache-control', 'public,max-age=31536000,immutable');
    return response;
  };
  await assert.rejects(verifyOriginCache(options, short.dependencies), /short cache/);
});

test('conflicting storage directives and duplicate freshness cannot produce a passing HTML or asset lesson', async () => {
  const contradictory = ['no-store', 'no-store=1', 'private', 'private="Set-Cookie"', 'no-cache', 'no-cache="ETag"', 'PRIVATE = "field, other"'];
  for (const suffix of [...contradictory, 'max-age=31536000', 'max-age=0', 's-maxage=0', 's-maxage=60', 'max-age = 300']) {
    const f = fixture({ pageCache: `${pageHeaders['cache-control']},${suffix}` });
    await assert.rejects(verifyOriginCache(options, f.dependencies), /short cache/);
    assert.equal(f.requests.length, 2, suffix);
  }
  for (const suffix of [...contradictory, 'max-age=0', 'max-age=31536000', 's-maxage=0', 's-maxage=60,s-maxage=0', 'MAX-AGE = 60']) {
    const f = fixture({ assetCache: `public,max-age=31536000,immutable,${suffix}` });
    await assert.rejects(verifyOriginCache(options, f.dependencies), /immutable cache/);
    assert.equal(f.requests.length, 4, suffix);
  }
});

test('current policies retain their meaning when directive case, order and separator whitespace differ', async () => {
  const f = fixture({ pageCache: 'MUST-REVALIDATE, s-maxage=60, PUBLIC, max-age=0', assetCache: 'immutable, MAX-AGE=31536000, public', cache: 'RefreshHit from cloudfront' });
  const result = await verifyOriginCache(options, f.dependencies);
  assert.equal(result.result, 'PASS');
  assert.equal(result.page[0].xCache, 'RefreshHit from cloudfront');
  assert('edgeLocation' in result.page[0]);
});

test('CLI options reject missing, repeated and unrelated input before running AWS', () => {
  assert.deepEqual(options, { expectedAccount: '123456789012', stack: 'DanielGaioWebsite', region: 'us-east-1' });
  for (const args of [[], ['--expected-account', 'bad'], ['--expected-account'], ['--expected-account', '123456789012', '--expected-account', '123456789012'], ['--expected-account', '123456789012', '--publish', 'yes']]) assert.throws(() => parseOptions(args));
});
