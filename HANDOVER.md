# Human-i-Tees theme handover

Status as of **3 Nov 2026**. For whoever continues the launch. The older `handoff.md` covers how the Brand Is Back section is built; this file covers where things stand now.

---

## 1. Read this first

- **Next job: switch the real store (aa3fab-4) to this theme.** The client feedback rounds are done and live on bikebeardemo. The plan and its blocker are in **section 6**.
- **Everything is committed and pushed to GitHub** (`master`). The bikebeardemo live theme matches `master`.
- **Workflow the user wants:** make changes in the `theme dev` preview first, let the user check, then push to the bikebeardemo live theme when they say "push".

---

## 2. Stores and themes

| | Store | Notes |
|---|---|---|
| **Staging (current work)** | `bikebeardemo.myshopify.com` | Same store as `acutabovetest.myshopify.com`. Password-protected. Prices in **MYR**. File CDN: `cdn.shopify.com/s/files/1/0928/2971/2677/`. |
| **Real store (humanitees.com)** | `aa3fab-4.myshopify.com` | Not touched yet. Prices in **USD**. 18 tees with Color + S–3XL. Collections: `shop`, `new-arrivals`, `best-sellers`, `1990-archive`, `the-reawakening`, `our-fundraiser-catalog`. File CDN: `…/files/1/0853/0673/6916/`. Its admin `main-menu` still drives the old live site, so the theme no longer uses it. |

Themes on bikebeardemo:
- **Human-i-Tees Launch, #193350926629**: the live theme. All work goes here.
- **humanitees-com-bike-bear-dev-staging**: the previous live theme, kept as a fallback.
- Several `Development (…)` themes left over from `theme dev`. They are safe to delete.

Git remotes:
- `origin` is `github.com/BikebearMing/human-i-tees-NEW`.
- The Mac work came in from `github.com/BikebearMing/human-i-tees-backup-2` (one commit, no shared history). It was copied over this folder.
- This PC's older versions of 15 files are in `Desktop/human-i-tees-v2-pc-backup-2026-10-30/`.

---

## 3. How to work on it

**Push only the files you changed.** If the JSON settings files have been edited in the theme editor, a full push wipes those edits.
```
npx shopify theme push --store bikebeardemo.myshopify.com --theme 193350926629 --allow-live --only <file> --only <file>
```

**Pull the live copy of any `templates/*.json` or `sections/*-group.json` before you edit it.** This has already happened once: someone set step images in the editor that the local copy didn't have.
```
npx shopify theme pull --store bikebeardemo.myshopify.com --theme 193350926629 --path <tmp-dir> --only templates/page.fundraising.json
```

**Local preview:** `npx shopify theme dev --store bikebeardemo.myshopify.com`, then open http://127.0.0.1:9292. It needs the storefront password.

**Don't run `sed -i` in the theme folder while `theme dev` is running.** Its temp files get uploaded, and the preview shows "Failed to Upload Theme Files" until `theme dev` is restarted.

**Admin API (products, files):** the CLI login is stored under **`acutabovetest.myshopify.com`**, not `bikebeardemo`.
```
npx shopify store execute -s acutabovetest.myshopify.com -j --query-file q.graphql [--allow-mutations]
```
- Scopes granted: `read/write_products`, `read/write_files`.
- The upload scripts used this session were in a temp folder and are gone. The method was: `stagedUploadsCreate`, then POST the file, then `productUpdate(media)` or `fileCreate`.

**House rules (`CLAUDE.md`):**
- No new `font-family`, `font-size` or letter-spacing. Use `var(--futura)` / `var(--geist)` / `.body` / `.h1`–`.h4`.
- Check `assets/custom.css` for an existing `:root` variable before adding one.
- Every button is `.custom-button` wrapping `<span class="button-span body">`.
- `div:empty { display: none }` is global, so purely decorative divs need content.

---

## 4. What's been done

