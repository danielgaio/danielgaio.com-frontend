import {
  CfnOutput, CfnParameter, Duration, RemovalPolicy, Stack, Tags,
  aws_certificatemanager as acm,
  aws_cloudfront as cloudfront,
  aws_cloudfront_origins as origins,
  aws_s3 as s3,
} from 'aws-cdk-lib';
import type { StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { createViewerRequestCode } from './routing.js';
import type { RedirectMap } from './routing.js';

export interface WebsiteStackProps extends StackProps {
  domainNames?: string[];
  certificateArn?: string;
  redirects?: RedirectMap;
  stage?: 'preview' | 'production';
}

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: WebsiteStackProps = {}) {
    super(scope, id, props);
    const domainNames = props.domainNames ?? [];
    if (domainNames.length > 0 && !props.certificateArn) {
      throw new Error('Custom domains require a verified, existing ACM certificate ARN in us-east-1.');
    }
    if (props.certificateArn && !/^arn:aws:acm:us-east-1:\d{12}:certificate\/[a-f0-9-]+$/.test(props.certificateArn)) {
      throw new Error('CloudFront requires an existing ACM certificate ARN in us-east-1.');
    }
    if (domainNames.some((name) => !/^[a-z0-9.-]+$/.test(name))) {
      throw new Error('Custom domain names must be lowercase DNS names.');
    }

    const release = new CfnParameter(this, 'ReleaseId', {
      type: 'String', default: 'initial',
      allowedPattern: '[a-z0-9][a-z0-9-]{0,63}',
      description: 'Previously uploaded immutable release directory under releases/.',
    });

    const content = new s3.Bucket(this, 'Content', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      enforceSSL: true,
      versioned: true,
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
      lifecycleRules: [{ noncurrentVersionExpiration: Duration.days(30), abortIncompleteMultipartUploadAfter: Duration.days(1) }],
    });

    const routing = new cloudfront.Function(this, 'StaticRouting', {
      runtime: cloudfront.FunctionRuntime.JS_2_0,
      code: cloudfront.FunctionCode.fromInline(createViewerRequestCode(props.redirects)),
      comment: 'English entrypoint, exact migrated article redirects, and static directory indexes.',
    });
    const pages = new cloudfront.CachePolicy(this, 'PageCache', {
      minTtl: Duration.seconds(0),
      defaultTtl: Duration.seconds(60),
      maxTtl: Duration.minutes(5),
      enableAcceptEncodingBrotli: true,
      enableAcceptEncodingGzip: true,
      queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
      cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      headerBehavior: cloudfront.CacheHeaderBehavior.none(),
    });
    const releaseOrigin = origins.S3BucketOrigin.withOriginAccessControl(content, {
      originPath: `/releases/${release.valueAsString}`,
    });
    const immutableOrigin = origins.S3BucketOrigin.withOriginAccessControl(content);
    const assetBehavior: cloudfront.BehaviorOptions = {
      origin: immutableOrigin,
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
      cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      compress: true,
    };
    const distribution = new cloudfront.Distribution(this, 'Website', {
      comment: 'DanielGaio.com static portfolio and blog',
      defaultBehavior: {
        ...assetBehavior,
        origin: releaseOrigin,
        cachePolicy: pages,
        functionAssociations: [{ eventType: cloudfront.FunctionEventType.VIEWER_REQUEST, function: routing }],
      },
      additionalBehaviors: {
        '_next/static/*': assetBehavior,
        'media/*': assetBehavior,
        'blog-imports/*': assetBehavior,
      },
      domainNames,
      certificate: props.certificateArn ? acm.Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn) : undefined,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      enableIpv6: true,
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: Duration.seconds(5) },
        { httpStatus: 404, responseHttpStatus: 404, responsePagePath: '/404.html', ttl: Duration.seconds(5) },
      ],
    });
    Tags.of(this).add('Project', 'DanielGaioWebsite');
    Tags.of(this).add('Environment', props.stage ?? 'preview');

    new CfnOutput(this, 'ContentBucketName', { value: content.bucketName });
    new CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new CfnOutput(this, 'PreviewUrl', { value: `https://${distribution.distributionDomainName}/` });
    new CfnOutput(this, 'ActiveReleaseId', { value: release.valueAsString });
  }
}
