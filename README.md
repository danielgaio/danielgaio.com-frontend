# DanielGaio.com

TypeScript/Node.js monorepo for Daniel Gaio's professional portfolio and blog. It combines the existing Next.js frontend and NestJS backend while preserving both Git histories. The current applications are unfinished scaffolds; consolidation is not a production launch.

## Layout

| Location | Purpose |
| --- | --- |
| `apps/web` | Existing Next.js frontend; development port 3000. |
| `apps/api` | Existing NestJS API scaffold; development port 3001, configurable with `PORT`. |
| `packages/contracts` | Boundary for future shared API contracts; no invented domain API is added by this migration. |
| `infra` | AWS infrastructure decisions and future TypeScript definitions. No cloud resources are provisioned here yet. |
| `docs` | Engineering context and architecture decisions. |

## Development

Use Node.js 24.22.1 (see `.nvmrc`/`.node-version`) and pnpm 12.15.0. Install pnpm with your Node version manager's tooling or `npm install --global pnpm@12.15.0`.

From the repository root:

```sh
pnpm install --frozen-lockfile
cp apps/api/.env.example apps/api/.env
pnpm dev
```

Review the API environment example and set a local `JWT_SECRET` before starting it. The web app uses `apps/web/.env.local` for optional `NEXT_PUBLIC_MEASUREMENT_ID`. Environment files stay outside Git and Docker images. API build, typecheck, development and test commands explicitly generate the Prisma client from its relocated schema; no database migration or connection is required merely to compile this scaffold.

`pnpm dev:web` and `pnpm dev:api` run one app. The web scaffold does not yet consume a functioning publishing API; authentication/posts/projects remain future product work.

## Verification

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm check` runs these together. Lint commands do not rewrite files. The existing API tests and a module HTTP smoke test run without a database. The frontend has no dedicated test suite yet; inspect affected pages in the browser. The legacy frameworks and dependency security posture need review before internet-facing production deployment.

## Container builds

Both Dockerfiles use the **repository root** as their build context:

```sh
docker build -f apps/web/Dockerfile -t danielgaio-web .
docker build -f apps/api/Dockerfile -t danielgaio-api .
```

Build and deploy the two applications independently. Supply API secrets at runtime. Select AWS services and deployment pipelines against the US$10/month total target and learning goals; this migration does not configure hosting or change DanielGaio.com's DNS.

## Project management and history

[GitHub Project](https://github.com/users/danielgaio/projects/2), [project brief](https://github.com/danielgaio/danielgaio.com-frontend/issues/5), and [migration task](https://github.com/danielgaio/danielgaio.com-frontend/issues/13) hold the roadmap, discussion and status. Add tasks and comments there; engineering documents do not maintain a second backlog.

Read [the monorepo decision](docs/architecture/0001-monorepo.md) for source commits and history verification. **Merge the migration PR with a merge commit** to retain the imported backend ancestry. Squashing or rebasing that PR would discard the exact imported history. The original backend repository remains available.
