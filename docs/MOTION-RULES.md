# Motion rules (each one earned by a real bug)

1. **Animate only `transform`, `opacity`, stroke-dashoffset and clip-path.** Never width/height/top/left/filter/backdrop-filter. No full-screen blur or noise overlays.
2. **Native scrolling only.** No custom smooth-scroll library and no pinned scenes on mobile. Scroll-linked effects use ScrollTrigger `scrub` with a small smoothing value (about 0.7).
3. **Nothing stays hidden.** Hidden start states come from JavaScript; every reveal has an on-screen failsafe (`boot.js`) that shows stuck items after about 3 seconds. Every new reveal class must be registered with `K.watch(selector)` if it is not `.rv` / `.flr` / `.sp-h`.
4. **Respect calm mode, but do not go dead.** Reduce Motion users still get fades; parallax, sway, falling leaves and rotation are off.
5. **One-shot reveals use `enter()`** (ScrollTrigger `once`). Infinite tweens (sway, breathing) are paused while off-screen.
6. **Flowers stay where the designer put them.** Entrance moves use `yPercent`; scroll effects use `y`; sway is a tiny rotation. Never drift the position.
7. **Fonts are self-hosted with `font-display:block`.** Images have intrinsic size or `aspect-ratio`. Layout shift must stay near 0.
8. **A component may fail; the card may not.** Components run in `try/catch`; the gate and hero have a no-animation fallback.

## Bugs that wrote these rules
- `clearProps:'transform'` on an element whose CSS also sets a transform makes it snap back to the CSS value. Set the end state explicitly (`y:0`) instead.
- A CSS `scaleX(-1)` mirror plus a GSAP `rotation` tween rotates the element through 180 degrees. Set the mirror in GSAP (`scaleX:-1,rotation:0`) before animating.
- Class-name collisions (`.sr`, `.open`) silently restyled unrelated elements. Check a new class against the whole stylesheet (`grep -rn "\.name" templates/`).
- The HTML `height` attribute on `<img>` beats `aspect-ratio`. Add `height:auto`.
- A section revealed by its photos but not its heading left the heading invisible. The QA "stuck-hidden" check exists for this.
- CSS order matters between components (see ARCHITECTURE.md). The parity test catches reorderings.
- Playwright cannot click an element that is mid-animation: the breathing seal needs `force=True` in tests. Real fingers are fine.
