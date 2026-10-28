import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const script = fileURLToPath(new URL('../scripts/website-release.ts', import.meta.url));
const mockSource = `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.MOCK_AWS_LOG, JSON.stringify(args) + '\\n');
const command = args.slice(0,2).join(' ');
const values = {
 'sts get-caller-identity': JSON.stringify({Account: process.env.MOCK_ACCOUNT || '123456789012'}),
 'cloudformation describe-stacks': JSON.stringify({Stacks:[{StackStatus:'CREATE_COMPLETE',Parameters:[{ParameterKey:'ReleaseId',ParameterValue:'old'},{ParameterKey:'OtherSetting',ParameterValue:'kept'}],Outputs:[{OutputKey:'ContentBucketName',OutputValue:'website-test-bucket'},{OutputKey:'DistributionId',OutputValue:'DISTRIBUTIONTEST'},{OutputKey:'PreviewUrl',OutputValue:'https://example.cloudfront.net/'},{OutputKey:'ActiveReleaseId',OutputValue:'old'}]}]}),
 's3api get-bucket-tagging': JSON.stringify({TagSet:[{Key:'Project',Value:'DanielGaioWebsite'}]}),
 's3api list-objects-v2': process.env.MOCK_EXISTING || '0',
 's3api head-object': '100',
 's3 sync': '',
 'cloudformation update-stack': '{}',
 'cloudformation wait': '',
 'cloudfront wait': '',
 'cloudfront create-invalidation': 'INVALIDATIONTEST'
};
if (!(command in values)) {console.error('Unexpected mock command: ' + command);process.exit(2);}
console.log(values[command]);
`;

function run(command: 'publish' | 'activate', env: Record<string, string> = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'danielgaio-release-test-'));
  const aws = path.join(directory, 'aws.cjs');
  const log = path.join(directory, 'commands.jsonl');
  const site = path.join(directory, 'site');
  fs.writeFileSync(aws, mockSource, { mode: 0o755 });
  for (const name of ['index.html', 'en/index.html', 'pt/index.html', '404.html', '_next/static/hashed.js', 'blog-imports/post/hash.png']) {
    const file = path.join(site, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'fixture');
  }
  const result = spawnSync(process.execPath, ['--import', 'tsx', script, command,
    '--expected-account', '123456789012', '--release', 'new', '--site', site], {
    cwd: path.resolve(path.dirname(script), '..'),
    env: { ...process.env, AWS_CLI_BIN: aws, MOCK_AWS_LOG: log, ...env }, encoding: 'utf8',
  });
  const commands = fs.existsSync(log) ? fs.readFileSync(log, 'utf8').trim().split('\n').map((line) => JSON.parse(line) as string[]) : [];
  fs.rmSync(directory, { recursive: true, force: true });
  return { result, commands };
}

test('wrong account stops the helper before any release or resource mutation', () => {
  const { result, commands } = run('publish', { MOCK_ACCOUNT: '999999999999' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /does not match/);
  assert.deepEqual(commands.map((args) => args.slice(0, 2).join(' ')), ['sts get-caller-identity']);
});

test('publishing refuses to overwrite an existing immutable release prefix', () => {
  const { result, commands } = run('publish', { MOCK_EXISTING: '1' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /already exists/);
  assert(!commands.some((args) => args[0] === 's3' || args[1] === 'update-stack'));
});

test('publish uploads release and shared hashes before activation without deletion', () => {
  const { result, commands } = run('publish');
  assert.equal(result.status, 0, result.stderr);
  const uploadIndexes = commands.map((args, index) => args[0] === 's3' && args[1] === 'sync' ? index : -1).filter((index) => index !== -1);
  const activation = commands.findIndex((args) => args[0] === 'cloudformation' && args[1] === 'update-stack');
  assert.equal(uploadIndexes.length, 3);
  assert(uploadIndexes.every((index) => index < activation));
  assert(!commands.some((args) => args.includes('--delete')));
  const update = commands[activation];
  const parameters = JSON.parse(update[update.indexOf('--parameters') + 1]);
  assert.deepEqual(parameters, [{ ParameterKey: 'ReleaseId', ParameterValue: 'new' }, { ParameterKey: 'OtherSetting', UsePreviousValue: true }]);
  const invalidations = commands.filter((args) => args[0] === 'cloudfront' && args[1] === 'create-invalidation');
  assert.equal(invalidations.length, 1);
  assert.equal(invalidations[0][invalidations[0].indexOf('--paths') + 1], '/*');
});

test('rollback activation verifies archived pages without uploading or deleting objects', () => {
  const { result, commands } = run('activate');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(commands.filter((args) => args[1] === 'head-object').length, 4);
  assert(!commands.some((args) => args[0] === 's3' || args[1] === 'delete-object'));
  assert(commands.some((args) => args[1] === 'update-stack'));
});
