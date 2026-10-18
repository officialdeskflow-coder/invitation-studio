# Add a client

```
npm run new:client -- rohan-meera
```
Creates `clients/rohan-meera/` with a config and placeholder photos so it builds immediately. Slugs are lowercase letters, numbers and dashes; the slug is also the RSVP `invitationId` and the folder you deploy.

1. Replace the `REPLACE-ME-*.webp` photos (see Photos below).
2. Edit `client.json` (reference below). Anything you omit uses `templates/<id>/defaults.json`.
3. `npm run build -- rohan-meera`. Read the warnings it prints. The finished card is in `READY-TO-UPLOAD/rohan-meera/`.
4. `python engine/qa/smoke.py READY-TO-UPLOAD/rohan-meera/index.html --rsvp`, then the real-phone checklist.

## client.json reference (royal-maroon-gold)
| Key | Required | Notes |
|---|---|---|
| `template` | no | default `royal-maroon-gold` |
| `couple.first`, `couple.second` | **yes** | names exactly as the couple spells them (max 30 chars) |
| `couple.initials`, `couple.joiner` | no | monogram on the seal (default `G&S` style); joiner default `&` |
| `date.iso` | **yes** | with time zone, e.g. `2027-04-17T18:30:00+05:30`. Drives the countdown |
| `date.display`, `date.long` | no | derived: `17 · 04 · 2027`, `Saturday, 17 April 2027` |
| `hero.pa` | no | Punjabi/Gurmukhi greeting line (empty hides it); `hero.paLang` language tag |
| `invite.paragraphs` | no | 1 to 3 paragraphs (default wording uses the names); `invite.blessing`, `invite.title`, `invite.where` |
| `schedule.events[]` | if section on | 1 to 8 of `{ "time": "6:30 PM", "title": "...", "place": "..." }` in order. `iso` is derived from `time` |
| `venue.name`, `venue.city` | if section on | `venue.mapQuery` / `venue.mapUrl` control the Open in Maps link; `venue.note` (small print, empty hides it); `venue.illustration: false` hides the mandap drawing |
| `gallery.photos` | if section on | 1 or 2 files; `gallery.caption`, `gallery.subtitle` optional |
| `closing.photo` | recommended | the arch photo at the end |
| `rsvp.endpoint` | before launch | Apps Script `/exec` URL. Empty = DEMO mode (saves nothing) |
| `rsvp.maxGuests` | no | 1 to 10 (default 4) |
| `sections` | no | `{ "countdown": true, "schedule": true, "venue": true, "gallery": true, "rsvp": true }`. Set any to `false`. Edges between sections adapt automatically |
| `music.src` | no | `audio/song.mp3` inside the client folder; (a song is copied as a separate file). Plays after the guest taps the seal; a small toggle appears |
| `seo.noindex` | no | default **true** (search engines are told not to list the card) |
| `seo.url`, `seo.ogImage` | for WhatsApp previews | needs `seo.url`: `"url": "https://rohan-meera.example.com/"`, `"ogImage": "photos/photo-1.webp"` |
| `features.progressBar` | no | thin gold scroll line (default on) |
| `features.motionNotice` | no | review-only banner for devices with Reduce Motion; keep **off** for real clients |
| `lang` | no | page language tag (default `en`). Any visible wording can be overridden: copy the key from `defaults.json` |

Any text in `defaults.json` can be overridden per client (for Hindi or Punjabi wording, override titles, labels and the `rsvp.messages` block). Right-to-left languages are not supported by this template.
Config strings may use `${couple.first}` style references to other values.

## Photos
- Portrait, 3:4. Run `python engine/tools/prepare-photos.py <originals> --out clients/<slug>/photos` (WebP, 500x667, about 60 KB each).
- Faces in the upper half (the arch crops the top). Use the largest original: 500 px is sharp on most phones; `--width 750` for very sharp screens.
- Need a client's permission to use their photos. Do not reuse one couple's photos in another demo.

## The build validates for you
Errors stop the build with a clear message (bad date, missing photo, 40 guests, `http://` endpoint, unknown section...). Warnings (past date, empty RSVP endpoint, heavy photo, empty closing photo) are printed and also saved in `clients/<name>/last-build.json`.

## Before you send the link
- [ ] Names, date, time zone and every event time checked against the couple's message
- [ ] `rsvp.endpoint` set, slug added to the Apps Script allow-list, one real test RSVP seen in the Sheet
- [ ] Uploaded `READY-TO-UPLOAD/<couple-name>/`, opened on a real phone from the live link
- [ ] `docs/QA-CHECKLIST.md` ticked
- [ ] The couple approved a preview
