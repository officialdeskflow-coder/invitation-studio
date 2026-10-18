# Invitation Studio: start here

Animated wedding invitations. **One config file per couple, one command to build, one folder to upload.**

## The only folder you ever upload
```
READY-TO-UPLOAD/
 ├─ sales-website/      <- YOUR SALES WEBSITE (includes both live demos inside it)
 ├─ gursewak-simran/   <- a couple's invitation (demo, template "Royal Maroon & Gold")
 └─ kabir-anaya/       <- a couple's invitation (demo, template "Sage Garden")
```
Two kinds of upload, same method (drag the whole folder to Netlify or Cloudflare Pages):
- **Your sales website:** upload `READY-TO-UPLOAD/sales-website`. See `docs/LANDING-PAGE.md`.
- **A client's invitation:** upload that couple's folder, for example `READY-TO-UPLOAD/gursewak-simran`.
Everything inside a folder is needed. Nothing else in this project is ever uploaded.

## What each folder is
| Folder | What it is | Upload? |
|---|---|---|
| `READY-TO-UPLOAD/` | The finished cards, one sub-folder per couple. Created by the build. | **YES (one couple's sub-folder)** |
| `landing-site/` | The source of your sales website: `site.json` holds all its text, prices and WhatsApp number. | no (it builds `sales-website`) |
| `marketing/` | WhatsApp catalogue banners and copy-paste messages (`marketing/whatsapp/`). | no (post on WhatsApp / Status) |
| `clients/` | One folder per couple: `client.json` (their details) + `photos/`. This is the only thing that changes per sale. | no, private |
| `templates/` | The designs: `royal-maroon-gold` and `sage-garden`. | no |
| `docs/` | Guides (client questionnaire, QA checklist, deploy, RSVP set-up, adding templates). | no |
| `engine/` | The build tool, tests and shared code. You rarely open it. | no |

## The most common mistake
Uploading a folder that is not inside `READY-TO-UPLOAD`. These are **source** folders and must never be uploaded: `landing-site`, `clients`, `templates`, `engine`, `docs`, or the whole project. If one is uploaded, the website shows a "wrong folder" notice instead of your page. Also upload the folder **itself** (for example `sales-website`), not its parent `READY-TO-UPLOAD`, and not a zip.

## Make a card for a new couple (needs Node 18+, nothing to install)
1. `npm run new:client -- rohan-meera`   (add `--template sage-garden` for the green design)
2. Put their photos in `clients/rohan-meera/photos/` and edit `clients/rohan-meera/client.json`
3. `npm run build -- rohan-meera`
4. Open `READY-TO-UPLOAD/rohan-meera/index.html` in a browser to preview it, then upload that folder.

On Windows without a terminal: double-click `BUILD-ALL.bat` to rebuild every couple and the sales website.

## Your sales website
Edit `landing-site/site.json` (WhatsApp number, brand name, prices), run `npm run build:site`, upload `READY-TO-UPLOAD/sales-website`.

## Before sending a link to guests
Set the RSVP address in `client.json` (otherwise the form saves nothing), then follow `docs/QA-CHECKLIST.md` on a real phone.

## Other commands
`npm test` (safety checks) | `npm run backup` (zip of everything, keep a copy elsewhere) | `npm run new:template -- my-design` (start a new design)

## Reading order
`docs/LANDING-PAGE.md` (sales site) -> `docs/LINK-PREVIEW.md` (picture when you share a link) -> `docs/ADD-A-CLIENT.md` -> `docs/DEPLOY.md` -> `docs/QA-CHECKLIST.md`. Others only when you need them.

Licences and what is and is not verified: see `LICENSES-THIRD-PARTY.md` and the end of `docs/QA-CHECKLIST.md`. Not verified here: real iPhone/Android devices and a real Google Sheet round trip.