**Navigation**
- The header has a built-in nav: Shop (megamenu: All / New Arrivals / Best Sellers / Collections), Fundraising, Contact. Built in `snippets/custom-header-default-nav.liquid` and `snippets/custom-header-mega-card.liquid`.
- On a store without `new-arrivals` / `best-sellers` (bikebeardemo), those tabs fall back to all products sorted newest / best-selling. The shop sidebar in `custom-collection.liquid` uses the same tabs and the same fallback.
- Megamenu photos are bundled as `assets/megamenu-*.jpg`.
- The footer links to Home / Shop all / Fundraising / Contact. Instagram and LinkedIn are set; TikTok is hidden until a URL is set.
- Search and the account icon are hidden. Both can be switched back on in the header settings ("Show search" / "Show account icon").
- The announcement scroller is switched off: its 4 blocks are disabled, not deleted.
- The header's z-index is 20, above all page content but below the cart drawer (1000) and the preloader (10000).
- All `#` links now point somewhere real.
- Links to collections that may not exist fall back with `collections['x'].url | default: routes.all_products_collection_url`.

**Pages not launching** (Blog, FAQ, Our Story, Our Impact, Ambassadors): every link to them is removed.

**New simple pages**, sharing `assets/section-utility-page.css`:
- cart (`custom-cart`)
- 404 (`custom-404`)
- search (`custom-search`)
- /collections (`custom-list-collections`)
- generic page (`custom-page`)

**Product page** (`sections/custom-product.liquid`)
- Size buttons show the size only ("S", not "White / S").
- The picker is hidden on products with no options.
- Details, Care and Shipping & Returns carry the copy from the old site.
- The cursive label is bundled as `assets/pdp-cursive.png`.
- Images whose alt text ends in "artwork" get a framed, height-capped slot (`pdp__media-item--art`).
- **18 artworks** (from the Drive zip) are uploaded to bikebeardemo's products as extra images.

**Homepage**
- Soil and TV gap: the soil overhang scales with screen width (`-7vw` desktop, `-16vw` mobile), and `.mountain-section` has `clip-path: inset(-200vw 0 0 0)`.
- The guy in the hero is drawn above the group polaroid (`z-index: 1`).
- **Acorn:** the 14.5 MB GLB was replaced by a 1.37 MB web copy in bikebeardemo's Files (`acorn-web.glb`).
- "Fundraising for a cause" marquee: 7vw text, letter-spacing `-0.04em`, a steady leftward drift, and a capped scroll boost. It no longer reverses.
- The "Earn seeds…" ambassador paragraph is removed (its schema default is blank).
- Favicon: `assets/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`.

**Fundraising page**
- Hero cards in the order: NO UPFRONT COST (no icon), $5 PER TEE (middle), 100% ONLINE. Card titles accept `[br]`.
- Steps: now "4 Simple steps", with step 04 "Built for students".
- Both "Start fundraising" buttons (hero, "$5 on every shirt sold") go to `https://humaniteesfundraising.com/get-started`. The "Ready to launch now? Start your campaign" lines under them are removed.
- The Make an Impact button reads "Free Starter Kit" and goes to `/pages/free-kit`.

**Free-kit thank-you page:** "Your kit ships within 7-9 business days" (final). Cards follow the client's wireframe: We reach out / Your kit arrives (tag "7-9 business days") / You launch.

**3 Nov fixes (live on bikebeardemo):**
- Hero: the vol line ("Vol. 02 — The Revival…") hides with one quick tween after 20px of scroll instead of a scrub. The scrub left it half-masked whenever the scroll stopped in its band, which the client saw as a glitch.
- Hero: the tee's orange dot has a pulsing ring so people see it's clickable.
- TV: pins just under the header bar (`top top+=<header height>`), so the top of the TV shows. On ≤1024px the stage is `100vh - header`.
- TV channels are editable in the theme editor (Channel blocks). Channel photos are in bikebeardemo's Files as `tv-channel-*.jpg` plus one screenshot the user swapped in.
- The FAQ "View all" button is hidden.

**Contact page**
- Every field is required and marked with *, including the per-tab extra field (Order number / Group or organization).
- `?subject=` picks the starting tab.
- The donations popup's "Learn more about the 90s" button is hidden (its label is blank).

**Assets moved off the test store's CDN:** the header icons, donation leaf, megamenu placeholder and plus icon are now theme assets.

---

## 5. Open items

### Needs a visual check
These were pushed without anyone looking at them on the page:
- [ ] Fundraising hero cards: the new order, and the "NO UPFRONT / COST" two-line title on desktop and mobile.
- [ ] Step 04 card: its text is twice as long as the other steps, so check it on a phone. It reuses the step 1 photo; pick its own in the editor.
- [ ] Marquee: its position on the mountain ridge now that the text is smaller.
- [ ] Contact form: asterisks, and that an empty submit is blocked.
- [ ] Homepage without the announcement bar, including the hero's pill flight to the header. The header got shorter.

