# Curiosity in Motion — design QA

final result: passed

## Visual truth and captures

Source: `docs/design/curiosity-in-motion-reference.webp` (original selected image: 1171 × 1343 pixels). This is Daniel's selected anime study, superseding Living Systems.

Implementation: the existing static Next.js export at local port 3002. Desktop CSS viewport: 1440 × 900; full capture: 1440 × 1928 pixels, `docs/design/curiosity-qa-desktop.webp`. Mobile CSS viewport: 390 × 844; full captures: 390 × 3150 EN and 390 × 3190 PT, `docs/design/curiosity-qa-mobile-en.webp` and `docs/design/curiosity-qa-mobile-pt.webp`. Capture pixels align with CSS dimensions; comparison panels are resized to a common width without stretching. These are page-content captures, without browser chrome.

State: homepage, disclosures closed. Motion is deliberately paused for deterministic final visual captures, so entrance animations cannot make text appear faint. The live preview is resumed for handoff. The source is a static image; screenshots do not prove motion.

Combined full-view input: `docs/design/curiosity-qa-comparison.webp`, each panel normalized to 900px width. Focused hero input: `docs/design/curiosity-qa-hero.webp`, matching the source hero and implemented hero region. Full EN/PT mobile images were compared together in the task workspace. Independent visual review opened these combined inputs and found no P0/P1/P2 issues.

## Fidelity surfaces

- **Typography:** self-hosted Manrope/Cormorant Garamond and a generated handwritten wordmark follow the selected sans/italic/editorial hierarchy. Both languages fit at tested widths; the longer Portuguese desktop headline has a separate size adjustment. Supporting type/numerals remain slightly quieter than the mock (P3).
- **Spacing/layout:** workshop hero, numbered project bands, adventure panorama, writing and contact follow the reference. Native work/story/learning disclosures deliberately preserve real technical details, CV/education and the existing learning brief. These add height relative to the concept. Header controls and text remain unobstructed.
- **Colors:** deep ink, warm orange, lilac supporting text and sunset surfaces follow the source. A dark header backdrop protects navigation contrast. Mobile adventure copy uses a pale surface above the illustration to preserve readability.
- **Imagery:** eight separately generated original assets plus a smaller mobile hero are used, with real transparency on foliage/light/signature. No illustration, signature or icon was replaced with CSS/div/SVG drawings. Existing licensed Feather icons are retained. The selected illustration is fictional art, not professional evidence or a personal photo.
- **Content:** real career facts, education, project technologies and article routes are retained. The featured Daily Architecture title is a real migrated post and carries its actual `lang`. No fictional metrics, ownership, current employment date or AWS claim for ProsperSync is introduced.

## Comparison and fix history

1. Initial desktop comparison: navigation crossed bright sky with inadequate contrast. Fixed with a dark header backdrop. Corrected the featured article to the reference's real Daily Architecture post and added the article's language on the PT homepage.
2. Initial mobile check: the floating pause control could overlap reading content. Moved it into the persistent header, sharing state through a small context. Rechecked pause/resume, menu Escape/focus and bilingual navigation.
3. Source review found minimum-width pressure below 380px. Added a compact header and headline treatment. Browser measurements passed 320, 360 and 390px in EN/PT: header fits, heading fits and no document overflow.
4. Desktop PT measurement found a 472px headline in a 440px copy column. Reduced its desktop display size; final measurement is 440px/440px, with no overflow.
5. Mobile visual comparison found adventure text on a busy image area. Moved mobile copy onto the pale surface above the artwork. Final EN/PT comparison passes.
6. Corrected nondeterministic capture state by pausing motion for final screenshots, and adjusted desktop artwork crop/numeral sizing. Final combined and focused comparisons pass, with only the P3 optical differences below.

## Functional and technical evidence

- Current web production build, TypeScript compilation and static export gate passed: 29 routes, 20 articles, RSS and 89 local article-asset references. Web lint and all six feed tests passed. A generated type-cache duplication and a later stalled build were resolved by isolating generated cache; no source checks were bypassed.
- Nine new WebP assets passed local HTTP status, MIME and SHA-256 checks against source files (1,458,080 bytes total); RSS and a true 404 passed. This is local verification, not an AWS release.
- Chrome verified homepages in EN/PT at 1440 × 900 and mobile measurements at 320/360/390 × 844. Both language routes and headings fit without horizontal overflow.
- Live tree transforms changed over time. Manual pause changed all tree animation names to `none`; resume restored visible ambient layers to `running`. Scrolling to the story changed hero layers to `paused` and story layers to `running`.
- Native work/story disclosures expand and expose their real content/education. Mobile menu opens with four links; Escape closes it and returns focus. Keyboard skip focuses `main-content`.
- Actual featured article reading and writing index navigation passed; the index has 20 cards. The real EN-to-PT Copilot article translation opened a Portuguese body with four code blocks, without page overflow. Article pages correctly omit the homepage motion toggle.
- Browser error logs were empty in the final verification session. Independent source/content/React review approved after the language and narrow-header fixes; independent visual review approved the final combined captures.

## Limits and P3 polish

Actual OS reduced-motion emulation and a hidden-tab visibility transition were not established in this browser session. The OS CSS/query path and visibility cleanup are source-reviewed; the manual reduced-motion path is verified live. No global device setting was changed. No formal Lighthouse score, new AWS deployment, DNS change, infrastructure change or full Medium ZIP claim is made.

P3: desktop numerals/supporting typography are quieter than the study. The signature has subtle raster brush texture. These do not block the selected visual direction or core flows; do not loop on cosmetic polish without new feedback.

Implementation checklist: selected artwork installed; responsive bilingual layout verified; motion/pause and core journeys verified; material findings fixed; final combined visual comparison passed; production publication remains a separate next action.
