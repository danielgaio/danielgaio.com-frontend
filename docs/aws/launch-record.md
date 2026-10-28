# AWS launch record — October 28, 2026

The portfolio and observed public blog archive are deployed to AWS. Production serves [DanielGaio.com](https://danielgaio.com/en/) and [www](https://www.danielgaio.com/en/), with English as the default and Portuguese switching. The independent AWS endpoint is [the CloudFront preview](https://d2tj44rrzcwnln.cloudfront.net/en/).

Delivery: [preview #8](https://github.com/danielgaio/danielgaio.com-frontend/issues/8), [domain launch #10](https://github.com/danielgaio/danielgaio.com-frontend/issues/10), and [account/budget #6](https://github.com/danielgaio/danielgaio.com-frontend/issues/6). The release reuses the verified export whose application sources match main at `3cbe6afd05fa183c9db1ec1c3d3a8a97c4991139`; its release ID is `initial`. Subsequent documentation commits do not rebuild or change that export.

## Deployed resources and access

- CloudFormation stack `DanielGaioWebsite`, origin region `us-east-1`, creates the private versioned S3 bucket, CloudFront distribution, two origin access controls, cache policy and routing function. Stack outputs identify the content bucket, distribution, active release and preview endpoint.
- CloudFront uses pay-as-you-go pricing. The content origin is `/releases/initial`; shared hashed assets remain outside the release prefix. The API scaffold is not deployed. No server, database, CDK bootstrap resources or new IAM deployment role were created.
- A non-exportable ACM certificate in `us-east-1` is issued for both apex and www. Both hosts serve the site; canonical metadata uses the apex. HTTP redirects to HTTPS and `/` redirects to `/en/`.
- After considering a separate member account, Daniel explicitly selected the existing account for this launch. No new AWS account was created. Resources use `Project=DanielGaioWebsite` and `Environment=production` tags. This is resource attribution, not account isolation.
- Deployment used the existing operator identity through AWS CLI console sign-in and temporary credentials. Credentials, private account/billing evidence and authentication links remain outside the repository.

## DNS cutover and preserved destinations

HostGator's authenticated portal confirmed control of the registered domain and its complete existing user-record list. Original delegation was `dns3.hostgator.com.br` / `dns4.hostgator.com.br`. Before cutover the zone held apex/www A records, mail/FTP aliases to the apex and an MX record targeting the apex; no TXT records were present. The complete original record view was backed up privately before the nameserver change.

Both ACM validation CNAMEs were added at HostGator, verified publicly and retained in the new Route 53 zone. After HTTPS and preview verification, apex/www A and AAAA aliases were configured for CloudFront, then registrar delegation was replaced with all four assigned Route 53 nameservers:

```text
ns-2005.awsdns-58.co.uk
ns-381.awsdns-47.com
ns-961.awsdns-56.net
ns-1216.awsdns-24.org
```

The authenticated email-product list showed no active DanielGaio.com email product. Because Daniel was unsure whether domain email was used, mail and FTP were decoupled from the website: both now retain the former apex IPv4 destination `162.159.152.4`, with MX `0 mail.danielgaio.com.`. This preserves observed destinations; it does not establish a working mail/FTP service. Other records were preserved. Registration and Medium membership were not transferred or canceled.

The registrar reported successful configuration. The `.com` parent and public recursive resolvers returned the new delegation and CloudFront addresses. After the change, both former HostGator nameservers returned `REFUSED`; the old authority no longer serves the zone. Prior web records had four-hour TTLs and parent delegation a 48-hour TTL. Cached old website addresses may still reach Medium, while stale delegation may cause temporary DNS failures; successful current probes do not establish completion for every cached client. The new alias responses have 60-second TTLs.

## Verification evidence

Independent live HTTPS probes against CloudFront verified:

- All 20 article HTML bodies and 80 image hashes match the verified export.
- All 68 known legacy path variants redirect correctly, including accented Portuguese paths and trailing slashes.
- Nine Next.js assets match, with correct content types and immutable caching.
- English/Portuguese routes, root/feed redirects, query preservation, target responses and genuine 404s pass without loops.
- `/feed.xml` is valid `application/xml`, with 20 items and 80 canonical image references.
- HTTPS, security headers and observed cache hits pass. Direct unauthenticated S3 access returns 403 with all four S3 public-access blocks enabled.

Before delegation, strict TLS probes preserving the production Host/SNI verified apex and www for both languages, feed, a Portuguese legacy URL, root redirect and missing-page 404. The certificate covers both hostnames. Browser checks verified the deployed portfolio, Portuguese switching and the www production page. Existing mobile layout verification preceded deployment; the browser viewport override did not affect the target tab, so no new mobile-browser pass is claimed for this launch.

The independent public-domain audit completed at 12:46 UTC using normal DNS and certificate validation, with zero failures across 197 paths: all 20 article bodies, 68 legacy redirects, 80 image hashes and nine Next.js assets passed, along with feed, robots/sitemap, both languages, queries and 404 checks. Both apex and www served matching portfolio bodies. The system resolver, Cloudflare and Google returned Route 53/CloudFront routing. The observed archive contains 20 public posts, not a claimed complete Medium account export. Private/unlisted/draft inventory and membership dates remain open under #9 and #11.

## Cost and recovery

The existing account-wide US$10 monthly cost budget was verified, with email subscribers for actual-spend alerts at 85% and 100%, plus a 100% forecast alert. It is a delayed alert, not a hard spending cap. Private bill amounts and recipient addresses are not published here.

Current official catalog rates still match [the cost scenario](cost-scenario.json). The implemented S3/CloudFront scenario is approximately US$1.553/month, plus US$0.50 for the public DNS zone, before applicable allowances, tax and existing usage. The broader scenario including small build/log/monitoring exercises and non-alias DNS queries remains US$2.746/month. Those quantities are estimates, not enforced usage limits; build and monitoring resources in that scenario were not provisioned by this launch. The new Project cost-allocation tag is not yet listed by billing and must be activated when AWS exposes it; #6 remains open for that attribution check.

Content releases and object versions are retained. See [deployment and recovery](deployment.md) for a later release/activation using the verified account guard. An actual content rollback exercise has not been performed on this first release.

A private DNS rollback batch restores the original apex/www A destinations and deletes both new AAAA aliases, leaving mail/FTP and certificate validation intact. This Route 53 record rollback is the available primary recovery path. A nameserver reversal requires restoring and verifying the old authoritative zone first, and delegation caches can outlive record changes. Retain the private original-record backup and Medium membership while migration and recovery follow-ups remain open. Daniel closed his manual backend-retirement task #15; the agent did not delete that repository. Preserve the backend history imported into the monorepo.
