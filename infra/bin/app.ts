import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { App, DefaultStackSynthesizer } from 'aws-cdk-lib';
import { WebsiteStack } from '../lib/website-stack.js';
import { validateRedirects } from '../lib/routing.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const redirectFile = path.join(root, 'content/blog/redirects.json');
const redirects = fs.existsSync(redirectFile) ? validateRedirects(JSON.parse(fs.readFileSync(redirectFile, 'utf8'))) : {};
const stage = process.env.WEBSITE_STAGE ?? 'preview';
if (stage !== 'preview' && stage !== 'production') throw new Error('WEBSITE_STAGE must be preview or production.');

const app = new App({ outdir: path.join(root, 'infra/cdk.out') });
new WebsiteStack(app, 'DanielGaioWebsite', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.AWS_REGION ?? 'us-east-1' },
  // There are no file assets or IAM roles. The emitted template can be deployed
  // directly through CloudFormation using the operator's existing credentials.
  synthesizer: new DefaultStackSynthesizer({ generateBootstrapVersionRule: false }),
  domainNames: process.env.WEBSITE_DOMAIN_NAMES?.split(',').map((value) => value.trim()).filter(Boolean),
  certificateArn: process.env.WEBSITE_CERTIFICATE_ARN,
  redirects,
  stage,
});
const assembly = app.synth();
console.log(path.join(assembly.directory, 'DanielGaioWebsite.template.json'));
