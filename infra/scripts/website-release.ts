import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const command = args.shift();
function option(name: string, fallback?: string): string {
  const position = args.indexOf(`--${name}`);
  const value = position === -1 ? fallback : args[position + 1];
  if (!value || value.startsWith('--')) throw new Error(`Supply --${name}.`);
  return value;
}
const region = option('region', 'us-east-1');
const stackName = option('stack', 'DanielGaioWebsite');
const expectedAccount = option('expected-account');
const release = option('release');
if (!/^\d{12}$/.test(expectedAccount)) throw new Error('--expected-account must be a 12-digit AWS account ID.');
if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(release)) throw new Error('Release IDs use 1–64 lowercase letters, digits and hyphens.');
if (command !== 'publish' && command !== 'activate') throw new Error('Use publish or activate.');

function aws(parameters: string[], capture = true): string {
  const result = spawnSync(process.env.AWS_CLI_BIN ?? 'aws', [...parameters, '--region', region], {
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    env: { ...process.env, AWS_PAGER: '' },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`AWS command failed: ${parameters.slice(0, 2).join(' ')}\n${result.stderr ?? ''}`);
  return result.stdout?.trim() ?? '';
}
const identity = JSON.parse(aws(['sts', 'get-caller-identity', '--output', 'json'])) as { Account: string };
if (identity.Account !== expectedAccount) throw new Error('AWS identity does not match --expected-account; no release changes made.');

const response = JSON.parse(aws(['cloudformation', 'describe-stacks', '--stack-name', stackName, '--output', 'json'])) as {
  Stacks: { StackStatus: string; Outputs?: { OutputKey: string; OutputValue: string }[]; Parameters?: { ParameterKey: string; ParameterValue: string }[] }[];
};
const stack = response.Stacks[0];
if (!stack || !['CREATE_COMPLETE', 'UPDATE_COMPLETE', 'UPDATE_ROLLBACK_COMPLETE'].includes(stack.StackStatus)) throw new Error('Wait for a complete website stack before publishing.');
function output(key: string): string {
  const value = stack.Outputs?.find((item) => item.OutputKey === key)?.OutputValue;
  if (!value) throw new Error(`Website stack output ${key} is missing.`);
  return value;
}
const bucket = output('ContentBucketName');
const distribution = output('DistributionId');
const previousRelease = output('ActiveReleaseId');
const tags = JSON.parse(aws(['s3api', 'get-bucket-tagging', '--bucket', bucket, '--output', 'json'])) as { TagSet: { Key: string; Value: string }[] };
if (!tags.TagSet.some((tag) => tag.Key === 'Project' && tag.Value === 'DanielGaioWebsite')) throw new Error('The content bucket is not tagged as this website.');
const prefix = `releases/${release}/`;
const requiredFiles = ['index.html', 'en/index.html', 'pt/index.html', '404.html'];

if (command === 'publish') {
  const site = path.resolve(option('site', path.join(repoRoot, 'apps/web/out')));
  for (const name of requiredFiles) if (!fs.existsSync(path.join(site, name))) throw new Error(`Static export lacks ${name}.`);
  function inspect(directory: string): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error('Static exports must not contain symbolic links.');
      if (entry.name === '.env' || entry.name.startsWith('.env.')) throw new Error('Static export contains an environment file.');
      if (entry.isDirectory()) inspect(path.join(directory, entry.name));
    }
  }
  inspect(site);
  const existing = aws(['s3api', 'list-objects-v2', '--bucket', bucket, '--prefix', prefix, '--max-keys', '1', '--query', 'KeyCount', '--output', 'text']);
  if (Number(existing) > 0) throw new Error('Release prefix already exists. Choose a new release ID; use activate to roll back.');

  aws(['s3', 'sync', site, `s3://${bucket}/${prefix}`, '--cache-control', 'public,max-age=0,s-maxage=60,must-revalidate', '--no-progress'], false);
  // Shared immutable assets preserve old hashes used by already-open pages.
  // No --delete: old release bundles/images remain available for rollback.
  for (const assetPath of ['_next/static', 'media', 'blog-imports']) {
    const directory = path.join(site, assetPath);
    if (fs.existsSync(directory)) aws(['s3', 'sync', directory, `s3://${bucket}/${assetPath}/`, '--cache-control', 'public,max-age=31536000,immutable', '--no-progress'], false);
  }
}

for (const name of requiredFiles) {
  aws(['s3api', 'head-object', '--bucket', bucket, '--key', prefix + name, '--query', 'ContentLength', '--output', 'text']);
}
const parameters = (stack.Parameters ?? []).map((item) => item.ParameterKey === 'ReleaseId'
  ? { ParameterKey: 'ReleaseId', ParameterValue: release }
  : { ParameterKey: item.ParameterKey, UsePreviousValue: true });
if (!parameters.some((item) => item.ParameterKey === 'ReleaseId')) throw new Error('Website stack is missing its ReleaseId parameter.');

if (release !== previousRelease) {
  aws(['cloudformation', 'update-stack', '--stack-name', stackName, '--use-previous-template', '--parameters', JSON.stringify(parameters), '--output', 'json']);
  aws(['cloudformation', 'wait', 'stack-update-complete', '--stack-name', stackName]);
}
aws(['cloudfront', 'wait', 'distribution-deployed', '--id', distribution]);
const invalidation = aws(['cloudfront', 'create-invalidation', '--distribution-id', distribution, '--paths', '/*', '--query', 'Invalidation.Id', '--output', 'text']);
aws(['cloudfront', 'wait', 'invalidation-completed', '--distribution-id', distribution, '--id', invalidation]);
console.log(JSON.stringify({ stack: stackName, release, previousRelease, bucket, distribution, previewUrl: output('PreviewUrl'), invalidation }, null, 2));
