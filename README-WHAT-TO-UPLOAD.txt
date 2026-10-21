ADD THE BIRTHDAY SECTION TO THE LANDING PAGE
Copy these files into your project/git repo (same paths). Upload them together with, or after, birthday-cards-update.zip.
Do NOT replace landing-site/site.json (it holds your number and text): this update does not need it.

CHANGED (replace):
  engine/build/build-site.mjs
  engine/build/lint.mjs
  landing-site/page.html
  landing-site/site.css
  docs/BIRTHDAY-CARDS.md
NEW:
  landing-site/birthday.json                         (the section text; edit it freely)
  landing-site/assets/previews/birthday-*.webp       (6 pictures)

Then git add . && git commit && git push. Cloudflare builds and deploys by itself.
To hide the section later: set "enabled": false in landing-site/birthday.json.
