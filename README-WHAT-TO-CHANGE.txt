WHAT TO CHANGE IN YOUR PROJECT / GIT REPOSITORY  (update v1.6.1)
================================================================
Copy these files into your project, same paths, replacing the old ones:

  package.json                     (build script now builds everything: this fixes the Cloudflare error)
  wrangler.jsonc                   (NEW file, in the project root next to package.json)
  engine/build/cli.mjs             (NEW file)
  engine/build/build.mjs
  landing-site/page.html           (phone menu, swipe rows)
  landing-site/site.css
  landing-site/site.js
  docs/DEPLOY.md                   (notes only, optional)

Do NOT replace landing-site/site.json (it holds your number and text). Add these 3 lines to it:
  in "nav":      "menu": "Menu"
  in "demos":    "swipe": "Swipe to see more screens"
  in "pricing":  "swipe": "Swipe to compare packages"

Cloudflare settings (Workers & Pages -> your project -> Settings -> Build):
  Build command:   npm run build
  Deploy command:  npx wrangler deploy
  Root directory:  (empty)
wrangler.jsonc has "name": "invitation-studio". It must match your Worker's name in Cloudflare
(your address invitation-studio.officialdeskflow.workers.dev shows the name is invitation-studio).

Push to Git. Cloudflare builds and deploys by itself.
Do not commit the folder READY-TO-UPLOAD: Cloudflare creates it during the build.
