# AWS launch and release record

The portfolio and observed public blog archive are deployed to AWS. Production serves [DanielGaio.com](https://danielgaio.com/en/) and [www](https://www.danielgaio.com/en/), with English as the default and Portuguese switching. The independent AWS endpoint is [the CloudFront preview](https://d2tj44rrzcwnln.cloudfront.net/en/).

## Current release — Curiosity in Motion, October 29, 2026

Daniel approved publication of the selected anime redesign. [PR #24](https://github.com/danielgaio/danielgaio.com-frontend/pull/24) was technically reviewed at `d853d68e9e07f2f49aba7947005889d62e7a9b66` and merged as `01f84449ad2e42981fd4ee75f3f829d67197ec16`, with the same source tree. Technical APPROVE is a commit-anchored COMMENT review because the connected account is the author; it is not formal GitHub approval.

The existing AWS release helper published **`git-d853d68`**, replacing **`initial`**. CloudFormation is `UPDATE_COMPLETE`; the distribution-deployed and invalidation-completed waiters passed. The current content origin is `/releases/git-d853d68`. This is a content release on existing infrastructure, with no new hosting service, IAM access or DNS change. The previously verified export was reused without another build. A clean staging copy excluded generated conflict-name duplicates; 277 intended files (22,990,537 bytes) were hashed before upload.

An independent normal-DNS/TLS audit completed at **13:55 UTC** with **zero failures in 678 route checks**, 226 each on apex, www and CloudFront. Each host passed all 20 article bodies, 68 legacy aliases, 80 imported image hashes, 13 current Next assets, nine anime WebPs, bilingual pages, RSS, query behavior and true 404s. MIME/security/cache policies, six cache probe groups and three HTTP-to-HTTPS redirects passed. Direct unauthenticated access to the new S3 release returned 403. [Sanitized verification record](anime-release-verification.json).

Live Chrome checks on www passed English/Portuguese switching, 1440×900 desktop and 390×844 mobile layouts without horizontal page overflow, mobile navigation/Escape, moving foliage, manual pause/resume, loaded images and empty error logs. The viewport override was reset. The implementation’s OS reduced-motion and hidden-tab handling remain source-reviewed limits; no additional runtime emulation is claimed. See [design QA](../../design-qa.md) for the earlier source and local visual checks.

The existing account-wide US$10 monthly budget, actual 85%/100% and forecast 100% alerts and email subscribers were reverified; reported month-to-date spend was within the target, subject to billing delay. Billing now exposes the **Project** cost-allocation tag: activation returned no errors and a separate read confirmed **Active**. This activation did not itself prove attributed usage; the October 31 follow-up below records the first successful attribution check. No private bill amounts or subscribers are published.

Recovery uses the retained `initial` release through the account-guarded `release activate` command in [the deployment guide](deployment.md). Both releases and shared assets were retained. No live rollback exercise was performed and no DNS change is needed for a content rollback. Independent learning PR #23 remains separate.

## Cost attribution verified — October 31, 2026

After Daniel completed normal sign-in, the temporary CLI session was refreshed through the existing account and its identity was checked. Read-only Cost Explorer queries returned daily Project/service groups for October 29–31 and an account-wide monthly service breakdown for October 1–31 (both end dates are November 1, exclusive). Neither response had a remaining page. All returned periods are **estimated**, including the incomplete current day; this is reported billing data rather than a finalized invoice or a future spending guarantee.

`Project=DanielGaioWebsite` now appears for S3, Route 53 and CloudFront. S3 and Route 53 have nonzero attributed costs; CloudFront's tagged entries currently report zero cost. Untagged entries also remain. The tagged subtotal is therefore not a complete website or account total: retain untagged/shared charges and tax in the account-wide budget check, without assigning every untagged charge to the website. Reported October account-wide unblended cost, including tax, was within the US$10 monthly target when read.

The existing account-wide US$10 monthly budget and email subscriptions were read back. The actual 85%/100% and forecast 100% alerts remain configured; alerts are delayed and do not enforce a hard cap. [Sanitized evidence](cost-attribution-verification.json) records the periods, checks and limits without private bill amounts, account identifiers, recipients or authentication details. This completes #6's remaining actual-attribution gate. Future provisioning or learning exercises still require a fresh total-cost check; repeat hourly billing queries are unnecessary while state is unchanged. This follow-up changed no AWS resources, billing configuration, cost-allocation tags or production release.

## Initial launch — October 28, 2026

Delivery: [preview #8](https://github.com/danielgaio/danielgaio.com-frontend/issues/8), [domain launch #10](https://github.com/danielgaio/danielgaio.com-frontend/issues/10), and [account/budget #6](https://github.com/danielgaio/danielgaio.com-frontend/issues/6). The release reuses the verified export whose application sources match main at `3cbe6afd05fa183c9db1ec1c3d3a8a97c4991139`; its release ID is `initial`. Subsequent documentation commits do not rebuild or change that export.

## Deployed resources and access

- CloudFormation stack `DanielGaioWebsite`, origin region `us-east-1`, creates the private versioned S3 bucket, CloudFront distribution, two origin access controls, cache policy and routing function. Stack outputs identify the content bucket, distribution, active release and preview endpoint.
- CloudFront uses pay-as-you-go pricing. At initial launch the content origin was `/releases/initial`; shared hashed assets remain outside the release prefix. The API scaffold is not deployed. No server, database, CDK bootstrap resources or new IAM deployment role were created.
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

The independent public-domain audit completed at 12:46 UTC using normal DNS and certificate validation, with zero failures across 197 paths: all 20 article bodies, 68 legacy redirects, 80 image hashes and nine Next.js assets passed, along with feed, robots/sitemap, both languages, queries and 404 checks. Both apex and www served matching portfolio bodies. The system resolver, Cloudflare and Google returned Route 53/CloudFront routing. The observed archive contains 20 public posts, not a claimed complete Medium account export. The later personal-account reconciliation matched all 20 published IDs. Daniel retained three private drafts and originals on free Medium and waived further ZIP handling; no full account export is claimed. Annual renewal was disabled on the verified personal account, and #9/#11 are complete.

## Cost and recovery

The existing account-wide US$10 monthly cost budget was verified, with email subscribers for actual-spend alerts at 85% and 100%, plus a 100% forecast alert. It is a delayed alert, not a hard spending cap. Private bill amounts and recipient addresses are not published here.

Current official catalog rates still match [the cost scenario](cost-scenario.json). The implemented S3/CloudFront scenario is approximately US$1.553/month, plus US$0.50 for the public DNS zone, before applicable allowances, tax and existing usage. The broader scenario including small build/log/monitoring exercises and non-alias DNS queries remains US$2.746/month. Those quantities are estimates, not enforced usage limits; build and monitoring resources in that scenario were not provisioned by this launch. At initial launch billing did not yet expose the Project cost-allocation tag. It was activated on October 29; the October 31 follow-up section verifies actual attributed entries under #6.

Content releases and object versions are retained. See [deployment and recovery](deployment.md) for a later release/activation using the verified account guard. An actual content rollback exercise has not been performed on this first release.

A private DNS rollback batch restores the original apex/www A destinations and deletes both new AAAA aliases, leaving mail/FTP and certificate validation intact. This Route 53 record rollback is the available primary recovery path. A nameserver reversal requires restoring and verifying the old authoritative zone first, and delegation caches can outlive record changes. Retain the private original-record backup and Medium membership while migration and recovery follow-ups remain open. Daniel closed his manual backend-retirement task #15; the agent did not delete that repository. Preserve the backend history imported into the monorepo.
