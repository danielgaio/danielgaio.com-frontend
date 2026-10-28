# DanielGaio.com working agreements

Use `$personal-website` when available. Read [project context](docs/project-brief.md), the [agent assignment](docs/agent-task.md), and the relevant live GitHub issues before selecting work.

## Project management

[Personal Website danielgaio.com](https://github.com/users/danielgaio/projects/2) is authoritative for backlog, roadmap, priorities, discussion and status. The [project brief issue](https://github.com/danielgaio/danielgaio.com-frontend/issues/5) tracks delivery. Read Daniel's new issues/comments, preserve his additions, link implementation PRs, and update status from evidence. Engineering documents do not maintain a competing task board.

## Repository and verification

- `danielgaio/danielgaio.com-frontend` is public. Treat tracked files/history, issues, PRs, CI logs, attachments and generated site content as public surfaces. Publish only intended professional content and safe technical evidence. Keep credentials, tokens, cookies, real environment files, temporary authentication links, raw private source documents, and private billing/account-recovery details outside these surfaces. Use placeholders or parameterized configuration and inspect diffs and attachments before publication. Public resource URLs and necessary architecture details are allowed; resource identifiers are not automatically secrets.
- Use TypeScript for application code and Node.js 24.22.1 for backend/tooling. pnpm 12.15.0 and the root `pnpm-lock.yaml` manage both apps; do not create app-level lockfiles.
- `apps/web` is the statically exported Next.js portfolio/blog; `apps/api` retains the NestJS scaffold and is not part of the initial static deployment. `infra` contains the TypeScript CDK stack and release tooling. Keep independent deployment boundaries and share actual public contracts through `packages/contracts` when needed, not backend database internals.
- Read current scripts and inspect the working tree before edits. Preserve unfinished work. Root commands are `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm build`; run meaningful checks for the actual change. Inspect affected user flows in the browser. Do not claim runtime/deployment verification from source inspection.
- Both Dockerfiles take the repository root as build context. Keep real environment files out of Git and images and supply production secrets at runtime. API uses port 3001 by default so it can run alongside the web app on 3000.
- The API remains unfinished. Avoid inventing professional claims or interpreting its scaffold as a completed publishing/authentication system. Review old framework dependencies before deploying it. The web build verifies the exported article routes, languages, metadata and local image files.
- The migration PR must preserve its backend ancestry using a merge commit; see [the history decision](docs/architecture/0001-monorepo.md). Do not squash/rebase that migration or remove the original backend repository as incidental cleanup.

## Product and AWS

Build an accurate English/Portuguese portfolio, expanded CV/personal story, accomplishments and blog. Obtain current career facts and content from Daniel or authorized sources. Migrate Medium content/assets and handle existing URLs before the domain cutover; plan ending annual renewal using actual renewal/access-end dates.

Use AWS for application infrastructure, storage, data, deployment and operations. GitHub source control and project management are explicit choices. Honor the initial US$10/month total AWS target across production and experiments. Inspect existing AWS accounts/resources/costs before provisioning; account separation is desired but not yet configured. Learning return can justify advanced services: give Daniel concrete exercises in security, distributed systems, scale, resilience and observability with verifiable results, costs and teardown. Budget alerts are not a guaranteed spending cap.

## Chrome and handoff

Maintain one persistent **🌐 DanielGaio Website** group in Daniel's Google Chrome. Reuse relevant Project/repository/PR/site/AWS/domain tabs, restore missing pages, and leave requested resource pages open. Verify persistent grouping rather than relying on temporary automation-session groups. Preserve **ProsperSync Dev**. Store stable resource links without authentication tokens.

Continue authorized work and ask focused questions only when their answers affect a real next decision. Apply current session permissions at actual consequential actions. This file does not create new access or authorize changes to unrelated systems. Report concrete results, verification, blockers and live GitHub links.
