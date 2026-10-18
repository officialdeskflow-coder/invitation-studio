# Deploy and share

For the **sales website** see `docs/LANDING-PAGE.md` (upload `READY-TO-UPLOAD/sales-website`). For a **couple's invitation**: run `npm run build -- <couple-name>`, then upload **only** the folder `READY-TO-UPLOAD/<couple-name>/` (the folder itself, with everything in it).

| Host | How |
|---|---|
| Netlify | Drag the folder onto app.netlify.com/drop. Add a custom domain per client if you like. |
| Cloudflare Pages | Create a project, upload the folder (Direct Upload). Free, fast, good in India. |
| GitHub Pages | Put the folder contents in a repo and enable Pages. |

## Good practice
- **One folder per client, one site per client** (or a clearly separate path). A client's folder contains only that couple's data, so guests of one wedding never see another couple's details. Do not deploy the whole `clients/` folder.
- Set `seo.url` to the final address and `seo.ogImage`and rebuild, so WhatsApp/Instagram show a proper preview.
- `seo.noindex` defaults to true (a `noindex` meta tag and `robots.txt`): invitations should not appear in Google. Pass a private link only to guests.
- Hosting caches `assets/` forever (the file names contain a content hash). Rebuild and re-upload the folder for any change.
- Keep `READY-TO-UPLOAD/` out of version control; keep **sources** in a backup (`npm run backup`).
- Send guests the link by WhatsApp. Test the exact link on a phone first.

## Cloudflare Pages, step by step
1. Workers & Pages -> Create -> Pages -> **Upload assets** (Direct Upload). Name the project.
2. Drag the folder `READY-TO-UPLOAD/sales-website` (or a couple's folder) into the box. No build command, no framework.
3. Deploy, then open the `*.pages.dev` address.
4. Check what you see:
   - **Your page** -> done.
   - **"This is a source folder" notice** -> you uploaded a source folder (`landing-site`, `clients`, ...). Upload the folder from `READY-TO-UPLOAD`.
   - **404 / "Not found"** -> `index.html` is not at the top of what you uploaded (you uploaded a parent folder, a zip, or a folder without a build). Open the folder you upload: it must show `index.html` directly.
5. To update later: rebuild, then upload the same folder again as a new deployment (Pages keeps the same address).

## Cloudflare with Git (automatic deploys)
Cloudflare builds the site itself every time you push to the connected repository. Settings (Workers & Pages -> your project -> Settings -> Build):
| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Root directory | leave empty (the folder that holds `package.json`) |

The repository must contain `wrangler.jsonc` (included) and **not** the generated folder `READY-TO-UPLOAD` (it is in `.gitignore` on purpose: Cloudflare creates it during the build).
`npm run build` with no name builds every couple and the sales website into `READY-TO-UPLOAD`. `npm run build -- <couple-name>` still builds just one couple.
If your project is a **Pages** project instead of a Worker, set "Build output directory" to `READY-TO-UPLOAD/sales-website` and leave out the deploy command.
If the build log says `Usage: node engine/build/build.mjs <client-name>...` your `package.json` is an older copy: its `build` script must be `node engine/build/cli.mjs` (and `engine/build/cli.mjs` must exist).
