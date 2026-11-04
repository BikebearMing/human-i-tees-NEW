# Human-i-Tees theme handover

Status as of **4 Nov 2026**, for the next chat, which handles post-launch fixes. The older `handoff.md` (lowercase) covers how the Brand Is Back section is built.

---

## 1. Read this first

- **The theme is live on the real store**, www.humanitees.com (`aa3fab-4`), since 3 Nov. Any push to its live theme changes the site customers see immediately.
- **The user's workflow:**
  1. Make the change locally.
  2. The user checks it on the `theme dev` preview (bikebeardemo).
  3. The user says "push".
  4. Push only the changed files to **both** live themes: bikebeardemo and the real store.
  5. Commit and push to GitHub.

  Never push to the real store without the user's go-ahead.
- **Both live themes match GitHub `master`** (last code commit `1dcd1ac`, post-launch fixes batch 3). The one difference is the real store's own settings (section 3).
- **The client's post-launch fix list (PDF, 3 Nov)** is worked through: every visual fix that didn't need something from the client is live (section 4). What's left is in section 5.
- **Rules:**
  - Client (Jason Tan): never edit or delete any of their discount codes. Applying a code to a test cart is fine.
  - User: never type passwords or login codes. The user logs in and approves CLI device codes themselves.

---

## 2. Stores and themes

| | Store | Live theme | Notes |
|---|---|---|---|
| **Real store (production)** | `aa3fab-4.myshopify.com` = www.humanitees.com | **Human-i-Tees Launch #194528936212** | USD. 18 tees at $24, Color + S–3XL. Collections: `shop`, `new-arrivals`, `best-sellers`, `1990-archive`, `the-reawakening`, `our-fundraiser-catalog`. No storefront password. File CDN `…/files/1/0853/0673/6916/`. |
| **Staging** | `bikebeardemo.myshopify.com` (same store as `acutabovetest`) | **Human-i-Tees Launch #193350926629** | MYR, password-protected, partial test copies of the tees. Collections it lacks fall back to all products. |

