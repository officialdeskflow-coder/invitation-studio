# Changelog

## 1.5.1
- Live address set (`siteUrl`: invitation-studio.officialdeskflow.workers.dev) so the sales website and both demos show a picture when the link is shared. WhatsApp number carried over from the published site. The two FAQ answers that said "Placeholder" now read as neutral final text.

## 1.5.0
- **Link previews everywhere.** Complete Open Graph + Twitter tags (picture address, type, width, height, alt text) on the sales website, both demos and every couple's card; picture size is read from the file automatically.
- `engine/tools/make-og.py <couple>` makes each couple's 1200x630 share picture (names, date, a phone showing their card, their design's colours); `--write-config` sets `seo.ogImage`.
- Demo cards inside the sales website get their own previews once `siteUrl` is set.
- `robots.txt` of private cards now explicitly allows the WhatsApp, Facebook, Twitter and LinkedIn preview crawlers while staying hidden from search engines.
- Build warns when a card has no preview picture or address. `docs/LINK-PREVIEW.md` explains setup, testing and the WhatsApp cache. `npm test`: 79 checks.

## 1.4.0
- `marketing/whatsapp/`: four pricing banners (Classic, Signature, Planner, full price list) in the maroon-and-gold style, plus `WHATSAPP-SETUP.md` with catalogue items, collection, greeting and away messages, eight quick replies and labels for running invitations on the same WhatsApp Business number.
- `engine/tools/make-banners.py` regenerates the banners from `landing-site/site.json` so prices stay in sync.

## 1.3.2
- The built sales website folder is now `READY-TO-UPLOAD/sales-website` (was `landing-page`) so it cannot be confused with the source folder `landing-site`.
- Every source folder now contains a "wrong folder" notice page, so an accidental upload explains itself instead of showing a blank 404. Docs: common-mistake box and Cloudflare Pages walkthrough.

## 1.3.1
- Suggested starting prices filled in on the landing page (Classic ₹3,999, Signature ₹6,999, Planner ₹2,999 per card for 5+); docs explain pricing and the one-vs-two WhatsApp number question.

## 1.3.0
- **Landing page** (`landing-site/`, built to `READY-TO-UPLOAD/landing-page/`): one elegant sales page with hero, live demos, how it works, features, planner band, packages, FAQ and a booking form that opens WhatsApp. All text, prices and the WhatsApp number live in `landing-site/site.json`.
- The two demo cards are bundled inside the landing folder, so one upload shows the work.
- Typography system: Cormorant Garamond + Jost, fixed type and spacing scales.
- `npm test` now 73 checks (adds the landing page); `engine/qa/site-smoke.py`; `engine/tools/make-previews.py` retakes phone pictures and the link-preview image.
- Honest by design: no invented prices, reviews or counts; empty prices show "Price on request".

## 1.2.0
- **Restructured for clarity.** Top level now has only: `START-HERE.md`, `READY-TO-UPLOAD/`, `clients/`, `templates/`, `docs/`, `engine/`. All tooling moved into `engine/`.
- The build output folder is `READY-TO-UPLOAD/<couple-name>/` and it contains exactly what gets uploaded (no extra build log).
- The default build is now the complete one (index.html + app.css + app.js + assets/): link previews and music work. A single-file build remains as `npm run build:single`.
- Windows helpers: `BUILD-ALL.bat`, `RUN-TESTS.bat`. Backups unzip into one folder.

## 1.1.0
- Second template **sage-garden** 1.0.0: lotus-bloom opening with a lifting scalloped curtain, illustrated couple, ring countdown, vine zig-zag schedule, polaroid gallery, scallop/arcade edges. All art is original vector (no raster assets), 400 KB single file.
- Demo client `kabir-anaya` (fictional couple, illustrated portraits instead of photos).
- Engine: template-provided edges (`svg/edges.json`), any `svg/*.html` is exposed as `svg.<name>`, core no longer warns when a template has no floral cut-outs.
- `npm test` now 62 checks across both templates. Layout parity of royal-maroon-gold re-verified after the engine changes.
- `engine/tools/sage-garden-art.py` regenerates / recolours the vector art.

## 1.0.0
- First structured release, migrated from the single-file prototype (v3.2) with **layout parity verified** (254 elements x 8 scroll positions).
- Template `royal-maroon-gold` 1.0.0: nine components (gate, hero, invite, countdown, schedule, venue, gallery, rsvp, closing) + optional music.
- Per-client `client.json`, validation with clear errors, optional sections with automatic edges, inline and split builds, `noindex` by default.
- Component failure isolation, no-animation fallbacks, shared motion core, failsafe reveal.
- Tools: build, `npm test` (40 checks), scaffolding, zero-dependency backup, photo preparation, browser QA suite.
- Fonts self-hosted; Google Fonts removed. Unique SVG ids. RSVP texts configurable.
