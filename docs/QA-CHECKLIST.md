# QA checklist

## Automatic (run for every client before delivery)
```
npm test                                           # structure, ids, accessibility basics, validation, optional sections
npm run build -- <couple-name>
python engine/qa/smoke.py READY-TO-UPLOAD/<couple-name>/index.html --rsvp   # about 30 s: errors, overflow, stuck-hidden, RSVP form
python engine/qa/qa.py READY-TO-UPLOAD/<couple-name>/index.html             # full animation QA (a few minutes)
```
`qa.py` covers: console errors/warnings, frame timing, layout shift, items left hidden at slow/fast/flick scroll speeds, calm mode, motion override, countdown cleanup, double-tap safety, RSVP seal, JavaScript off, six screen sizes. Headless frame times are indicative only (no GPU).

## Real devices (cannot be automated: do this every time)
Open the **live** link (not the file) on:
- [ ] An iPhone (Safari) and a mid-range Android (Chrome)
- [ ] A desktop browser
Then on each phone:
- [ ] Opening: tap the seal, flaps part smoothly, card appears, names rise, no flash or jump
- [ ] Scroll the whole card at a normal pace and once with a fast flick: nothing stutters, nothing stays invisible, no sideways scroll
- [ ] Flowers stay in place and sway gently; marker follows the scroll; countdown digits roll
- [ ] Rotate to landscape and back
- [ ] Low Power Mode / battery saver still reads fine
- [ ] Reduce Motion on: calm mode reads fine
- [ ] Slow network (throttle) loads without layout jumping
- [ ] Names, date, times, venue, spelling, Gurmukhi/Hindi text correct and legible
- [ ] Open in Maps opens the right place; the RSVP seal opens the form; a real test RSVP appears in the Sheet; the page works with the keyboard open
- [ ] WhatsApp preview shows the right title and image (needs `seo.url` and `seo.ogImage`)
- [ ] Music (if used) starts after the seal tap and the toggle pauses it
