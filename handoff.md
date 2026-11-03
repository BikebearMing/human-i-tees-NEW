# Brand Is Back — Section Handoff

Long scroll-driven section placed right after the homepage hero. Built as a single Liquid section with inline CSS + JS. All asset URLs are raw Shopify CDN `<img>` tags for now (not yet converted to Liquid settings/snippets — that's a follow-up).

## Files touched

- **Created:** `sections/brand-is-back.liquid`
- **Edited:** `templates/index.json` — added `brand_is_back` to `sections` and appended to `order` after `homepage_hero_6fdkp8`.

> Note: `index.json` carries a "auto-generated" warning. If the merchant adds/removes sections via the theme editor, my edit may be overwritten — re-add **Brand Is Back** from the section picker if that happens.

## Theme context

- Theme is a Dawn-style Shopify theme at `/Users/karminglaw/Desktop/Human-i-tees/`.
- Smooth scroll (Lenis) is loaded in `layout/theme.liquid` (~line 331).
- GSAP + ScrollTrigger are loaded inside `sections/homepage-hero.liquid` (~line 340). Brand-Is-Back also includes them via CDN as a safety net (cached, idempotent globals). Three.js is added only by this section.
- No build step — edit Liquid directly, push via `shopify theme push` or GitHub sync.

## Section structure (5 stages)

The section is one big `<section class="bib">` containing 5 stages in scroll order:

| Stage | Wrapper | Behavior |
|---|---|---|
| A — TV intro | `.bib-tv-stage` (250vh) | Pinned via ScrollTrigger; renders the "TV" with stickers, marquee, noise |
| B — Era swap | (continuation of A's pin) | Scrubbed timeline: stickers/marquee fade, noise crescendos, "Born in the 90s" mask-wipes up, "The Brand is Back" mask-wipes in |
| C — Sticky collage | `.bib-collage-stage` (200vh) | `position: sticky` headline at top-center. 5 cutout people + "Stand Together" script slide in from sides on scroll, then idle-float |
| D — Mountains + clouds | `.bib-mountain-stage` (90vh) | Two mountain PNGs (left/right). Three.js canvas behind them with ~14 procedural cloud sprites. Mouse-reactive parallax + gentle drift. Render loop only ticks while in viewport |
| E — Flowers + app + CTA | `.bib-flower-stage` | Polaroid+word infinite marquee, grass field, "Humanitees Ambassador App" block with leaf, description paragraph, soil base, "Start Your Journey" pill |

## Animation notes

- All animation entry points are in the inline `<script>` IIFE at the bottom of the section.
- ScrollTrigger pin uses `pinSpacing: false` for the TV; the surrounding 250vh provides scrub room.
- The mask swap uses two stacked sets of `.bib-mask-90s` (visible by default) and `.bib-mask-now` (start `yPercent: 110`, absolutely positioned on top).
- Cutout entrances use `[data-bib-cutout]` attribute to pick direction:
  - `tl`, `l2` → from left
  - `tr`, `r`, `st` → from right
  - `c` → from bottom
- Idle float is a `gsap.to(y: '+=10', yoyo, repeat:-1)` attached on entrance complete.
- Respects `prefers-reduced-motion` — masks resolved instantly, marquees paused, idle floats skipped.

## Three.js clouds

- Texture is generated procedurally in a `<canvas>` at runtime (`makeCloudTexture()`), so no cloud PNG is needed.
- 14 `THREE.Sprite` instances, randomized scale/position/depth/opacity.
- Per-frame: each cloud drifts on X and bobs on Y (sine). Camera offsets slightly by eased mouse position.
- Render loop is started/stopped by a ScrollTrigger on `.bib-mountain-stage` so we don't burn frames offscreen.
- Renderer uses `alpha: true` and DPR clamped to 2.

## Assets currently inlined

All from `cdn.shopify.com/s/files/1/0853/0673/6916/files/`:

| Slot | File |
|---|---|
| TV top-left sticker (the "50") | `news-cutout-left-tv.png?v=1778909299` |
| TV right sticker (30+ million) | `30-million-students-engaged-paper.webp?v=1778908078` |
| Cutout TL (pair) | `brand-is-back-person-group-1.webp?v=1778908085` |
| Cutout TR (mustache solo) | `brand-is-back-person-1.webp?v=1778908085` |
| Cutout center (group of 3) | `brand-is-back-person-group-3.webp?v=1778908086` |
| Cutout right (drinking guy) | `brand-is-back-person-2.webp?v=1778908085` |
| Cutout lower-left | `brand-is-back-person-group-2.webp?v=1778908086` |
| Stand Together script | `stand-together.webp?v=1778908238` |
| Mountain left | `mountain-left.webp?v=1778908055` |
| Mountain right | `right-mountain.webp?v=1778908055` |
| Polaroid 1 | `photo-polaroid-1.webp?v=1778908238` |
| Polaroid 2 | `photo-polaroid-2.webp?v=1778908238` |
| Grass / flowers | `brand-is-back-bg-flowers.webp?v=1778908087` |
| Leaf | `leaf-crop.webp?v=1778908210` |
| Soil | `ground-dirt-crop.webp?v=1778908175` |

## Known stubs / TODO

1. **TV frame + knobs** — currently CSS (dark bezel + radial-gradient knob circles + speaker bars). Replace with PNGs when sourced.
2. **TV inner background (90s sky/mountain)** — currently a layered CSS gradient (`.bib-tv-bg`). Could become an `<img>` or short looping `<video>` later.
3. **Football** — intentionally omitted (user said ignore for now).
4. **"COMMUNITIES" vs "COMMUNNITES"** — used the corrected spelling. User may want the typo preserved (it's in the mock).
5. **Cutout mapping** — based on best guess from the mock. Swap `src` on `.bib-cutout-*` if wrong; layout positions are independent of which photo is which.
6. **Liquid schema** — section has empty `settings: []`. Convert to schema-driven content (heading text, image pickers, marquee strings, CTA link/label) when ready.
7. **Mobile** — basic responsive tuning at `@media (max-width: 768px)`. Likely needs polish after real device QA.

## Design intent (so future iterations stay on-brand)

- Vibe: 1990s TV broadcast → modern collage zine. Cinematic, not snappy — slow scrub, deliberate noise crescendo at the swap moment.
- Clouds: "behind mountains only," ambient drift with mouse-reactive parallax. Subtle, not a flythrough.
- Cutouts: "scroll entrance + idle float" (gentle bob, never frenetic).
- Headline pinning: "The Brand is Back" must feel like the collage flows *past/through* it, then it releases just before the mountains enter.

## How to preview

1. Push the theme: `shopify theme push` (or via the Shopify GitHub integration).
2. In the theme editor, open the **Home page** template.
3. **Brand Is Back** should already be in the section list. If not, **Add section → Brand Is Back**.
4. Scroll from the hero downward to test the full sequence.

## Likely next prompts from user

- "TV frame PNG is here, swap it in" → replace `.bib-tv-frame` CSS with an `<img>` overlay, keep the inner `.bib-tv-screen` unchanged.
- "Convert to schema" → expose each text string and image as a section setting; keep class hooks intact so JS still finds elements.
- "Tune the scrub timing" → all timing lives in the `tl.to(...)` calls inside the IIFE in the section file — labeled by comments.
- "Make clouds more/less" → change `var COUNT = 14;` and the scale ranges in the Three.js init block.