### Bugs
- [ ] **Hero pill / video out of step (not reproduced).** The client saw the dark globe pill parked about 530px above the video at 1906×909. It couldn't be reproduced: the pill tracked the video within 2px under slow scroll, fast wheel bursts, a reload mid-page and a forced `ScrollTrigger.refresh()`. Still needed from the client:
  - Does it fix itself, or stay wrong until they scroll?
  - Was the window resized or zoomed after load?
  - Which browser?
  - Ideally a screen recording.

  The code is `bottomPin()` in `sections/homepage-hero.liquid`. The homepage `load` event can take 30s or more (two MP4s plus the GLB), and some refreshes wait for it.
- [ ] Three.js loads twice on the homepage: the UMD build for the clouds and the ES module for the acorn. The console warns "Multiple instances of Three.js". It works, but it's wasted weight.
- [ ] Pre-existing theme-check errors: `img` tags without width/height in brand-is-back, preloader and footer-custom, and parser-blocking scripts in `layout/theme.liquid` and `snippets/smooth-scroll.liquid`.

### Decisions needed
- [ ] **Marquee:** keep it scrolling (current), or make it static / two lines? The client said to check with Jayden.
- [ ] **Order number** is required on the "Product related" tab. Is that intended? The client asked for "all fields".
- [ ] **The Wildlife Set** card links to `the-reawakening`. That was a guess; confirm it.
- [ ] **"Coral Reefs"** artwork has no product. Create one, or drop it?
- [ ] **Size guide** link is hidden: on the old site it pointed at the FAQ page, which isn't launching. Does it need a page?

### Admin tasks (bikebeardemo)
- [ ] **reCAPTCHA:** Online Store → Preferences → Spam protection → enable Google reCAPTCHA on contact forms.
- [ ] **Policies:** add shipping and refund policies. The product page's Shipping & Returns links 404 without them.
- [ ] **Store name:** the footer shows "© acutabovetest". Change it under Settings → General.
- [ ] **Products:**
  - Bear Us In Mind is sold out and has no sizes.
  - "NATURE CAN'T BE RESTOCK" has a cut-off title and no sizes.
  - The "Short" test product (RM11, no image) should be hidden or deleted.
  - Some products still have the wrong description copy.
- [ ] **Blog:** "The 90s Archive Returns" has no featured image. This only matters if the blog goes live.

### Before going live on the real store (aa3fab-4)
- [ ] **Acorn model:** `acorn-web.glb` lives in **bikebeardemo's** Files. Re-upload it to the real store and update `ACORN_URL` in `sections/brand-is-back.liquid`.
- [ ] **Artwork:** the 18 artworks were only added to **bikebeardemo** products. Repeat the upload on the real store. The handles differ there, e.g. `bear-us-in-mind-2374349`. Set alt text to "<Title> artwork" so they get the framed slot.
- [ ] **Leftover test-store file:** `sections/custom-article.liquid` still points at a test-store CDN image (`Group_157.svg`). It's unused at launch, since the blog is off.
- [ ] **Settings file:** don't push `config/settings_data.json` blindly. It sets cart type and other settings; use `--ignore config/settings_data.json` unless you mean to overwrite them.
- [ ] **Header menu:** keep the header's menu setting blank. The real store's `main-menu` lists all 7 old pages.

---

## 6. Go-live on the real store (aa3fab-4): plan as of 3 Nov

**Update, 3 Nov afternoon: access granted (staff, limited), preview theme pushed.**
- Preview theme on the real store: **"Human-i-Tees Launch (preview)", #194528936212, unpublished.** Preview: `https://aa3fab-4.myshopify.com/?preview_theme_id=194528936212`. Their live theme ("Fundraising Focused Site (cart recommendations)", #194370699540) was not touched.
- Built with `python tools/build_realstore.py <dir>` (adds Klaviyo + Essential Preorder app embeds, GTM-N7C289PK, real Our Tees handles). Single-file fixes can go to the preview with `--theme 194528936212 --only <file>`, but never push `config/settings_data.json` or `templates/index.json` from the repo there: that wipes the overrides.
- Tested on the preview with their real products: home, shop (15 per page, NEXT to page 2), product page (Color + Size S–3XL, $24), add to cart, drawer, cart page, fundraiser card (attributes save, bad code rejected), checkout opens with the right lines and $ total. GTM, Klaviyo and Preorder load.
- Their Fundraising and Contact pages already use templates named `fundraising` and `contact`, so they switch with the theme. No reassigning needed.
- Their free-shipping threshold is $100, same as ours.
- Access we have: Themes (full), Pages, Files, Products, Content. Missing: Online Store Preferences (spam protection), Apps (Flow, API uploads), Settings, Discounts. Asked the client for more.
- Still to do before publish: upload the 17 editor images + acorn GLB to their Files (all names are free), add the 18 artworks to products, Free Kit pages, spam protection, hide/redirect Our Story, Our Impact and "fundraiser" pages (empty under our theme). Order note box: left out until the client asks.

