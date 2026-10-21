ADD THE TWO BIRTHDAY CARDS: copy these files into your project/git repo (same paths).
Nothing else changes. Do NOT replace landing-site/site.json, package.json or CHANGELOG.md.

CHANGED (already in your repo, replace them):
  engine/build/build.mjs
  engine/build/build-site.mjs
  engine/build/new-client.mjs
  engine/build/lint.mjs
All other listed files are NEW.

Then: git add . && git commit && git push. Cloudflare runs "npm run build" by itself.
Live demo links after the deploy:
  https://invitation-studio.officialdeskflow.workers.dev/demo/birthday-party/
  https://invitation-studio.officialdeskflow.workers.dev/demo/birthday-milestone/
Guide: docs/BIRTHDAY-CARDS.md
