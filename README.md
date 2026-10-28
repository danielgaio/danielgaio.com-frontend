# DanielGaio.com

TypeScript/Node.js monorepo for Daniel Gaio's English/Portuguese professional portfolio and blog, preserving both original Git histories. The Next.js frontend exports a static website with 20 archived public Medium articles and 80 local images. The NestJS API remains an independent, unfinished scaffold. Prepared AWS infrastructure and a local preview are not evidence of a live deployment; see the linked GitHub launch issue for actual status.

## Layout

| Location | Purpose |
| --- | --- |
| `apps/web` | Next.js static portfolio/blog; development and static preview port 3000. |
| `apps/api` | Existing NestJS API scaffold; development port 3001, configurable with `PORT`. |
| `packages/contracts` | Boundary for future shared API contracts; no invented domain API is added by this migration. |
| `infra` | TypeScript CDK definitions for private S3/CloudFront hosting, tested routing and release/rollback tooling. |
| `content/blog` | Public article sources, sanitized content, image manifest and legacy URL map, with provenance and scope limits. |
| `docs` | Engineering context and architecture decisions. |

## Development

Use Node.js 24.22.1 (see `.nvmrc`/`.node-version`) and pnpm 12.15.0. Install pnpm with your Node version manager's tooling or `npm install --global pnpm@12.15.0`.

From the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
pnpm dev
```

Review the API environment example and set a local `JWT_SECRET` before starting it. The static web app does not require runtime secrets or an API connection. Environment files stay outside Git and Docker images. API build, typecheck, development and test commands explicitly generate the Prisma client from its relocated schema; no database migration or connection is required merely to compile this scaffold.

`pnpm dev:web` and `pnpm dev:api` run one app. For the production static preview, run `pnpm --filter @danielgaio/web build` followed by `pnpm --filter @danielgaio/web start`. Articles are generated from the maintained content manifest; the API is not needed for the initial launch.

## Verification

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm check` runs these together. Lint commands do not rewrite files. API tests and the module HTTP smoke test run without a database. `pnpm test` also runs the infrastructure routing/stack/release-safety tests and web feed tests. The web build checks exported routes, languages, headings, metadata, dates, translations and local assets; inspect representative desktop/mobile flows in the browser too. Review the legacy API's dependency posture before deploying it.

## Container builds

Both Dockerfiles use the **repository root** as their build context:

```sh
docker build -f apps/web/Dockerfile -t danielgaio-web .
docker build -f apps/api/Dockerfile -t danielgaio-api .
```

The web container serves only the static export as a non-root user. Initial AWS hosting uses private S3 and CloudFront without an always-on container or API. [The deployment guide](docs/aws/deployment.md) covers account verification, release publication, DNS preparation and rollback within the US$10/month total target. No source-code change proves that resources or DNS have been changed.

## Project management and history

[GitHub Project](https://github.com/users/danielgaio/projects/2), [project brief](https://github.com/danielgaio/danielgaio.com-frontend/issues/5), and [migration task](https://github.com/danielgaio/danielgaio.com-frontend/issues/13) hold the roadmap, discussion and status. Add tasks and comments there; engineering documents do not maintain a second backlog.

Read [the monorepo decision](docs/architecture/0001-monorepo.md) for source commits and history verification. Migration PR #14 merged with a merge commit, retaining the backend ancestry. The original backend repository remains available until Daniel completes his [manual retirement task](https://github.com/danielgaio/danielgaio.com-frontend/issues/15).
