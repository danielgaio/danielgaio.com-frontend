# Portfolio content for owner review

This is a content-review slice of [portfolio issue #7](https://github.com/danielgaio/danielgaio.com-frontend/issues/7), independent of repository migration #14 and AWS planning #16. It supplies editable English and Portuguese copy for later implementation. It does not change or publish the current website. Both JSON files remain `publicationStatus: draft` and `ownerReviewRequired: true` until Daniel's review is incorporated.

## Sources and factual boundaries

The primary source is Daniel's résumé modified September 17, 2026. Owner-only provenance is retained in the local setup workspace; the private document, its sharing URL and private contact details are not committed. The current [GitHub profile](https://github.com/danielgaio) supports the computer-engineering education and public contact links. Its [profile README](https://github.com/danielgaio/danielgaio/blob/main/README.md) was last changed June 16, 2024, so its “currently learning” statements are not treated as current career facts.

| Area | Source-supported material | Publication boundary |
| --- | --- | --- |
| Education | Computer Engineering, Unipampa, 2015–2021 | Use the degree and period; no invented honors. |
| Sicredi Liberdade | Software Engineer from October 2021; RPA Developer May–October 2021; APIs, Python automation, data integration, production support and documentation | “Present” is only as of the résumé. Confirm current employment and any public case before adding a current-role label, internal details or impact claims. |
| ProsperSync | Personal project from June 2025; image/voice expense capture and conversational financial insights; listed web/data/AI stack | Describe personal product work. The résumé says it is mainly used by Daniel; do not imply external adoption, customer scale or measured business results. |
| ProsperSync service and delivery | Python/FastAPI/LangGraph financial-analysis service, shared model configuration/provider integration, application-function deployment and database-migration automation | Keep this distinct from the expense-capture product story. Do not infer throughput, reliability guarantees or production-scale results from the presence of workflows. |
| AWS website | The user's current TypeScript/Node.js website and AWS learning objective | Describe work in progress and planned exercises, not an existing AWS deployment or demonstrated production scale. |

No source supplies customer counts, savings, traffic, latency or uptime metrics. Do not invent numbers. CV-listed Databricks and AWS certifications are omitted from the copy until current validity and public verification are established. A later, job-tailored résumé headline is not automatically the website's positioning. The English and Portuguese text presents the same facts rather than expanding claims in translation.

## Proposed homepage narrative

Lead with practical engineering, followed by a short personal story. Daniel confirmed on October 27 that computer-vision research should be replaced by another part of ProsperSync. Show three supporting areas: engineering in financial services, ProsperSync's image/voice expense-capture experience, and its AI-service integration and delivery work. Then connect that experience to what Daniel is building and learning on AWS, followed by writing, education and the verified LinkedIn/GitHub contact links. The two ProsperSync stories describe different parts of the same personal project, not separate products or extra adoption.

Each future case study should answer: what problem existed, what Daniel personally contributed, what the result was, what evidence can be shared, and what he learned. The `detailPrompt` values are editorial intake notes, **not public page copy**; omit them from rendering and omit incomplete case-study details rather than displaying placeholders.

The proposed visual direction is a readable professional portfolio with clear typography, a concise introduction and generous space for real project evidence. Build an accessible responsive navigation, visible language switch, useful keyboard focus and reduced-motion behavior. The final visual design and representative mobile/desktop screens remain part of #7; this content slice does not claim that work is complete.

## Confirmed language behavior to implement

Daniel chose **English first, with a Portuguese switch** on October 27. The shared [language configuration](languages.json) records English as the default, `/en/` and `/pt/` route targets, and equivalent-page switching. Route wiring and metadata still belong to application implementation; adding this configuration does not change the live website. Keep matching section/item IDs and matching language/canonical metadata. Do not automatically translate Medium articles or route readers to nonexistent translations. An article without a translation should keep its own language and clearly offer the available language rather than a broken equivalent-page link.

## Outstanding owner input

The language choice and removal of the research feature are settled. Daniel's response did not confirm the September employment/project timeline, so do not infer that the current-role details were approved. Obtain a shareable financial-services example and concrete ProsperSync service/delivery evidence when developing those case studies. Ask for quantified outcomes only if Daniel has evidence and permission to disclose them. Incorporate the remaining factual and copy review before publication.

Keep #7 open for the remaining owner decisions, case-study evidence and visual/navigation review. The JSON is intentionally app-independent content; integration into the accepted monorepo belongs to the foundation work after its prerequisites are resolved.
