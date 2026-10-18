# Architecture

## Idea
A **template** is a design made of **components** (gate, hero, invite, countdown, schedule, venue, gallery, rsvp, closing). A **client** is just data. The **build** merges `defaults.json` + `client.json`, renders each component's HTML with the config, concatenates CSS and JS in a fixed order, and writes one invitation.

```
client.json ──┐
defaults.json ┴─> merge + derive + validate ─> ctx ─┬─> components/*.html ─┐
template.json: sections, tones, edges ───────────────┤                       ├─> page.html ─> READY-TO-UPLOAD/<name>/
engine/shared/js/core.js + components/*.js + boot.js ───────┤  (CONFIG injected)    │
base/motion/edges/components/florals CSS ────────────┘                       ┘
```

## Template engine (`engine/build/lib/engine.mjs`)
Mustache-like and dependency free: `{{var}}` (escaped), `{{{raw}}}`, `{{#if}}…{{else}}…{{/if}}`, `{{#each list}}`, `{{tpl:file}}` (template asset), `{{img:config.path}}` (client asset), `{{json:path}}`. A missing value is a build error, never a silent blank.

## Sections, tones and edges
`template.json` lists sections in page order with a **tone** (`dark` or `light`) and an **edge** style. Edge art comes from the template's `svg/edges.json` (`{style: {dark: svg, light: svg}}`, one string or a list that is cycled); royal-maroon-gold still uses the built-in `torn` / `curve` styles. Between two sections of different tone the build inserts the edge automatically, so turning a section off never leaves an ugly seam. Same-tone neighbours get no edge.

## Assets
Inline mode embeds files as data URIs; split mode copies them to `assets/` with a content hash. Templates never hard-code either: they use `{{tpl:...}}` / `{{img:...}}`.

## Runtime: the `K` kit
`engine/shared/js/core.js` creates `K` with: `$ $$` (DOM), `G ST` (GSAP, ScrollTrigger), `ok` (GSAP loaded), `full` / `reduce` (motion mode), `Y` (travel distance), `split` (word-by-word headings), `enter` (run once when a section scrolls in), `tlx head fade bloom sway drift burst`, `S` (shared state), `CONFIG` (runtime data from the build), `watch` (register selectors for the failsafe), `plain()` (open the page without animation).
Each `components/<name>/<name>.js` runs inside `K.add('<name>', function(){ …helpers pre-declared… })`.

### Failure containment
`boot.js` runs every component inside `try/catch`. A broken component logs `[invi] component failed: <name>` and the others keep working. If the **gate** or **hero** fails the page opens without animation instead of leaving guests stuck behind the envelope. If GSAP itself fails to load, the `nomo` class shows everything statically.

### Motion modes
- **full**: everything.
- **calm**: devices with Reduce Motion. Fades and the opening still play; no parallax, sway, leaves or spinning marker.
- **nomo**: GSAP missing or JavaScript off: static, fully readable.
- Review only: a device in calm mode can opt in to full with `?motion=full` (and the optional banner).

## Component contract (what a template must provide)
Required element ids: `gate`, `openBtn` (the seal button), `hero`, `names` (the `h1`), `inv`, `clo`. Optional sections need their ids: `cd`, `cdt`, `cdsr`, `n-d n-h n-m n-s`, `today` (countdown); `sch`, `tl`, `mk`, `fill` (schedule); `ven`, `vt` (venue); `gal`, `gt` (gallery); `rsvp`, `rt`, `rform`, `rseal`, `rsub`, `rst`, `rnote`, `rg`, `tap` (rsvp). `npm test` checks all references resolve.
Classes the core relies on: `.rv` (fades in), `.hi` (hero reveal), `.draw` (stroke draw-on), `.flr` (floral cut-out), `.sp-h` (split heading, added by JS), `.cl` (curve line).

## CSS order
`base → seal → motion → edges → gate → hero → sections… → florals`. Florals come last on purpose: `.flr{position:absolute}` must beat `.hero>*{position:relative}`. Component CSS may depend on that order.

## Extension points
New design: `npm run new:template`. New section type: add `components/<n>/` + an entry in `template.json`. New site-wide feature (like music): optional component included when its config key is set.

## SVG partials
Every `templates/<id>/svg/*.html` file is rendered once and available to components as `{{{svg.<name>}}}` (file `garland-left.html` becomes `svg.garlandLeft`). Files named `seal.html` / `seal-rsvp.html` are special: they render twice with unique gradient ids for the two seal halves.
