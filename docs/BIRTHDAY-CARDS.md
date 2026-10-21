# Birthday and party cards

Two ready looks, built the same way as the wedding cards (one `client.json` per card, then `npm run build`):

| Template | Look | Reply form |
|---|---|---|
| `birthday-party` | bright and playful (kids' parties): bunting, balloons, confetti | RSVP on by default |
| `birthday-gold` | black and gold (18th, 21st, 30th, 50th): curtains, glowing age | countdown only by default |

Demo cards: `clients/aarav-birthday` (party) and `clients/riya-30th` (gold). They are live on your website at `/demo/birthday-party/` and `/demo/birthday-milestone/` (listed in `landing-site/extra-demos.json`; they are not shown on the landing page, share the links yourself).

## Make a card for a client
1. `npm run new:client -- aarav-5th --template birthday-party`   (or `--template birthday-gold`)
2. Edit `clients/aarav-5th/client.json`: `pageTitle`, `name` (include the 's), `age`, `start` (party time with offset, e.g. `2027-06-12T16:00:00+05:30`), `end`, `venue` (name, address, Google Maps link), `details`, `schedule`, `host`, `rsvp`.
3. `npm run build -- aarav-5th`, then upload `READY-TO-UPLOAD/aarav-5th`.
4. Link preview picture: put a 1200x630 picture in `clients/aarav-5th/photos/`, set `"seo": {"ogImage": "photos/og.jpg", "url": "https://their-address/"}`, rebuild.

## RSVP
`rsvp.enabled: true` shows the form. The guest's reply opens WhatsApp with the message already written, sent to `rsvp.whatsapp` (host's number, digits only, country code first). Replies are not stored by the card; to save them, put the address of a form service in `rsvp.endpoint`. `rsvp.enabled: false` makes the card countdown-only. The build refuses RSVP-on without a number and warns when the number is a placeholder (the two demo cards use one: change it in their `client.json` if you want demo replies to reach you).

## Wording
Every label can be reworded or translated in `texts` (see the list at the top of `engine/shared/birthday/app.js`).

## Where the code is
`engine/shared/birthday/` (app.js, style.css, page.html) is shared by both looks; the build is `engine/build/lib/app-build.mjs`. A template only picks the look and fonts.

## Check a card in a browser
`python engine/qa/birthday-smoke.py READY-TO-UPLOAD/aarav-birthday/index.html` (7 screen sizes, RSVP, calendar file, Reduce Motion, no-animation fallback). `npm test` covers the build.
