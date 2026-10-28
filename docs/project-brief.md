# DanielGaio.com project context

Owner: Daniel Gaio. Requirements established October 27, 2026; accepted changes are maintained in the [GitHub project brief](https://github.com/danielgaio/danielgaio.com-frontend/issues/5) and relevant issues. This document supplies engineering/product context, not a second backlog.

## Outcomes

The homepage is Daniel's professional portfolio and personal landing page: his story in his own voice, an expanded CV, selected projects and verifiable accomplishments. The audience includes prospective employers and engineering interviewers at companies building large-scale products. Add a blog containing existing Medium posts and future writing. Daniel chose English as the default with a Portuguese switch on October 27, 2026. Preserve equivalent-page switching and handle articles without a translation explicitly. Use current facts supplied or confirmed by Daniel; old scaffold biography is draft copy.

Daniel asked to replace the computer-vision research feature with another part of ProsperSync. The current content draft leads with financial-services engineering and two distinct ProsperSync stories: image/voice expense capture, and AI-backend integration and delivery automation. Treat the latter as a portfolio case study of existing work; it does not change this website's TypeScript/Node.js stack or AWS infrastructure choice. Track current copy and remaining evidence in [portfolio issue #7](https://github.com/danielgaio/danielgaio.com-frontend/issues/7) and [content PR #17](https://github.com/danielgaio/danielgaio.com-frontend/pull/17). No production-scale or adoption claim follows from the existence of source code or deployment workflows.

Practical AWS experience is an equally valid outcome. Learning can justify complex services even when website traffic does not require them. Build exercises Daniel can operate, inspect, explain and demonstrate around security, distributed systems, scaling, resilience and observability. Record observed results and distinguish experiments from production-scale experience.

## Stack and repository

TypeScript and Node.js are confirmed. Daniel accepted a pnpm monorepo using this existing repository as its base, retaining existing GitHub planning links and both code histories. PR #14 merged with a merge commit on October 27, 2026. `apps/web` now builds the English/Portuguese static portfolio and migrated public blog. `apps/api` retains the unfinished NestJS application and does not need a paid runtime for this launch. `packages/contracts` is the shared public-contract boundary; `infra` defines private S3/CloudFront hosting and recoverable releases. See [the deployment guide](aws/deployment.md). Daniel authorized reviewed merges and the current launch in chat; authenticated AWS inventory and actual deployment must still be verified.

## AWS and costs

Use AWS for the website's application infrastructure and production operations; prefer AWS-native build/deployment tools. GitHub source control and project management are chosen explicitly. Clarify whether editing/development environments must also run in AWS before choosing that environment.

The initial **total AWS target is US$10/month**, including production and learning exercises. Inspect current regional prices, fixed charges, logs/storage and existing resource usage before provisioning. Do not assume credits or Free Tier eligibility. Use bounded, reproducible experiments when always-on services will not fit and verify teardown. A budget alert is delayed tracking, not a guaranteed hard cutoff.

Daniel has an AWS account and wants website account/cost separation where practical. The organization, workload account, region and current resource/cost footprint require authenticated discovery; no website account, budget or resources were created by this migration.

## Domain and Medium

DanielGaio.com currently serves Daniel's Medium profile. The initial DNS lookup returned `dns3.hostgator.com.br` and `dns4.hostgator.com.br`; verify registrar ownership, the actual DNS zone and mail/subdomain dependencies through authorized access. Daniel recalls buying the domain through HostGator.

The observed public profile archive contains 20 articles (4 English, 16 Portuguese), recovered from the public RSS and rendered article bodies, with 80 local images and 68 encoded/decoded/slash legacy URL variants. [The archive inventory](../content/blog/inventory.json) and captured sources record provenance and limitations. This is not a verified account ZIP export: private/unlisted/draft content and membership dates still require the correct Daniel Gaio Medium account. The visible Medium session belonged to ProsperSync. Do not use it for Daniel's export or cancellation. Native Medium links redirect to the custom domain, so unknown paths must not fall back to Medium and loop. Validate the AWS preview and known old paths before cutover; preserve unrelated DNS with a recoverable routing plan.

End the annual Medium subscription with renewal and paid-through dates in view. Disabling renewal before launch can be appropriate if access lasts long enough. No content deletion, membership cancellation or DNS change is part of repository consolidation.

## Working visibility

Use [the GitHub Project](https://github.com/users/danielgaio/projects/2), its board/roadmap and linked issues for plans and work status. Daniel can comment and add tasks there. Keep the **🌐 DanielGaio Website** Chrome group open with the project, primary repository, relevant PR/site/AWS/domain pages and the original backend repository while it remains useful. Reuse the group and preserve **ProsperSync Dev**.
