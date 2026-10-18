# Link previews: the picture that shows when you share a link

When someone sends your link on WhatsApp, Instagram or Facebook, the app shows a card with a **picture, a title and a line of text**. That comes from the page's `og:image` tags. They are built in already, but they only switch on when the page knows its **final https address** (apps need the full address of the picture, not a relative one).

## Your sales website
1. Find your live address, for example `https://your-project.pages.dev` (or your own domain).
2. Open `landing-site/site.json` and set `"siteUrl": "https://your-project.pages.dev"` (no spaces, starts with https).
3. `npm run build:site`, then upload `READY-TO-UPLOAD/sales-website` again (a new deployment, same project).
4. Your two live demos get their own previews too (their pictures show the couple's names and a phone).

## A couple's invitation
1. `npm run build -- <couple-name>`
2. `python engine/tools/make-og.py <couple-name> --write-config`  (makes `clients/<couple-name>/photos/og.jpg` with their names, date and a phone showing their card, in their design's colours)
3. In `clients/<couple-name>/client.json` set `"seo": { "url": "https://their-address/", "ogImage": "photos/og.jpg" }`
4. `npm run build -- <couple-name>`, upload `READY-TO-UPLOAD/<couple-name>`.

## Test it
- Send the link to yourself on WhatsApp, or paste it into Facebook's Sharing Debugger (developers.facebook.com/tools/debug).
- **WhatsApp remembers the first preview it saw.** If you shared the link before fixing it, share it as `https://your-address/?v=2` (any new ending) to force a fresh preview.
- View the page source and copy the `og:image` address into a browser: it must open the picture (not a 404).

## If no picture appears
| Cause | Fix |
|---|---|
| `siteUrl` / `seo.url` empty or starts with `http://` | Set the full `https://` address and rebuild |
| Wrong address (typo, old project name) | Use the exact address Cloudflare shows |
| The picture address gives 404 | Upload the whole folder, including `assets/` |
| Picture too big | Keep it under about 300 KB (the tools make about 70 to 90 KB) |
| You shared the link before the fix | Add `?v=2` to the link |
| The page is behind a password | Previews only work on public pages |

`noindex` (hidden from Google) does **not** block previews; `robots.txt` explicitly allows the preview crawlers of WhatsApp, Facebook, Twitter and LinkedIn.
Build warnings tell you when a picture or address is missing.
