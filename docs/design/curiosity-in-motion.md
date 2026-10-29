# Curiosity in Motion

Daniel selected this anime direction on October 29, 2026, superseding the earlier Living Systems study. The selected visual reference is [curiosity-in-motion-reference.webp](curiosity-in-motion-reference.webp). The final artwork uses original fictional characters, an unbranded motorcycle/car and workshop/adventure scenery. It is illustrative, not a portrait or evidence of Daniel's relationships, vehicles, trips or professional system architecture.

The desktop composition follows the selected study: a workshop hero, three compact illustrated work bands, a sunset adventure scene, writing and contact. Native disclosures retain the real career narrative, education, technical details and AWS learning context without turning the page into a wall of copy. Real article data supplies the featured Daily Architecture link; its language is explicit even on the Portuguese homepage. The blog keeps its original bodies, URLs, translations, feed and calm reading surface.

## Assets and type

Eight individual illustrations were generated using the built-in image tool: hero, three work panels, story panorama, transparent tree/foliage, transparent lamplight and a handwritten Daniel Gaio wordmark. Exact final prompts and reference basenames are in [the prompt set](curiosity-in-motion-prompts.json). Production WebP assets, including a smaller mobile hero, live in `apps/web/public/media/curiosity-motion/`. They preserve alpha for foliage, light and signature and use versioned names for the existing immutable media cache. The original PNGs remain in private task workspace; they are not production dependencies.

Existing self-hosted Manrope and Cormorant Garamond are retained with their bundled SIL Open Font Licenses; the existing Feather line icons retain their MIT license. No new runtime dependencies, third-party font calls or animation library were added.

## Environmental motion

- Independent tree/foliage layers sway slowly over 11 seconds, with a small vertical drift and separate phases. The underlying characters, vehicles, text and controls remain stable.
- Illustrated light layers have a subdued nine-second opacity/position cycle on work panels. Links and disclosure arrows have short hover/focus transitions; section entrances run once per element.
- A persistent header control pauses motion without covering reading content. It shares state through a small React context. The OS reduced-motion preference disables motion from CSS before hydration and is observed for live changes. The device preference takes priority over manual resume.
- IntersectionObserver pauses ambient layers offscreen. Page visibility pauses them in hidden tabs. Observers, animation objects and listeners are cleaned up. Content is server-rendered and visible without JavaScript or observer support.
- The manual pause applies to the current page; it is not a stored account/browser preference. The OS preference continues to apply across pages.

## Scope and verification

This remains the existing statically exported TypeScript/Next.js website. The API, AWS resources, DNS and Medium membership are unchanged. Local preview is not a production deployment. See root `design-qa.md` for measured visual/interaction evidence, intentional adaptations and any limits. Earlier Living Systems checks are historical evidence rather than verification of this revision.
