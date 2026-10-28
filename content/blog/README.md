# Public Medium article archive

This archive preserves the **20 published articles observed on Daniel Gaio's public profile** before moving DanielGaio.com to AWS. It contains four English articles and sixteen Portuguese articles, with the original prose and language. It is not a complete Medium account export: drafts, private or unlisted articles and account-only metadata have not been reconciled against an export ZIP.

## Provenance and scope

Public profile discovery initially returned ten articles. Scrolling paginated the rendered profile to twenty; repeated attempts at the bottom returned the same twenty, with “Considerações sobre Análise e Projeto de Algoritmos” as the oldest listed article. `sources/public-profile.json` records that observed public listing. It contains article links and visible public summaries, not browser application state or account controls.

The newest ten full bodies came from the public RSS feed. Asking that feed for a larger limit still returned ten, so RSS was not treated as a complete inventory. The other ten bodies came from each public rendered article. `sources/feed.xml` retains the original feed, and `sources/<post-id>.html` and `.json` retain the captured body and public metadata for each article. Captures omit article headers, navigation, account UI, cookies and authentication data. Body snapshots may contain public Medium image/tracking/promotion URLs; those are not rendered by the new site.

The visible signed-in Medium account belonged to ProsperSync. No account settings, email export, subscription or private account data were accessed. A Daniel Gaio account export remains a separate follow-up to reconcile account-only material.

## Files and rendering contract

- `posts.json`: sanitized article bodies, titles, languages, source timestamps, original displayed calendar dates, original custom-domain paths and new localized paths. `mediumUrl` is archival identification, not a verified fallback destination.
- `redirects.json`: 68 explicit encoded, decoded and trailing-slash variants covering the twenty old article paths. The edge normalizer compacts these to twenty paths. All point to local articles.
- `assets.json`: 80 original article images, totaling 17,052,097 bytes, with source URLs, MIME types, byte lengths and full SHA-256 digests. Files live under `apps/web/public/blog-imports/<post-id>/<digest-prefix>.<ext>`.
- `inventory.json`: source counts, reconciliation evidence and remaining limitations.
- `conversion-report.json`: per-body source/output digests, prose comparison results, link repairs and source date discrepancies.

The application renders only `posts.json`; the raw source snapshots are recovery material in the repository. This was a one-time migration from public source snapshots. The conversion is documented here rather than shipped as an ongoing scraper or publishing dependency. New articles should use the maintained content contract and pass the same integrity and rendering checks.

## Conversion and integrity

The importer parsed HTML and allowed only article text, headings, lists, quotes, code, figures/captions, images, links, tables and basic text emphasis. It removed source classes, inline styles, event attributes, scripts, forms, active embeds and responsive image wrappers. Safe existing paragraph/heading IDs remain for source fragment links. HTTP/HTTPS/mailto and fragment links are allowed; article links matching a known migrated ID resolve locally.

All 80 article images were downloaded and hashed. Images include circuit diagrams, mathematical notation and other original figures; original intrinsic dimensions are retained when available. No image OCR, mathematical transcription, prose translation or invented alternative text was performed. Original empty `alt` attributes remain empty, pending author-reviewed descriptions. Images must keep natural width with `max-width: 100%` and automatic height so small formula images do not stretch. Ten RSS tracking pixels and one Medium-inserted promotion block/image were removed. The captured bodies contained no embedded video/audio/iframe/object media requiring recovery.

Source and sanitized body text compare equal for all twenty articles after HTML entity decoding and whitespace normalization, excluding that Medium promotion. Code blocks, line breaks, captions and formula images remain. The sanitized output contains 23 `pre` blocks. Seventeen malformed original links containing an exact duplicated Markdown URL were repaired without changing visible text. One malformed link had conflicting hostnames; its destination was removed while retaining its visible text. All changes are recorded in `conversion-report.json`. External link availability has not been exhaustively checked.

Dates retain both the exact source timestamp (`publishedAt`) and original public calendar date (`publishedDate`). Visible dates use the calendar date and UTC formatting to avoid a visitor timezone shifting the day. The oldest article visibly said June 1, 2025 while Medium's metadata said `2025-06-02T10:07:28.996Z`; both facts are retained. Dates inside article prose are original authored text and are not publication metadata. Original tags were unavailable from the ten older body captures and were left empty.

Only two explicit author-provided English/Portuguese article pairs are marked as translations. Other articles keep their original language and do not receive synthetic translations.

## Launch and follow-up

Verify each old path redirects once to the new local article; verify every article and image over the AWS endpoint, including percent-encoded Portuguese slugs, math diagrams and code. Image files under `/blog-imports/` need retention across releases so cached older article pages remain readable.

Keep unknown-path Medium redirects **disabled**. Native Medium author/slug URLs were observed redirecting to DanielGaio.com; blindly redirecting unknown old paths back to Medium could create a loop. `https://medium.com/p/<id>` has not been verified as independent of the custom domain. The twenty observed public paths are preserved explicitly. Complete account-export reconciliation and any remaining unlisted paths remain follow-up work; this archive does not establish that those paths never existed.

Medium membership, canonical settings, account export and cancellation were not changed by this import.