- **Both live themes are named "Human-i-Tees Launch". Always go by ID.**
- **Other themes on the real store** (don't touch):
  - Their old live theme, "Fundraising Focused Site (cart recommendations)" #194370699540. This is the rollback (section 6).
  - Dawn, Origin, Misfits, Bike Bear Development, and Fundraising Focused Site (old V3) / (old V4).
- **Other themes on bikebeardemo:**
  - "humanitees-com-bike-bear-dev-staging", the old fallback.
  - Leftover `Development (…)` themes, safe to delete.
- **Git:**
  - `origin` is `github.com/BikebearMing/human-i-tees-NEW`, branch `master`.
  - This PC's older versions of 15 files are in `Desktop/human-i-tees-v2-pc-backup-2026-10-30/`.

---

## 3. How to ship a fix

**This PC can't reach Shopify over IPv6.** Every CLI command needs the IPv4 setting first:
- bash: `NODE_OPTIONS="--dns-result-order=ipv4first --no-network-family-autoselection"`
- PowerShell: `$env:NODE_OPTIONS = '--dns-result-order=ipv4first --no-network-family-autoselection'`

Timeouts, "fetch failed" and the odd 502 on the preview still happen now and then; just retry or refresh. When the CLI login expires, the user approves the device code.

**Preview** (on bikebeardemo; the user enters the storefront password):
```
npx shopify theme dev --store bikebeardemo.myshopify.com      # → http://127.0.0.1:9292
```
To check something against the real products before it goes live, ask the user first. Then push to a new unpublished theme on the real store (`--unpublished`) and open it with `?preview_theme_id=<id>`.

**Push, once the user says "push".** Push only the changed files, to both stores:
```
npx shopify theme push --store bikebeardemo.myshopify.com --theme 193350926629 --allow-live --only <file> --only <file>
npx shopify theme push --store aa3fab-4.myshopify.com    --theme 194528936212 --allow-live --only <file> --only <file>
```
- **When a template uses a new section setting, push the section first and the template second.** If the template lands before the schema that defines the setting, Shopify silently drops that setting's value.
- **Afterwards, pull the pushed files back from both themes and diff them against the repo.** That's the quickest proof the push landed.

**Real-store rules:**
- **Never push `config/settings_data.json` or `templates/index.json` from the repo to the real store.** The real store's copies carry settings bikebeardemo must not have, applied by `tools/build_realstore.py`:
  - the Klaviyo and Essential Preorder app embeds;
  - GTM `GTM-N7C289PK`;
  - the Our Tees product handles `nature-can-t-be-restocked` and `bear-us-in-mind-2374349`.

  To change either file: pull the real store's copy, edit that copy, and push only that file.
- **Pull before you edit any `templates/*.json` or `sections/*-group.json`.** The user edits bikebeardemo in the theme editor, and the client may now edit the real store. The two stores' JSON can differ, so pull the copy from the store you're pushing to and merge:
  ```
  npx shopify theme pull --store <store> --theme <id> --path <scratch dir> --only templates/<file>.json
  ```
- **Images picked in the theme editor are per store.** They're saved as `shopify://shop_images/<name>`, and each store looks the name up in its own Files. A new image picked on bikebeardemo must also be uploaded to the real store's Files under the same name (Admin → Content → Files). Images linked directly from the CDN in the code already point at the real store.
- **After pushing, check the live page:** use curl, or Playwright in a fresh context.
  - Shopify minifies CSS and JS, so the sizes it serves won't match the repo.
  - If you get 429 or 000 responses, slow down and retry.
  - Browsers cache favicons, so favicon changes may need a new tab.

**Tools:**
- **Playwright uploads** only work from inside the workspace. Copy files into `.playwright-mcp/` first; it's git-ignored.
- **Don't run `sed -i` in the theme folder while `theme dev` runs.** Its temp files get uploaded and break the preview until it's restarted.
- **`theme dev` sometimes misses a save** when one file is edited twice in quick succession. If the preview doesn't show a change, re-save the file (a trivial edit is enough) and check the served HTML.
- **bikebeardemo Admin API:** `npx shopify store execute -s acutabovetest.myshopify.com -j --query-file q.graphql [--allow-mutations]`, with read/write products and files. The real store has no API access; use the admin in the browser.

**Real-store admin access** (staff login "Ming Law", ming@bikebear.com.my):
- **Can:** themes, pages, URL redirects, Files, Discounts (look, don't edit), Flow.
- **Can't:**
  - edit products (view only);
  - Orders, Customers, Analytics.
- **Unclear:** Online Store → Preferences showed greyed out in the menu on 3 Nov, even though the client said they'd opened it up.

**House rules (`CLAUDE.md`):**
- Never add a new `font-family`, `font-size` or letter-spacing. Use `var(--futura)` / `var(--geist)` / `.body` / `.h1`–`.h4`.
- Check `assets/custom.css` for an existing `:root` variable before adding one.
- Every button is `.custom-button` wrapping `<span class="button-span body">`.
- `div:empty { display: none }` applies everywhere, so decorative divs need content.

---

## 4. What's live on the real store

**Pages and templates:**
- Home, Shop (`/collections/shop`, 15 per page), product pages, cart, search, 404 and `/collections`.
- Fundraising (`fundraising` template) and Contact (`contact`). Their existing pages already used these template names.

**Free kit:**
- `/pages/free-kit` uses the `free-kit` template, and `/pages/free-kit-thanks` uses `free-kit-thanks`.
- The form sends through Shopify's contact form to support@humanitees.com. Shopify adds an invisible hCaptcha, so `sections/free-kit.liquid` fetches its token first. Keep that step.
- Test it on the real URL, not `?view=`.
- The "Lead endpoint URL" setting stays blank until they give a Supabase endpoint.

**`/pages/fundraiser`** is the landing page for fundraiser share links. Do **not** hide or redirect it.
- Template suffix `fundraisers` → `sections/fundraiser-shop.liquid`.
- Reads `?first`, `?campaign`, `?end` and `?img`. Images are only accepted from their Supabase `campaign-images` bucket.
- Lists the `our-fundraiser-catalog` collection.
- Link shape: `/discount/<CODE>?redirect=/pages/fundraiser&first=…&campaign=…`.
- The page undoes Shopify's double-encoding of nested links.
- On a theme preview, the `/discount` redirect drops the query; the live site keeps it.

**Hidden and redirected:**
- Our Story → `/`
- Our Impact → `/pages/fundraising`
- The old `about-us` and `steward-partners` redirects chain through these.

**Left as they were (reachable but not linked):** FAQ (`/pages/faq`) and the contact thank-you page, both of which render fine. The blog isn't linked; `/blogs/news` returns 404.

**Bag:**
- The fundraiser card sits above Checkout in the drawer and on the cart page (`snippets/fundraiser-toggle.liquid`).
- Ambassador codes come from the "Humanitees Ambassador Codes" discount: 0% off, 306 codes made by the "Ambassador Code's 2.0" app.
  - An applied code shows the green note, and the status saves as cart attributes.
  - The $0.00 discount line is hidden.
  - They stack with real discounts.
- Their Flow, "Fundraiser order needs tethering", tags orders whose attributes say "no code".
- The order note box is left out until the client asks.

**Apps and settings:**
- **Apps:** Klaviyo and Essential Preorder (app embeds), plus GTM.
- **Already set on their store:** hCaptcha on forms, and policies (privacy, shipping, refund, terms).
- **Expected behaviour, not bugs:**
  - Their TikTok pixel logs `importScripts` errors in the console. That's their app, not the theme.
  - `/account` redirects to Shopify's new customer accounts; the account icon is hidden anyway.

**Assets in their Files:**
- The 17 theme-editor images.
- `acorn-web.glb`, served from `cdn.shopify.com/3d/models/o/9fb1e9e5932f50af/acorn-web.glb`. `ACORN_URL` in `sections/brand-is-back.liquid` uses it for both stores.
- The 18 artworks (section 5).

**Favicon (4 Nov):** the full globe-H logo, built from the header logo's parts: the dark pill (705×368), the `assets/globe.svg` continents and the H path from `sections/custom-header.liquid`. The PNGs were rendered from that SVG in Playwright and downscaled with PIL; the script was a temp file.

**Post-launch fixes from the client's PDF (4 Nov, live on both stores):**

| Fix | Where | Commit |
|---|---|---|
| Product gallery on phones: a swipeable full-width slider with dots, instead of stacked photos | `sections/custom-product.liquid` | `4af53df` |
| Drop titles "The 1990s Archive" (lowercase s) and "The Reawakening" | `sections/featured-shop.liquid` | `4af53df` |
| Bigger CTAs with the globe badge on the fundraising hero, the fundraising earn section and the acorn section's EXPLORE FUNDRAISING | new `snippets/button-large.liquid` | `4af53df` |
| Fundraising hero button now "Free Starter Kit" → `/pages/free-kit` | `templates/page.fundraising.json` | `4af53df` |
| FAQ 05 (selling across the US) and 06 (returns, linking `/policies/refund-policy`); answer links are underlined | `page.fundraising.json`, `sections/faq.liquid` | `4af53df` |
| Free-kit steps 2–3 retitled with the client's copy, and a footnote on the sample tee | `templates/page.free-kit.json`, new `footnote` setting in `sections/checklist-image.liquid` | `4af53df` |
| Homepage marquee replaced by a static "FUNDRAISING FOR A CAUSE" headline (setting "Fundraising headline", `[br]` for the line break) | `sections/brand-is-back.liquid`, plus each store's own `templates/index.json`, pulled and edited per store | `f1e8880` |
| Product pages show the artwork as an extra slide, found in Files by `<handle>-artwork.png` | `sections/custom-product.liquid` | `f1e8880` |
| Mobile hero: the four collage cut-outs sit fully on screen; the globe pill lines up with the video pill; the tagline appears in the middle after the globe has flown up, so they never overlap; the iOS Safari toolbar no longer pushes things under the header | `sections/homepage-hero.liquid` | `1dcd1ac` |

We also checked every FREE STARTER KIT, START FUNDRAISING and orange button on 13 live pages: all of them go to the right place.

---

## 5. Open items

### Waiting on the client
- [ ] **Full logo in the header** on pages other than the homepage (fix list). Needs the official "Human-i-Tees" wordmark file, the "full logo" attachment in David's 3 Nov email. Neither the repo nor the old theme has it.
- [ ] **TV on mobile** (fix list: "TV not in frame"). **On hold until the client sends a new TV image for phones.** A full-width-TV CSS version was built on 4 Nov, but the user had it reverted because the 1440×736 frame is only about 200px tall at phone width. Don't redo it; build the mobile TV around their new image (`sections/tv-section.liquid`).
- [ ] **White backgrounds on product photos** (fix list). The transparent versions exist on bikebeardemo's products. Swapping them needs product edit access, which our login doesn't have, so either the client does it or they give us access.
- [ ] **Artworks on products.** The 18 `<handle>-artwork.png` files are in their Files with alt text "<Title> artwork". They aren't attached to products, because our login can't edit products.
  - **For now the theme fills the gap:** when a product has no media with "artwork" in its alt text, `custom-product.liquid` looks up `<handle>-artwork.png` in Files and shows it as the last slide. All 18 live products show it.
  - Attaching them properly (product → Media → Select existing, *after* the photo) is still the cleaner fix. The fallback then switches itself off for that product.
  - A product whose handle changes loses the fallback slide until it's attached or the file is renamed.
- [ ] **FAQ count.** The PDF says to add "the nine below" but only gives 05 and 06, and both are live. Ask whether more are coming.
- [ ] **`LANHIG001`**, the test code Jason sent, isn't a valid code on their store.
- [ ] **Free kit:**
  - The sample-tee picker (fix list) should show the three designs with images. It still shows the placeholders "Design 1 / Design 2 / Design 3" (theme editor → free-kit page → tee options) until the client says which three tees they're giving away. The other dropdowns are real.
  - The Supabase endpoint is still to come.
- [ ] **Decisions:**
  - Does the Wildlife Set card's link to `the-reawakening` stay?
  - The "Coral Reefs" artwork has no product: create one, or drop it?
  - The size guide link is hidden. The FAQ page exists on the real store and renders under our theme, so it could point there again.
  - Order number is required on the contact form's "Product related" tab. Is that intended?
- [ ] **Desktop collage.** The hero cut-outs still bleed off the edges on desktop by design. The fix list only flagged mobile, which is fixed.
- [ ] **Hero pill bug, not reproduced.** The client once saw the dark globe pill about 530px above the video at 1906×909. It tracked within 2px in every test. We need from them:
  - whether it fixes itself on scroll;
  - whether the window was resized or zoomed;
  - which browser;
  - ideally a screen recording.

  The code is `bottomPin()` in `sections/homepage-hero.liquid`. The homepage `load` event can take over 30s (two MP4s plus the GLB), and some refreshes wait for it.

### Skipped from the fix list (new pages and features; the user's call, 4 Nov)
- [ ] **Contact thank-you page.** For now the contact form shows a small inline confirmation. The same item asks to check that enquiries reach the right inbox and to send an automatic reply; that's Klaviyo or Flow on their side, not the theme.
- [ ] **Policy pages:**
  - Privacy, Terms, Refund & Exchange and Shipping as pages, linked from the footer and the forms.
  - Replacing `treehugger@` with the public support address.
  - Needs their policy PDF and the public address. The text lives in Settings → Policies, which our login may not reach.

### Check by eye on the live site (never checked on a real page)
- [ ] The mobile hero on a real iPhone, with Safari's toolbar showing and hidden. It passed a simulated toolbar, but that's the case the client hit.
- [ ] Fundraising hero cards: the new order, and the two-line "NO UPFRONT / COST" title on desktop and mobile.
- [ ] The Step 04 card on a phone. Its text is twice as long as the other steps, and it reuses the step 1 photo.
- [ ] Contact form: the asterisks, and that an empty submit is blocked.
- [ ] The homepage without the announcement bar, including the hero pill's flight up to the header.

### Tech debt
- [ ] Three.js loads twice on the homepage (UMD for the clouds, ES module for the acorn), which triggers a "Multiple instances" warning.
- [ ] Theme-check errors from before our work:
  - `img` tags without width/height in brand-is-back, preloader and footer-custom;
  - parser-blocking scripts in `layout/theme.liquid` and `snippets/smooth-scroll.liquid`.
- [ ] `sections/custom-article.liquid` still points at a test-store CDN image (`Group_157.svg`). It's unused while the blog is off.

### Optional
- [ ] Shop shows 15 per page; all 18 could fit on one.
- [ ] Order note box, if the client asks.

### bikebeardemo housekeeping (staging only, low priority)
- [ ] Delete the test codes `TESTAMB123` and `TESTPROMO10` once testing is done.
- [ ] Delete the leftover `Development (…)` themes.
- [ ] Store setup:
  - footer store name "© acutabovetest";
  - reCAPTCHA;
  - shipping and refund policies;
  - test products: Bear Us In Mind is sold out, "NATURE CAN'T BE RESTOCK" has a truncated title, and the "Short" product is a test item.

---

## 6. Rollback

1. Online Store → Themes → "Fundraising Focused Site (cart recommendations)" #194370699540 → "…" → **Publish**. It's untouched since the switch.
2. Make **Our Story** and **Our Impact** visible again, or the redirects keep sending visitors away from them.
3. Hide the two Free Kit pages; the old theme has no templates for them.

If the old theme is ever deleted, there's a full copy (479 files) at `Desktop\humanitees-old-theme-backup-2026-11-03`, pulled just before the switch. Push it with `--unpublished`, check it, then publish.

---

## 7. Reference: what was built

**Navigation**
- The header has its own nav: Shop (megamenu: All / New Arrivals / Best Sellers / Collections), Fundraising and Contact. It lives in `snippets/custom-header-default-nav.liquid` and `snippets/custom-header-mega-card.liquid`.
- Keep the header's menu setting blank: the real store's `main-menu` still lists the old pages.
- When a store lacks `new-arrivals` / `best-sellers`, those tabs fall back to all products sorted newest or best-selling. The shop sidebar in `custom-collection.liquid` does the same.
- Megamenu photos are `assets/megamenu-*.jpg`.
- The footer has Home / Shop all / Fundraising / Contact, plus Instagram and LinkedIn. TikTok is hidden until a URL is set.
- Search and the account icon are hidden, with header settings to turn them back on. The announcement scroller is off (its blocks are disabled, not deleted).
- Header z-index 20 sits below the cart drawer (1000) and the preloader (10000).
- Links to collections that may not exist fall back via `collections['x'].url | default: routes.all_products_collection_url`.

**Pages not launching** (Blog, FAQ, Our Story, Our Impact, Ambassadors): every link to them is removed.

**Simple pages** sharing `assets/section-utility-page.css`: cart (`custom-cart`), 404 (`custom-404`), search (`custom-search`), `/collections` (`custom-list-collections`) and the generic page (`custom-page`).

**Product page** (`sections/custom-product.liquid`)
- Size buttons show just the size.
- The picker is hidden on products without options.
- Details / Care / Shipping & Returns copy comes from the old site.
- The cursive label is `assets/pdp-cursive.png`.
- Media whose alt text contains "artwork" gets a framed, height-capped slot (`pdp__media-item--art`). bikebeardemo's products have their artworks attached. On the real store the slide comes from Files instead (section 5).
- On phones (≤768px) the media is a scroll-snap slider with dot buttons; desktop keeps the stacked column.

**Product cards and grids**
- Every tee card is `snippets/tee-card.liquid`, and the grid is `assets/section-our-tees.css`.
- The NEW badge comes from the New Arrivals collection.

**Homepage**
- **Hero** (`sections/homepage-hero.liquid`):
  - The GSAP pill flies up into the header logo.
  - The vol line hides with one quick tween after 20px of scroll.
  - The tee's orange dot has a pulsing ring.
  - On phones and tablets (≤1024px), the collage sizes come from `--ku` = `min(--cu, --hero-band / 62)`. `--hero-band` is set in JS: half of the screen height left over after the header and the pill. That way the cut-outs shrink on short screens. The layout centres on `innerHeight`, not the section, so the iOS toolbar can't push it up. The tagline reveals after the logo flight, not in step 3.
- **Mountain and soil:** the soil overhang scales with screen width (`-7vw` / `-16vw`), and `.mountain-section` has `clip-path: inset(-200vw 0 0 0)`.
- **TV** pins just under the header. Its channels are editable as Channel blocks, and the photos are `tv-channel-*.jpg` in Files.
- **"FUNDRAISING FOR A CAUSE"** headline (`.bib-cause` in `sections/brand-is-back.liquid`): static, centred, 9vw (12vw on phones). It replaced the scrolling marquee on 4 Nov; the setting keeps its old id, `marquee_text`.
- **Acorn** (`sections/brand-is-back.liquid`, which `handoff.md` explains).
- **FAQ "View all"** button is hidden.

**Fundraising page**
- Hero cards: NO UPFRONT COST / $5 PER TEE / 100% ONLINE. Titles accept `[br]`.
- "4 Simple steps", with step 04 "Built for students".
- "Start fundraising" buttons go to `https://humaniteesfundraising.com/get-started`.
- "Free Starter Kit" goes to `/pages/free-kit`.

**Free-kit thank-you page:** "Your kit ships within 7-9 business days". The three cards are We reach out / Your kit arrives / You launch.

**Contact page**
- Every field is required and marked *, including the per-tab extra field.
- `?subject=` picks the starting tab.
- The donations popup's "Learn more about the 90s" button is hidden.

---

## 8. Go-live record

- **3 Nov:**
  - The client gave staff access, then said they'd opened up Discounts, Apps/Flow and Preferences.
  - The preview theme was built with `python tools/build_realstore.py <dir>` and pushed unpublished.
  - On the preview, with their real products, we tested: product, bag, fundraiser card, ambassador codes and checkout.
  - We added to their Files: the 17 editor images, the acorn and the 18 artworks.
  - We created the Free Kit pages and set up the redirects, still dormant.
  - We built the fundraiser page.
- **Before the switch:**
  - The preview matched a fresh build of `master` exactly.
  - Every product, collection, page type and the 404 rendered without errors.
- **Switch, 3 Nov at about 3:40am US Eastern:**
  1. Took a backup of the old theme.
  2. Published #194528936212 and renamed it "Human-i-Tees Launch".
  3. Set the Free Kit templates.
  4. Hid Our Story and Our Impact.
  5. Checked live in a clean browser:
     - Every page is served by our theme.
     - The redirects work.
     - The share link lands personalised with the code in the bag.
     - Products show $24, add to cart works, and checkout opens.
- **4 Nov:**
  - New favicon pushed to both stores.
  - Client's post-launch fix list: three batches of visual fixes pushed to both stores, pulled back and diffed, and checked live (section 4).
