# Learning exercise: a private origin behind a public CDN

This exercise is [learning task #22](https://github.com/danielgaio/danielgaio.com-frontend/issues/22), under [the AWS learning track #12](https://github.com/danielgaio/danielgaio.com-frontend/issues/12). It answers a practical question: how can visitors read a public website while its S3 content remains private?

Use the existing website resources. The CloudFront preview hostname and production names share one distribution and release; the preview is **not isolated staging**. This exercise does not upload files, publish releases, invalidate caches, change access or DNS, create resources, generate load, or wait for cache expiry. A visible-change or rollback experiment needs a genuine release/recovery task or a separately justified isolated environment.

## Run it

Use Node.js 24 and the repository's pnpm version. Use an existing temporary AWS session that can read the selected stack, bucket tags and object metadata; do not create access keys or add permissions for this exercise. If access is denied, stop and inspect the existing access arrangement.

```sh
pnpm --filter @danielgaio/infra learn:origin-cache \
  --expected-account YOUR_VERIFIED_ACCOUNT_ID \
  --region us-east-1 \
  --stack DanielGaioWebsite
```

Replace the account placeholder locally with the verified account ID. `AWS_PROFILE` selects an existing profile. If the authorized CLI is a task-local executable or wrapper, set `AWS_CLI_BIN` to its path; otherwise the command uses `aws` from `PATH`. The verifier does not start a login or create credentials; the CLI may refresh an existing temporary session within its approved duration. Use normal authorized console sign-in separately if that session has expired. Keep account IDs, credentials and raw CLI diagnostics out of public examples.

The command first checks the expected account, a completed stack, the website Project tag and the active release. It uses authenticated object metadata to prove the selected HTML object exists, then compares unsigned S3 access with CloudFront delivery. It observes the HTML twice and one shared hashed asset discovered in that HTML, checking the selected asset's metadata before fetching it. AWS lookups and HTTP requests have time/size limits, redirects are rejected, and the command has no scripted retries.

## What to inspect and explain

1. **The known object exists, but unsigned S3 access is denied.** A denial alone could otherwise hide a wrong key. Authenticated metadata makes this a useful check of one real object. CloudFront's origin access control signs origin requests, while the bucket policy permits reads for the selected distribution. Public visitors do not receive the operator's AWS credentials. See [AWS's OAC explanation](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/private-content-restricting-access-to-s3.html).
2. **CloudFront delivers the page through that private origin.** The report checks successful HTML delivery, expected English content, object length and the entity tag from authenticated S3 metadata. This is evidence for this route and object, not an audit of every bucket object or access policy.
3. **HTML and hashed assets have different freshness needs.** This website's HTML uses `max-age=0` for browser freshness and `s-maxage=60` for shared-cache reuse. Shared hashed assets have long immutable caching so an already-open page can still retrieve its bundles after a later release. CloudFront cache-policy TTLs also affect expiry; origin headers alone do not describe every distribution setting. See [AWS cache expiration](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Expiration.html).
4. **Record the actual cache observations.** Inspect `x-cache`, `age`, `cache-control` and the edge location where present. A warm edge can return Hit immediately; an expired cached object may be revalidated and reported as RefreshHit. Different edges or timing can produce different observations. The exercise does not require “first Miss, then Hit,” force a cache miss, or demonstrate production-scale performance. Compare [AWS's cache result classifications](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/standard-logs-reference.html).

You can also inspect the existing distribution's cache behaviors and S3 origin configuration in the resource tabs kept in the website's Chrome group. Do not save configuration changes while following this read-only exercise.

## Cost and stopping conditions

Reserve **US$0.01 per run** inside the total US$10/month target. The planned successful path makes five AWS metadata reads and four explicit unsigned HTTP probes, with no new always-on service, build, invalidation, log destination or paid monitoring configuration. Metadata calls include the two S3 object HEAD requests; cache misses can add origin reads. Repeated runs still consume requests and transfer, and any existing account-level logging charges remain part of the total budget.

The unsigned S3 probe is HEAD; the application limits each HTML body to 1 MiB and the shared asset to 4 MiB. A conservative model allows 8 MiB of aggregate response data at US$0.12/GB, three South America HTTPS requests, three function executions and ten S3 operations priced at the higher PUT/LIST rate. Using decimal GB, that is approximately **US$0.001064** before tax and other account activity, without credits, free allowances or cache-hit savings. The US$0.01 reservation leaves room for overhead. Current rates were checked on October 28, 2026 against [CloudFront PAYG](https://aws.amazon.com/cloudfront/pricing/pay-as-you-go/), the [US East S3 catalog](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonS3/current/us-east-1/index.json) and the [transfer catalog](https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/us-east-1/index.json).

This is a usage estimate, not a hard spending limit. Client-side size limits cannot retract bytes a server already sent. The tool rejects known oversized objects before downloading them and limits its reads, but actual billed transfer and delayed account totals remain separate observations.

Stop on an identity/tag/stack mismatch, missing or oversized object, unexpected public S3 access, redirect, failed content/cache check, timeout or unavailable permission. Do not “repair” a failing check by making the bucket public, disabling TLS validation, changing the production policy or expanding IAM access. Record the concrete result for a separate reviewed fix.

## Results and cleanup

The report contains only the selected operational observations; it omits account/ARN identifiers, credentials, private billing data and raw AWS errors. Record the observed run time and cache behavior in #22 after a real run. A passing local unit test is not live AWS evidence.

The first real run completed on **October 28, 2026 at 14:02 UTC** against release `initial`, using the existing authorized temporary session:

| Observation | Result |
| --- | --- |
| Existing English S3 object, unsigned HEAD | 403; authenticated metadata had already confirmed it exists |
| First CloudFront HTML response | 200; 39,335 bytes; S3 entity tag matched; RefreshHit |
| Second ordinary HTML response | 200; same body hash and entity tag; Hit |
| Selected shared CSS asset | 200; 20,082 bytes; entity tag matched; Hit; `max-age=31536000,immutable` |
| Explicit HTTP probes | Four; no cache busting, invalidation or resource changes |

The responses used edge `EZE50-P6`. The HTML responses did not include an Age header; this is recorded as missing, not zero. The asset's observed age was 13,258 seconds. The application read 98,752 response-body bytes; this is not an invoice measurement or proof that all billed network bytes were counted. The result demonstrates this small security/cache check, not load capacity or a live rollback. Private raw diagnostics and the separate budget check remain outside the repository.

No exercise resources, objects, triggers or log destinations are created, so there is no cloud teardown. Preserve the existing website and its recoverable release. Local reports can be retained privately; publish only a sanitized learning summary. Check actual cost attribution later when billing data and the Project cost-allocation tag become available.
