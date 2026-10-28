# Living Systems design QA

final result: passed

Scope: Daniel's selected third visual study, implemented in the existing bilingual static website. This is local implementation verification, not a production deployment claim.

## Evidence and normalization

- Source: [selected study](docs/design/living-systems-reference.webp), 1003 × 1568 image pixels representing the intended 1440-wide desktop composition.
- Desktop: Chrome at an actually measured 1440 × 900 CSS viewport, full-page capture 1440 × 4129. [Final hero](docs/design/qa-desktop.webp); [combined same-scale hero comparison](docs/design/qa-comparison.webp).
- Mobile: Chrome override was verified through actual `innerWidth=390`, `innerHeight=844` and `scrollWidth=390`. [English homepage](docs/design/qa-mobile.webp), Portuguese homepage inspected at the same viewport, and [article](docs/design/qa-article.webp).
- Source and rendered captures were placed together at a normalized width of 803 pixels per panel before judging. Focused hero and work-row comparisons were inspected in addition to the full composition; separate file views were not treated as a comparison.

The full implementation is longer than the concept: Daniel asked to retain the existing structure, so the personal story, education and AWS learning sections remain. Real project descriptions, real article titles and functioning links also require more space than the illustrative study. These are intentional content constraints, not missing visual sections.

## Findings and fixes

1. P2: initial desktop hero had excess height and a small introductory line not present in the selected hierarchy. Removed the visual introductory line and revised desktop/tablet dimensions. Recaptured and compared: the text/artwork balance, three-line headline and beginning of work now follow the selected composition.
2. P2: the first work implementation used the same sans heading treatment for every row and undersized supporting copy. Added the source's serif treatment to the two ProsperSync headings, increased copy/numeral scale and refined the first artwork crop. Post-fix combined work comparison passed independent visual review.
3. P2: independent code review found that the in-page Reduce motion toggle did not disable smooth anchor scrolling. Added `html:has(.motion-paused){scroll-behavior:auto}`. Browser verification observed `aria-pressed=true`, `scroll-behavior:auto`, and hero transform reset to `none`.
4. Capture correction: a full-page capture taken while scrolled placed the sticky header inside the work area. Recaptured from verified `scrollY=0`; this was a capture artifact, not a duplicate header in the page.

No remaining P0/P1/P2 findings. Independent visual review approved the combined reference/implementation comparisons and mobile article. P3: work numerals have tighter kerning than the study and supporting desktop typography is quieter; neither prevents the selected direction or reading.

## Required fidelity surfaces

- **Fonts and typography:** locally served Manrope for interface/display sans and Cormorant Garamond for italic emphasis, two work headings and article prose. Explicit weights, readable mobile wrapping, no clipped headlines. The name uses an italic text signature rather than inventing a third handwriting font. This is an intentional two-font interpretation of the study.
- **Spacing and layout rhythm:** full-bleed hero, asymmetric text/art balance, narrow section index, continuous split work bands and pale reading surfaces. Section links account for the sticky header. Both 390-wide language layouts have no horizontal document overflow.
- **Colors and tokens:** near-black aubergine, porcelain, warm orange and pale lilac carry across the portfolio/archive/article surfaces. Light sections have their own dark text/link tokens. Focus indicators remain visible. No formal automated contrast or Lighthouse score is claimed.
- **Image quality:** four original glass/filament scenes, correctly fitted to their slots; responsive smaller hero, intrinsic dimensions and lazy supporting art. Five production WebP files total 303,354 bytes. No CSS illustration stand-ins, fake product screenshots or new external image dependencies.
- **Copy and content:** real career/project summaries and `getPosts()` data are used. The mock's invented article titles and unsupported ProsperSync AWS tag were rejected. Twenty migrated article bodies, dates/languages, translations, image references, feed and URL data remain unchanged. Meaningful heading spaces, archive heading hierarchy and a focusable skip target were added.

## Interaction verification

- Fine-pointer click/movement over the hero produced a nonzero translated/scaled artwork matrix; the text and controls did not move with it.
- In-page Reduce motion control resets artwork and disables smooth anchor scrolling. OS preference changes are implemented in the same cleanup/guard path and CSS media query and passed independent source review; an actual OS-level reduced-motion setting was not changed/emulated during this run.
- Short scroll entrances enhance already-visible server content. There is no permanent hidden-content class, endless animation loop or animation dependency. Cleanup removes observers/listeners/frames and active animations.
- Mobile menu opens; Escape closes it and returns focus to its button. Keyboard Shift+Tab reached the skip link; Enter focused `main-content`.
- English/Portuguese home switching, writing entry, actual local-models article translation and mobile article/code-block layout passed. An untranslated article retains the existing alternate-index behavior through unchanged route logic/export checks.
- Browser error/warning log was empty for inspected flows. Lazy images outside the viewport were not mislabeled as failures; loaded-image failure inspection returned none.
- Web typecheck, lint, six feed tests and the final production build/export gate passed. The export gate verified 29 routes, 20 articles, RSS/discovery and 90 local asset references, including headings, languages, canonical metadata, dates and translations. Unchanged API/infrastructure checks and the earlier AWS 197-path audit were not repeated.

## Completion checklist

- [x] Selected study resolved from displayed option 3.
- [x] Actual artwork, licensed local fonts/icons and responsive layouts implemented.
- [x] Primary navigation, reading and motion controls verified in Chrome.
- [x] Combined comparisons reviewed; P0/P1/P2 findings resolved.
- [x] Local verified preview available; production unchanged pending publication.