**Earlier blocker (resolved):** `ming@bikebear.com.my` doesn't see aa3fab-4 in its store list (Active or Inactive) and gets "doesn't have permission". Someone had access before (the "theme-export-www-humanitees-com-bike-bear-deve…" theme on bikebeardemo is an export of their theme). Either another login has it, or the client must re-add access under Settings → Users (staff, or collaborator for Bike Bear Sdn Bhd) with **Themes, Files, Products, Pages, Online Store preferences**.

**What we already know (from the public storefront, no login):**
- 18 tees, $24 USD, each with Color (1) + Size (6), **one image each** (no artwork image yet).
- `/pages/fundraising` and `/pages/contact` exist (old site pages). `/pages/free-kit` and `/pages/free-kit-thanks` don't.
- `/collections/shop` exists.

**Steps, in order:**
1. **Pull first** from the bikebeardemo live theme (`templates/*.json`, `sections/*.json`, `config/settings_data.json`) in case the user edited in the theme editor, and commit.
2. **Push as a new unpublished theme:** `npx shopify theme push --store aa3fab-4.myshopify.com --unpublished`. Customers see nothing until Publish. Include `settings_data.json` (it's a new theme, nothing to overwrite).
3. **Copy 17 editor-picked images** into aa3fab-4's Files **with the same file names**. Theme-editor images are stored as `shopify://shop_images/<name>` and resolve against the store's own Files, so they're blank until uploaded. Check aa3fab-4's Files for name clashes first; if a name exists with a different image, upload under a new name and update the template. Current list:
   `Rectangle_35.png`, `Rectangle_38.jpg`, `Rectangle_39_1.png`, `Rectangle_921.jpg`, `Rectangle_921_1.jpg`, `Rectangle_923.jpg`, `Rectangle_926.jpg`, `Screenshot2025-12-12at12.30.08AM17.png`, `Screenshot_2026-11-03_112535.png`, `archive.jpg`, `step1.jpg`, `tag_1.png`, `tv-channel-1-90s-kids.jpg`, `tv-channel-2-booth.jpg`, `tv-channel-3-donation-check.jpg`, `tv-channel-5-older-90s-kids.jpg`, `tv-channel-6-kaw.jpg`.
   Regenerate it with: `grep -rhoE 'shopify://shop_images/[^"\\]+' templates sections config/settings_data.json | sort -u`.
   The 48 hardcoded CDN links already point at the real store's CDN (`0853/0673/6916`), and `assets/` files travel with the push.
4. **Acorn GLB:** upload `acorn-web.glb` to aa3fab-4 Files and update `ACORN_URL` in `sections/brand-is-back.liquid`. It still loads from bikebeardemo's CDN, but breaks if that store closes.
5. **Our Tees (homepage):** in the copy for the real store, set the product handles to `nature-can-t-be-restocked`, `bear-us-in-mind-2374349`, `losing-ground`. Blank slots fall back to the shop collection.
6. **Check the unpublished theme** through its preview link (`?preview_theme_id=…`). The real store has no password, so Playwright can check every page with the real products.
7. **At switch time only** (these affect the current live site):
   - Assign templates: Fundraising page → `page.fundraising`, Contact → `page.contact`. Until the switch, the old theme may not have these templates and would show those pages in its default layout.
   - Add the 18 artwork images to the products, with alt text "<Title> artwork". The old theme would show them in its galleries.
   - Create the Free Kit (`page.free-kit`) and Free Kit Thanks (`page.free-kit-thanks`) pages. These are safe any time.
   - Online Store → Preferences: spam protection on contact forms. Store email: support@humanitees.com (kit requests go there).
   - Publish. The old theme stays in the library for a one-click rollback.
