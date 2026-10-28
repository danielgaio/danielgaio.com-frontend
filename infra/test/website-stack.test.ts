import assert from 'node:assert/strict';
import test from 'node:test';
import { App, DefaultStackSynthesizer } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { WebsiteStack } from '../lib/website-stack.js';

function synth() {
  const app = new App();
  const stack = new WebsiteStack(app, 'WebsiteTest', {
    env: { account: '123456789012', region: 'us-east-1' },
    synthesizer: new DefaultStackSynthesizer({ generateBootstrapVersionRule: false }),
  });
  return Template.fromStack(stack);
}

test('content stays private, encrypted, versioned and retained', () => {
  const template = synth();
  template.resourceCountIs('AWS::S3::Bucket', 1);
  template.hasResource('AWS::S3::Bucket', {
    DeletionPolicy: 'Retain', UpdateReplacePolicy: 'Retain',
    Properties: Match.objectLike({
      BucketEncryption: { ServerSideEncryptionConfiguration: [{ ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }] },
      VersioningConfiguration: { Status: 'Enabled' },
      OwnershipControls: { Rules: [{ ObjectOwnership: 'BucketOwnerEnforced' }] },
      PublicAccessBlockConfiguration: { BlockPublicAcls: true, BlockPublicPolicy: true, IgnorePublicAcls: true, RestrictPublicBuckets: true },
    }),
  });
  template.hasResourceProperties('AWS::S3::BucketPolicy', {
    PolicyDocument: { Statement: Match.arrayWith([Match.objectLike({
      Action: 's3:GetObject', Effect: 'Allow', Principal: { Service: 'cloudfront.amazonaws.com' },
      Condition: { StringEquals: { 'AWS:SourceArn': Match.anyValue() } },
    })]) },
  });
  template.hasResourceProperties('AWS::CloudFront::OriginAccessControl', {
    OriginAccessControlConfig: Match.objectLike({ OriginAccessControlOriginType: 's3', SigningBehavior: 'always', SigningProtocol: 'sigv4' }),
  });
});

test('missing exports remain true 404s and immutable assets survive release changes', () => {
  const template = synth();
  template.hasResourceProperties('AWS::CloudFront::Distribution', {
    DistributionConfig: Match.objectLike({
      DefaultCacheBehavior: Match.objectLike({ ViewerProtocolPolicy: 'redirect-to-https', FunctionAssociations: Match.arrayWith([Match.objectLike({ EventType: 'viewer-request' })]) }),
      CacheBehaviors: Match.arrayWith([
        Match.objectLike({ PathPattern: '_next/static/*' }),
        Match.objectLike({ PathPattern: 'media/*' }),
        Match.objectLike({ PathPattern: 'blog-imports/*' }),
      ]),
      CustomErrorResponses: [
        { ErrorCachingMinTTL: 5, ErrorCode: 403, ResponseCode: 404, ResponsePagePath: '/404.html' },
        { ErrorCachingMinTTL: 5, ErrorCode: 404, ResponseCode: 404, ResponsePagePath: '/404.html' },
      ],
    }),
  });
  const resources = template.findResources('AWS::CloudFront::Distribution');
  const distribution = Object.values(resources)[0].Properties.DistributionConfig;
  const rootOrigin = distribution.Origins.find((origin: { OriginPath?: unknown }) => origin.OriginPath === undefined);
  const releaseOrigin = distribution.Origins.find((origin: { OriginPath?: unknown }) => origin.OriginPath !== undefined);
  assert(rootOrigin);
  assert(releaseOrigin);
  assert.notEqual(rootOrigin.Id, releaseOrigin.Id);
  for (const behavior of distribution.CacheBehaviors) assert.equal(behavior.TargetOriginId, rootOrigin.Id);
  assert.equal(distribution.DefaultCacheBehavior.TargetOriginId, releaseOrigin.Id);
});

test('the direct-deploy template needs no bootstrap parameters, IAM roles or custom resource runtime', () => {
  const template = synth();
  template.resourceCountIs('AWS::IAM::Role', 0);
  template.resourceCountIs('AWS::Lambda::Function', 0);
  assert.equal(template.toJSON().Parameters.BootstrapVersion, undefined);
  assert.equal(template.toJSON().Parameters.ReleaseId.Default, 'initial');
  assert.equal(template.toJSON().Outputs.ActiveReleaseId.Value.Ref, 'ReleaseId');
});

test('custom domains require an existing us-east-1 certificate', () => {
  const app = new App();
  assert.throws(() => new WebsiteStack(app, 'MissingCertificate', { domainNames: ['danielgaio.com'] }), /existing ACM/);
  assert.throws(() => new WebsiteStack(app, 'WrongRegion', {
    domainNames: ['danielgaio.com'], certificateArn: 'arn:aws:acm:sa-east-1:123456789012:certificate/abcdef',
  }), /us-east-1/);
});
