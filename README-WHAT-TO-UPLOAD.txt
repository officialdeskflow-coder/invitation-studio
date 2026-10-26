LANDING PAGE REDESIGN (Marani-style): copy these files into your project/git repo (same paths).
Do NOT replace landing-site/site.json, package.json or landing-site/birthday.json: your text, number and prices stay as they are.

CHANGED (replace):
  landing-site/page.html
  landing-site/site.css
  landing-site/site.js
  engine/build/build-site.mjs
NEW:
  landing-site/fonts.json                 (switches the page to the Outfit font; site.json is not touched)
  engine/shared/fonts/outfit-latin-200-normal.woff2
  engine/shared/fonts/outfit-latin-300-normal.woff2
  engine/shared/fonts/outfit-latin-400-normal.woff2
  engine/shared/fonts/outfit-latin-500-normal.woff2

Then: git add . && git commit && git push. Cloudflare builds and deploys by itself.
To go back to the old look, restore the 4 changed files and delete landing-site/fonts.json.
