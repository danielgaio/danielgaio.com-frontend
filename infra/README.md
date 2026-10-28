# AWS static website infrastructure

This TypeScript CDK package synthesizes a directly deployable CloudFormation template for the public portfolio/blog: one private, encrypted, versioned S3 bucket and an HTTPS CloudFront distribution with origin access control. It creates no application server, database, NAT gateway, paid WAF plan, IAM role, Lambda custom resource or account.

Use Node.js 24.22.1 and the repository's pnpm 12.15.0:

```sh
pnpm --filter @danielgaio/infra typecheck
pnpm --filter @danielgaio/infra test
pnpm --filter @danielgaio/infra synth
```

The template is written to `infra/cdk.out/DanielGaioWebsite.template.json`. Synthesis and tests make no AWS API calls. There are no CDK file assets or bootstrap-version requirements; an authorized operator can deploy the template directly with existing CloudFormation permissions. The release helper uses the AWS CLI and validates the account and website bucket tag before changing releases.

Read [the deployment and rollback guide](../docs/aws/deployment.md) before deployment. The code does not establish working credentials, an account/cost inventory, budget alerts or domain ownership. The US$10/month target includes production and experiments; current usage must be inspected before provisioning. The [priced foundation proposal](../docs/aws/foundation-plan.md) records the assumptions rather than a guaranteed bill.

The distribution uses an immutable `releases/<ReleaseId>/` origin directory. Hashed Next.js bundles and blog/media assets have separate shared origins so already-open pages retain access to old hashes during release changes. Never reuse a release ID or overwrite a hashed asset with different content. Missing pages keep a real 404 status. Known article paths are redirected through the reviewed `content/blog/redirects.json` map; unverified Medium fallback redirects are deliberately absent.

Optional custom domains require `WEBSITE_DOMAIN_NAMES` and an existing verified `WEBSITE_CERTIFICATE_ARN` in `us-east-1` at synthesis time. This package does not change DNS or request a new certificate. Root-domain routing should move only after preview, content/URL reconciliation, certificate and DNS recovery checks pass.
