# 0001 — Consolidate the website repositories

Status: accepted by Daniel on October 27, 2026. Implementation: [migration issue #13](https://github.com/danielgaio/danielgaio.com-frontend/issues/13).

## Decision

Evolve `danielgaio/danielgaio.com-frontend` into the primary pnpm monorepo. Keep the website in `apps/web` and import the backend into `apps/api`. Use TypeScript for application code and Node.js for server runtimes/tooling. Reserve `packages/contracts` for real shared API contracts and `infra` for AWS infrastructure definitions when those are implemented.

One product, one developer and the website agent benefit from coordinated pull requests and shared contracts/configuration. Applications remain independently buildable and deployable; repository topology does not choose the AWS service architecture. Keep clear package boundaries and relevant checks for changes to shared code.

## Preserved source

- Frontend source: `danielgaio/danielgaio.com-frontend`, commit `3ff011659f401d731da42ec332e7aed5a02f7349`.
- Backend source: `danielgaio/danielgaio.com-backend`, commit `691ac3079e7aacf0c416e0d9a5e82eaadc9d9475`.

The first migration commit moved the complete frontend tree under `apps/web`. The following two-parent merge attached the original backend history and imported its complete tree under `apps/api`. Before intentional workspace/configuration changes, each imported subtree matched its source tree exactly. Later commits make the necessary workspace, packaging and verification changes; they do not rewrite source history.

After checkout, verify that both source tips remain ancestors:

```sh
git merge-base --is-ancestor 3ff011659f401d731da42ec332e7aed5a02f7349 HEAD
git merge-base --is-ancestor 691ac3079e7aacf0c416e0d9a5e82eaadc9d9475 HEAD
```

Use a **merge commit** for the migration PR. Squash/rebase merging cannot preserve the exact imported backend commits. Existing issues, milestones, pull requests and the GitHub Project remain in the frontend repository; the original backend repository is retained.

## Scope

This migration unifies the workspace and adapts the old application startup/build paths. It does not complete the portfolio, publishing backend, bilingual content, AWS deployment, DNS cutover or Medium subscription change. Those remain visible in the [GitHub Project](https://github.com/users/danielgaio/projects/2). Existing scaffold limitations and old framework dependencies must be addressed before production release.
