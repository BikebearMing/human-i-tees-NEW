# Claude rules for this project

## Fonts and typography — DO NOT make your own
**Never write your own `font-family` declarations or custom font sizing/weight/tracking.** Always use the fonts and utility classes already defined in `assets/custom.css` and `assets/base.css`.

### Available font variables
Defined in `assets/custom.css` (around line 72):
- `var(--futura)` — `'Futura PT Cond', 'Arial Narrow', Arial, sans-serif` — heavy display
- `var(--geist)` — `'Geist', system-ui fallbacks` — body

Defined in `assets/base.css` (top of file):
- `var(--font-american-typewriter)` — slab serif, for small labels / numbers

### Available typography utility classes
- `.body` (`assets/custom.css:130`) — Geist 14px / weight 600 / line-height 120% / letter-spacing -0.42px

When you need styled text, apply one of the existing classes or use one of the font variables. Do NOT introduce `font-family: 'XYZ', sans-serif` of your own, and do NOT add `font-size` / `font-weight` / `letter-spacing` overrides unless the layout strictly demands it.

## CSS `:root` variables — check existing first
**Before creating any new `:root` variable in a section, read `assets/custom.css` and confirm there isn't already one you can reuse.**

Existing global variables (`assets/custom.css` around line 72):
- `--futura`, `--geist`
- `--black: #333333`
- `--beige: #e9ded7`
- `--bib-cta: #e88742`
- `--sidepadding-xs: 0.694vw`

If the existing variable's value differs from what you need, **ask first** rather than silently defining a parallel one.

## Reuse existing patterns
- Use `.line-mask` + `.line` for line-by-line text reveal animations (see `sections/homepage-hero.liquid`).
- Respect the global `div:empty { display: none }` reset — any pure-CSS overlay/canvas div needs content (even a `&nbsp;`) or it vanishes.
- GSAP + ScrollTrigger pattern for scroll-driven animation matches `sections/homepage-hero.liquid`.
