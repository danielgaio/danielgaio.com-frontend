# Website frontend

The public portfolio and blog use Next.js 16 / React 19 and produce a static export. English is the default, with Portuguese at `/pt/`. `/en/` and `/pt/` provide equivalent homepages and blog indexes. Actual article translations link to each other; untranslated articles retain their original language and offer the other writing index.

Run from the repository root:

```sh
pnpm dev:web
pnpm --filter @danielgaio/web typecheck
pnpm --filter @danielgaio/web lint
pnpm --filter @danielgaio/web build
pnpm --filter @danielgaio/web start
```

`typecheck` generates the version-matched Next.js route types before checking TypeScript, including in a clean checkout.

`build` writes deployable files to `apps/web/out/`, with directory-style routes. `start` serves that export for local inspection on port 3000; set `PORT` for another port. No application server, database or secret is needed for the public site. AWS serves the export from private S3 through CloudFront. The CDN resolves directory requests to `index.html` and returns a real 404 for missing pages.

Copy is drawn from `content/portfolio`; editorial intake prompts, draft flags and current-role assumptions are not rendered. Blog text and hashed local images come from `content/blog` and `public/blog-imports`. The import inventory records its completeness; the UI does not claim that the historical archive is complete. Keep imported article paths or tested redirects intact.

The optional `NEXT_PUBLIC_MEASUREMENT_ID` enables the existing analytics component only when configured at build time. This identifier is public and must not contain a secret. Build and inspect the static container from the repository root:

```sh
docker build -f apps/web/Dockerfile -t danielgaio-web .
docker run --rm -p 3000:3000 danielgaio-web
```

No external font or image service is required for the portfolio. The backend workspace is retained for future capabilities and learning; it is not a dependency of this static site.
