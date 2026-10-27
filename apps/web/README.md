# Website frontend

This is the existing Next.js 14 / React 18 frontend, now in the website's pnpm workspace. The visible portfolio/blog pages remain an unfinished scaffold; repository consolidation does not make them a finished product.

Run these commands from the repository root:

```sh
pnpm dev:web
pnpm --filter @danielgaio/web typecheck
pnpm --filter @danielgaio/web lint
pnpm --filter @danielgaio/web build
pnpm --filter @danielgaio/web start
```

The development server uses port 3000. Keep local environment values in `apps/web/.env.local`; `NEXT_PUBLIC_MEASUREMENT_ID` is optional and enables the existing Google Analytics integration only when set. Public environment values are included at build time and must not contain secrets.

The production build emits a standalone Node.js server and traces dependencies from the monorepo root. Build its independent container from that root, so the workspace manifests and unified lockfile are available:

```sh
docker build -f apps/web/Dockerfile -t danielgaio-web .
docker run --rm -p 3000:3000 danielgaio-web
```

When Google Analytics is configured, pass its public identifier using `--build-arg NEXT_PUBLIC_MEASUREMENT_ID=...` during the image build. Application hosting and deployment target AWS; infrastructure and production-readiness work are tracked in the GitHub Project.
