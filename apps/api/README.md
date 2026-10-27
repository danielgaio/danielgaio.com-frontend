# Website API

This is the existing NestJS/Prisma TypeScript scaffold, imported from the backend repository. Its auth, user, post and project endpoints remain unfinished. Successful startup does not mean these publishing features exist.

Run commands from the monorepo root with the root pnpm version and lockfile:

```sh
pnpm install --frozen-lockfile
pnpm --filter @danielgaio/api prisma:generate
cp apps/api/.env.example apps/api/.env
pnpm --filter @danielgaio/api dev
```

Set a local JWT secret in the ignored `.env` file. The API listens on port 3001 by default so the website can use port 3000; override `PORT` when necessary. The database URL is for the eventual Prisma-backed functionality. Generating the client does not connect to or migrate a database.

Useful checks:

```sh
pnpm --filter @danielgaio/api build
pnpm --filter @danielgaio/api typecheck
pnpm --filter @danielgaio/api lint
pnpm --filter @danielgaio/api test --runInBand
pnpm --filter @danielgaio/api test:e2e --runInBand
```

`build` and `typecheck` generate the Prisma client explicitly. Lint does not rewrite files; use `lint:fix` when intentional. The e2e check boots the real app with a test-only JWT value, closes it afterward, and verifies that unfinished routes still return 404. The former starter assertion of a Hello World endpoint did not match this source tree.

Build the container from the **repository root** so the workspace manifests and root lockfile are available:

```sh
docker build -f apps/api/Dockerfile -t danielgaio-api .
docker run --rm --env-file apps/api/.env -p 3001:3001 danielgaio-api
```

Secrets are passed at runtime. The image does not copy a production environment file. Its current self-contained workspace dependency copy favors reliable Prisma/pnpm resolution over image-size optimization and retains build dependencies; slimming it is a later packaging step. It is a packaging starting point for the unfinished application, not a production-readiness claim.
