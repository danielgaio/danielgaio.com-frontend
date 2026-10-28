# Deploy and recover the AWS website

This guide describes prepared infrastructure and release tooling. A successful synthesis or test is not evidence of deployment. Record the actual stack, distribution, bucket, preview URL and verification in the linked GitHub work item after an operator performs these steps.

## Architecture and boundary

`infra/` synthesizes a private S3 origin with Block Public Access, SSE-S3 encryption, bucket-owner-enforced ownership, TLS-only access and versioning. A CloudFront OAC signs origin requests and its bucket permission is scoped to the distribution. CloudFront redirects HTTP to HTTPS and `/` permanently to `/en/`; a small viewer function resolves exported directory indexes and known old article paths. Missing origin objects become a `404` response with the exported `404.html`, never a successful SPA fallback. [OAC documentation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html)

The origin path is `releases/<ReleaseId>`. The `_next/static/*`, `media/*` and `blog-imports/*` cache behaviors use a shared root origin for content-hashed assets. That keeps an already-open page's old bundles/images available after a new release or rollback. HTML has short cache lifetimes; immutable assets have long lifetimes. Each activation invalidates `/*` once because changing an origin path does not itself change existing cache entries. [Cache expiration](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html)

The template creates no IAM roles, Lambda runtime/custom resource, CDK asset store, application server, database or paid WAF configuration. No CDK bootstrap step is required for this template's **direct CloudFormation deployment**. It also does not create budget notifications, an AWS build project, access-log delivery or monitoring alarms; those need their separate scoped configuration and verification. Basic CloudFront service metrics remain available. Keep build/log/experiment costs in the total US$10 monthly target and verify actual existing usage first.

## 1. Verify the selected account and export

Use the existing authorized AWS sign-in, never a new access key merely to run this guide. Confirm identity, workload account/organization arrangement, resources/current costs, region and budget setup. Default origin region is `us-east-1`; CloudFront viewer charges depend on viewer location. Account separation and alert recipients must be real observed choices rather than inferred from the speech transcription.

Run the repository checks appropriate to the launch and produce `apps/web/out` with English/Portuguese routes and a real `404.html`. Reconcile original article URLs and required images before changing DanielGaio.com DNS. A feed's latest posts are not proof of a complete Medium archive.

```sh
aws sts get-caller-identity
pnpm --filter @danielgaio/web build
pnpm --filter @danielgaio/infra typecheck
pnpm --filter @danielgaio/infra test
pnpm --filter @danielgaio/infra synth
```

The first template uses the AWS-provided CloudFront hostname. Optional custom hostnames are configured only with an existing verified certificate:

```sh
WEBSITE_DOMAIN_NAMES=danielgaio.com,www.danielgaio.com \
WEBSITE_CERTIFICATE_ARN=arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERTIFICATE_ID \
WEBSITE_STAGE=production \
pnpm --filter @danielgaio/infra synth
```

Replace placeholders with the verified account/certificate before using that optional command. [CloudFront certificate requirements](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html)

## 2. Create the preview stack

Review the synthesized template and intended changes. The command below uses an existing operator identity; it does not create deployment roles or expand that identity's access. No `CAPABILITY_IAM` is needed for these resources.

```sh
aws cloudformation deploy \
  --region us-east-1 \
  --stack-name DanielGaioWebsite \
  --template-file infra/cdk.out/DanielGaioWebsite.template.json \
  --parameter-overrides ReleaseId=initial \
  --tags Project=DanielGaioWebsite Environment=preview \
  --no-fail-on-empty-changeset
```

CloudFront takes time to deploy. The new preview may serve its intentional 404 until the first export is uploaded. Do not point the production domain at an empty or unverified preview. An existing stack's template update must preserve its current `ReleaseId` rather than resetting to `initial`.

## 3. Publish the first release, then verify it

Replace `ACCOUNT_ID` with the account ID already verified above. The helper checks it, verifies the project's bucket tag and required exported pages, rejects environment files/symlinks, refuses to overwrite an existing release prefix, uploads a full release and shared assets, then activates the release. It does not delete old objects. CloudFormation and CloudFront waiters may take several minutes.

The helper uses `aws` from `PATH`, or an explicit executable path in `AWS_CLI_BIN`. It inherits the operator's selected `AWS_PROFILE` and supported temporary-session authentication; no credentials are placed in command arguments or source files.

```sh
pnpm --filter @danielgaio/infra release publish \
  --expected-account ACCOUNT_ID \
  --region us-east-1 \
  --release initial
```

For subsequent releases, use a new lowercase release identifier, such as `git-<commit-sha>`. The helper reports both active and prior release IDs and the preview URL. Capture those in the deployment record without credentials. Validate:

- The preview serves English by default, Portuguese switching, correct deep links, images and both desktop/mobile navigation.
- Every inventoried legacy article path redirects to its intended local article; encoded Portuguese paths and trailing-slash variants work.
- A random missing path returns HTTP 404 rather than a homepage or 200 response.
- Direct S3 object access is denied while CloudFront succeeds, and HTTPS/security headers and cache behavior are observable.
- No editorial intake prompts, private résumé data, unverified current-role labels or invented metrics are public.

Known legacy redirects are exact paths, normalized only for URI encoding and a trailing slash. Conflicting mappings or a viewer-function body over 10 KB fail synthesis rather than silently dropping paths. Unknown old-looking paths do not redirect to Medium: the native Medium URL may redirect back to the custom domain, creating a loop. Resolve archive completeness or verify an independent fallback before production cutover.

## 4. Domain routing and recovery

Before DNS changes, inspect and save the authoritative zone, records and TTLs; preserve mail/TXT/subdomains. Verify certificate status and exact apex/www routing. HostGator DNS authority does not by itself establish registrar ownership. If moving DNS to Route 53, copy the complete zone and validate it before switching nameservers; registrar transfer is unnecessary for AWS hosting.

Test the preview first, then change only the intended records through authorized access. Verify the real domain, HTTPS, both languages, existing articles and assets after propagation. Retain the original record values and paid Medium access until migration/recovery requirements pass. Do not cancel Medium membership or delete the legacy backend repository as incidental deployment cleanup.

## Roll back a release

Use the prior release ID reported by a successful publish. The helper verifies the archived export before updating the CloudFront origin and invalidating cache; shared hashed assets remain available.

```sh
pnpm --filter @danielgaio/infra release activate \
  --expected-account ACCOUNT_ID \
  --region us-east-1 \
  --release PREVIOUS_RELEASE_ID
```

Recheck routes, assets, 404 status and the active release output. Changing the origin path is a distribution update, not instantaneous global consistency. The operator should verify the deployed state and observed behavior, not infer success from submitting an update.

## Costs and cleanup

One activation creates one wildcard invalidation path. Count actual activations, builds, storage versions, retained release prefixes, shared assets, logs and experiments; the proposal's monthly quantities are assumptions rather than enforced limits. No general hard US$10 cap is created by this stack or budget alerts.

The content bucket is retained on stack deletion. Current releases never expire automatically: a blind age rule could delete a still-active website. Noncurrent overwritten object versions expire after 30 days; incomplete multipart uploads abort after one day. Review storage and remove obsolete release prefixes/shared hashes only after proving that neither the active nor retained recovery releases reference them. Deleting the stack alone does not prove retained storage is gone. Teardown requires deliberate resource/object/version inspection and later billing reconciliation.
