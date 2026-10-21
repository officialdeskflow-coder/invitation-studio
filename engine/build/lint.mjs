#!/usr/bin/env node
// `npm test`: builds every client (inline + split) into a temp folder and runs static safety checks.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, ROOT } from './build.mjs';
import { buildSite } from './build-site.mjs';

const PRELUDE_NAMES = ['K'];
let failures = 0, checks = 0;
const ok = (m) => { checks++; console.log('  ✔ ' + m); };
const bad = (m) => { checks++; failures++; console.log('  ✖ ' + m); };
const must = (cond, pass, fail) => (cond ? ok(pass) : bad(fail));
const read = (p) => fs.readFileSync(p, 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invi-lint-'));

function checkHtml(label, dir, template) {
  const html = read(path.join(dir, 'index.html'));
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const stripped = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  must(!/\{\{|\}\}/.test(stripped), `${label}: no unresolved template tags`, `${label}: unresolved {{ }} left in the HTML`);
  const ids = [...stripped.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
  must(!dup.length, `${label}: all ${ids.length} ids unique`, `${label}: duplicate ids: ${[...new Set(dup)].join(', ')}`);
  const idset = new Set(ids);
  const missingReq = template.requiredIds.filter((i) => !idset.has(i));
  must(!missingReq.length, `${label}: required ids present`, `${label}: missing required ids: ${missingReq.join(', ')}`);
  const refs = [...stripped.matchAll(/(?:aria-controls|aria-labelledby|for)="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/))
    .concat([...stripped.matchAll(/(?:href|xlink:href)="#([^"]+)"/g)].map((m) => m[1]));
  const dangling = refs.filter((r) => !idset.has(r));
  must(!dangling.length, `${label}: every reference points to an existing id`, `${label}: dangling references: ${[...new Set(dangling)].join(', ')}`);
  const imgs = [...stripped.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  must(imgs.every((t) => /\salt="/.test(t) && /\swidth="/.test(t) && /\sheight="/.test(t)), `${label}: ${imgs.length} images all have alt, width and height`, `${label}: an <img> lacks alt/width/height (causes layout shift)`);
  must(/<html lang="[a-z-]+"/.test(html) && /<title>[^<]+<\/title>/.test(html) && /name="viewport"/.test(html), `${label}: lang, title and viewport set`, `${label}: missing lang/title/viewport`);
  const app = dir.includes('split') ? read(path.join(dir, 'app.js')) : scripts[scripts.length - 1];
  try { new Function(app); ok(`${label}: application JavaScript parses`); } catch (e) { bad(`${label}: JavaScript syntax error: ${e.message}`); }
  const css = dir.includes('split') ? read(path.join(dir, 'app.css')) : [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).sort((a, b) => b.length - a.length)[0] || '';
  must((css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length && css.length > 1000, `${label}: CSS braces balanced`, `${label}: CSS braces unbalanced`);
  must(!/@@|\$\{[\w.]+\}/.test(stripped), `${label}: no leftover placeholders`, `${label}: leftover @@ or \${} placeholder`);
  const kb = Buffer.byteLength(html) / 1024;
  must(dir.includes('split') || kb < 2500, `${label}: index.html is ${kb.toFixed(0)} KB`, `${label}: index.html is ${kb.toFixed(0)} KB (over 2.5 MB; use --split)`);
}

console.log('\nTemplates');
for (const t of fs.readdirSync(path.join(ROOT, 'templates'))) {
  const dir = path.join(ROOT, 'templates', t); if (!fs.statSync(dir).isDirectory()) continue;
  const tj = JSON.parse(read(path.join(dir, 'template.json'))); JSON.parse(read(path.join(dir, 'defaults.json')));
  if (tj.kind === 'app') {
    const ad = path.join(ROOT, 'engine', tj.app.replace('shared:', 'shared/'));
    const need = ['app.js', 'style.css', 'page.html'].filter((f) => !fs.existsSync(path.join(ad, f))).concat([...tj.fonts.map((f) => f.file), ...tj.vendor].map((f) => path.join('..', f.replace('shared:', ''))).filter((f) => !fs.existsSync(path.join(ROOT, 'engine', 'shared', f.replace('../', '')))));
    must(!need.length, `${t}: app files, fonts and animation library all exist`, `${t}: missing ${need.join(', ')}`);
    try { new Function(read(path.join(ad, 'app.js'))); ok(`${t}: app script parses`); } catch (e) { bad(`${t}: app.js syntax: ${e.message}`); }
    continue;
  }
  const comps = [tj.gate, ...tj.sections.map((s) => s.id)];
  const missing = comps.flatMap((c) => ['html', 'css', 'js'].map((x) => `components/${c}/${c}.${x}`)).filter((f) => !fs.existsSync(path.join(dir, f)));
  must(!missing.length, `${t}: every component has html, css and js`, `${t}: missing files: ${missing.join(', ')}`);
  for (const c of comps) { try { new Function('K', `var CONFIG;${read(path.join(dir, 'components', c, c + '.js'))}`); } catch (e) { bad(`${t}/${c}.js syntax: ${e.message}`); } }
  ok(`${t}: component scripts parse`);
}

console.log('\nClients');
const clients = fs.readdirSync(path.join(ROOT, 'clients')).filter((n) => !n.startsWith('_') && fs.existsSync(path.join(ROOT, 'clients', n, 'client.json')));
const isApp = (c) => { try { const t = JSON.parse(read(path.join(ROOT, 'clients', c, 'client.json'))).template || 'royal-maroon-gold'; return JSON.parse(read(path.join(ROOT, 'templates', t, 'template.json'))).kind === 'app'; } catch { return false; } };
const wedding = clients.filter((c) => !isApp(c));
function checkApp(label, dir) {
  const html = read(path.join(dir, 'index.html')), stripped = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  must(!/\{\{|\}\}/.test(stripped), `${label}: no unresolved template tags`, `${label}: unresolved {{ }} left in the HTML`);
  must(/<html lang="[a-z-]+"/.test(html) && /<title>[^<]+<\/title>/.test(html) && /name="viewport"/.test(html) && /id="app"/.test(html), `${label}: lang, title, viewport and #app present`, `${label}: missing lang/title/viewport/#app`);
  const js = dir.includes('split') ? read(path.join(dir, 'app.js')) : [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]).pop();
  try { new Function(js); ok(`${label}: JavaScript parses`); } catch (e) { bad(`${label}: JavaScript syntax error: ${e.message}`); }
  must(/^window\.INVITE=\{/.test(js.trimStart()), `${label}: the party details are built into the script`, `${label}: window.INVITE missing`);
  const css = dir.includes('split') ? read(path.join(dir, 'app.css')) : [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1])[0] || '';
  must((css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length && css.length > 5000 && /@font-face/.test(css), `${label}: CSS braces balanced, fonts included`, `${label}: CSS problem`);
  if (dir.includes('split')) { const refs = [...(html + css).matchAll(/assets\/[\w.-]+/g)].map((m) => m[0]); must(refs.length > 0 && refs.every((f) => fs.existsSync(path.join(dir, f))), `${label}: every referenced file is in the folder`, `${label}: a referenced file is missing`); }
}
for (const c of clients) for (const split of [false, true]) if (isApp(c)) {
  const label = `${c} (${split ? 'split' : 'inline'})`;
  try { const out = path.join(tmp, split ? 'split' : 'inline'); build(c, { split, out, quiet: true }); checkApp(label, path.join(out, c)); } catch (e) { bad(`${label}: build failed: ${e.message.split('\n')[0]}`); }
}
for (const c of wedding) for (const split of [false, true]) {
  const label = `${c} (${split ? 'split' : 'inline'})`;
  try {
    const out = path.join(tmp, split ? 'split' : 'inline');
    const r = build(c, { split, out, quiet: true });
    checkHtml(label, path.join(out, c), r.template);
  } catch (e) { bad(`${label}: build failed: ${e.message.split('\n')[0]}`); }
}

console.log('\nValidation catches mistakes');
const demo = JSON.parse(read(path.join(ROOT, 'clients', wedding[0], 'client.json')));
const neg = (name, mutate, expect) => {
  const dir = path.join(tmp, 'neg'); const cd = path.join(dir, 'x'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(cd, { recursive: true });
  fs.cpSync(path.join(ROOT, 'clients', wedding[0], 'photos'), path.join(cd, 'photos'), { recursive: true });
  const cfg = JSON.parse(JSON.stringify(demo)); mutate(cfg); fs.writeFileSync(path.join(cd, 'client.json'), JSON.stringify(cfg));
  try { build('x', { out: path.join(dir, 'o'), quiet: true, clientsDir: dir }); bad(`${name}: build should have failed`); } catch (e) { must(expect.test(e.message), `${name}: rejected with a clear message`, `${name}: wrong message: ${e.message.split('\n')[1] || e.message}`); }
};
neg('bad date', (c) => { c.date.iso = '17/04/2027'; }, /date\.iso/);
neg('missing photo', (c) => { c.gallery.photos[0] = 'photos/nope.webp'; }, /file not found/);
neg('too many guests', (c) => { c.rsvp.maxGuests = 40; }, /maxGuests/);
neg('insecure rsvp url', (c) => { c.rsvp.endpoint = 'http://example.com/x'; }, /https/);
neg('unknown template', (c) => { c.template = 'does-not-exist'; }, /Unknown template/);
neg('required section off', (c) => { c.sections = { hero: false }; }, /not an optional section/);
neg('empty schedule', (c) => { c.schedule.events = []; }, /schedule\.events/);

console.log('\nOptional sections can be switched off');
{
  const dir = path.join(tmp, 'lite'); const cd = path.join(dir, 'lite'); fs.mkdirSync(cd, { recursive: true });
  fs.cpSync(path.join(ROOT, 'clients', wedding[0], 'photos'), path.join(cd, 'photos'), { recursive: true });
  const cfg = JSON.parse(JSON.stringify(demo)); cfg.sections = { countdown: false, schedule: false, venue: false, gallery: false, rsvp: false }; fs.writeFileSync(path.join(cd, 'client.json'), JSON.stringify(cfg));
  try { const r = build('lite', { out: path.join(dir, 'o'), quiet: true, clientsDir: dir, split: false }); checkHtml('lite (all optional sections off)', path.join(dir, 'o', 'lite'), r.template); must(r.meta.sections.join() === 'hero,invite,closing', 'lite: only required sections remain', 'lite: wrong section list ' + r.meta.sections); }
  catch (e) { bad('lite build failed: ' + e.message); }
}

console.log('\nLanding page');
try {
  const out = path.join(tmp, 'site'); const r = buildSite({ out, quiet: true }); const dir = r.outDir;
  const html = read(path.join(dir, 'index.html')); const stripped = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  must(!/\{\{|\}\}/.test(stripped) && !/@@|\$\{[\w.]+\}/.test(stripped), 'landing: no unresolved placeholders', 'landing: unresolved placeholder in the HTML');
  const ids = [...stripped.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]); const dups = ids.filter((v, i) => ids.indexOf(v) !== i);
  must(!dups.length, `landing: ${ids.length} ids unique`, `landing: duplicate ids ${[...new Set(dups)].join(', ')}`);
  const dangling = [...stripped.matchAll(/(?:href|xlink:href)="#([^"]*)"/g)].map((m) => m[1]).filter((h) => h && !ids.includes(h));
  must(!dangling.length, 'landing: every # link and icon resolves', `landing: dangling # references ${dangling.join(', ')}`);
  const imgs = [...stripped.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  must(imgs.length > 0 && imgs.every((t) => /\salt=/.test(t) && /\swidth="/.test(t) && /\sheight="/.test(t)), `landing: ${imgs.length} images have alt, width and height`, 'landing: an <img> lacks alt/width/height');
  const blank = [...stripped.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)].map((m) => m[0]);
  must(blank.every((t) => /rel="[^"]*noopener/.test(t)), `landing: ${blank.length} external links use noopener`, 'landing: a _blank link lacks rel=noopener');
  try { new Function(read(path.join(dir, 'site.js'))); ok('landing: site.js parses'); } catch (e) { bad('landing: site.js syntax: ' + e.message); }
  const css = read(path.join(dir, 'site.css')); must((css.match(/\{/g) || []).length === (css.match(/\}/g) || []).length, 'landing: CSS braces balanced', 'landing: CSS braces unbalanced');
  const demoOk = r.site.demos.items.every((d) => fs.existsSync(path.join(dir, 'demo', d.path, 'index.html')));
  must(demoOk, 'landing: both live demos are inside the folder', 'landing: a demo folder is missing');
  must(/<h1[\s>]/.test(stripped) && (stripped.match(/<h1[\s>]/g) || []).length === 1, 'landing: exactly one h1', 'landing: needs exactly one h1');
  must(/https:\/\/wa\.me\/\d{8,15}/.test(html), 'landing: WhatsApp links are well formed', 'landing: WhatsApp link malformed');
} catch (e) { bad('landing build failed: ' + e.message.split('\n')[0]); }
{
  const sd = path.join(tmp, 'badsite'); fs.cpSync(path.join(ROOT, 'landing-site'), sd, { recursive: true });
  const sj = JSON.parse(read(path.join(sd, 'site.json'))); sj.contact.whatsapp = 'call me'; fs.writeFileSync(path.join(sd, 'site.json'), JSON.stringify(sj));
  try { buildSite({ out: path.join(tmp, 'badout'), quiet: true, siteDir: sd }); bad('landing: bad WhatsApp number should be rejected'); } catch (e) { must(/whatsapp/i.test(e.message), 'landing: bad WhatsApp number rejected with a clear message', 'landing: wrong message ' + e.message.split('\n')[1]); }
}

console.log('\nLink previews (shared links show a picture)');
{
  const dir = path.join(tmp, 'og'); const cd = path.join(dir, 'ogc'); fs.mkdirSync(cd, { recursive: true });
  fs.cpSync(path.join(ROOT, 'clients', wedding[0], 'photos'), path.join(cd, 'photos'), { recursive: true });
  const cfg = JSON.parse(JSON.stringify(demo)); cfg.seo = { noindex: true, url: 'https://cards.example.com/ogc/', ogImage: 'photos/og.jpg' }; fs.writeFileSync(path.join(cd, 'client.json'), JSON.stringify(cfg));
  try {
    const r = build('ogc', { out: path.join(dir, 'o'), quiet: true, clientsDir: dir }); const html = read(path.join(r.outDir, 'index.html'));
    const img = (html.match(/property="og:image" content="([^"]+)"/) || [])[1] || '';
    must(/^https:\/\/cards\.example\.com\/ogc\/assets\/[\w.-]+\.jpg$/.test(img), 'card: og:image is an absolute https address', `card: bad og:image "${img}"`);
    must(fs.existsSync(path.join(r.outDir, img.replace('https://cards.example.com/ogc/', ''))), 'card: the preview picture file is in the folder', 'card: og picture file missing');
    must(/og:image:width" content="1200"/.test(html) && /og:image:height" content="630"/.test(html) && /twitter:image/.test(html), 'card: picture size and twitter tags present', 'card: missing og size / twitter tags');
    must(/facebookexternalhit/.test(read(path.join(r.outDir, 'robots.txt'))), 'card: robots.txt lets link-preview crawlers in', 'card: robots.txt blocks preview crawlers');
  } catch (e) { bad('card link-preview build failed: ' + e.message.split('\n')[1]); }
  const sd = path.join(tmp, 'ogsite'); fs.cpSync(path.join(ROOT, 'landing-site'), sd, { recursive: true });
  const sj = JSON.parse(read(path.join(sd, 'site.json'))); sj.siteUrl = 'https://studio.example.com'; fs.writeFileSync(path.join(sd, 'site.json'), JSON.stringify(sj));
  try {
    const r = buildSite({ out: path.join(tmp, 'ogsiteout'), quiet: true, siteDir: sd }); const html = read(path.join(r.outDir, 'index.html'));
    must(/property="og:image" content="https:\/\/studio\.example\.com\/assets\/[\w.-]+\.jpg"/.test(html) && /og:image:width" content="1200"/.test(html), 'website: og:image is absolute with its size', 'website: og:image missing or relative');
    const d = read(path.join(r.outDir, 'demo', 'royal-maroon-gold', 'index.html'));
    must(/og:url" content="https:\/\/studio\.example\.com\/demo\/royal-maroon-gold\/"/.test(d) && /property="og:image" content="https:\/\/studio\.example\.com\/demo\/royal-maroon-gold\/assets\//.test(d), 'website: each demo card gets its own share picture', 'website: demo card share tags missing');
  } catch (e) { bad('website link-preview build failed: ' + e.message.split('\n')[1]); }
}
console.log('\nBirthday cards');
{
  const bd = clients.filter(isApp); const base = bd[0]; 
  if (!base) bad('no birthday demo client found');
  else {
    const demoB = JSON.parse(read(path.join(ROOT, 'clients', base, 'client.json')));
    const negB = (name, mutate, expect) => {
      const dir = path.join(tmp, 'negb'); const cd = path.join(dir, 'x'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(cd, { recursive: true });
      fs.cpSync(path.join(ROOT, 'clients', base, 'photos'), path.join(cd, 'photos'), { recursive: true });
      const cfg = JSON.parse(JSON.stringify(demoB)); mutate(cfg); fs.writeFileSync(path.join(cd, 'client.json'), JSON.stringify(cfg));
      try { build('x', { out: path.join(dir, 'o'), quiet: true, clientsDir: dir }); bad(`${name}: build should have failed`); } catch (e) { must(expect.test(e.message), `${name}: rejected with a clear message`, `${name}: wrong message: ${e.message.split('\n')[1]}`); }
    };
    negB('birthday: bad start time', (c) => { c.start = '12/12/2027'; }, /start must be/);
    negB('birthday: end before start', (c) => { c.end = '2000-01-01T10:00:00+05:30'; }, /end must be after start/);
    negB('birthday: RSVP on without a number', (c) => { c.rsvp = { enabled: true, whatsapp: '' }; }, /rsvp\.whatsapp/);
    negB('birthday: theme set by hand', (c) => { c.theme = 'gold'; }, /chosen by the template/);
    negB('birthday: age not a number', (c) => { c.age = 'five'; }, /age must be/);
    negB('birthday: missing preview picture', (c) => { c.seo.ogImage = 'photos/nope.jpg'; }, /file not found/);
    const dir = path.join(tmp, 'ogb'); const cd = path.join(dir, 'ogb'); fs.mkdirSync(cd, { recursive: true }); fs.cpSync(path.join(ROOT, 'clients', base, 'photos'), path.join(cd, 'photos'), { recursive: true });
    const cfg = JSON.parse(JSON.stringify(demoB)); cfg.seo = { noindex: true, url: 'https://cards.example.com/ogb/', ogImage: 'photos/og.jpg' }; fs.writeFileSync(path.join(cd, 'client.json'), JSON.stringify(cfg));
    try { const r = build('ogb', { out: path.join(dir, 'o'), quiet: true, clientsDir: dir }); const html = read(path.join(r.outDir, 'index.html'));
      must(/property="og:image" content="https:\/\/cards\.example\.com\/ogb\/assets\/[\w.-]+\.jpg"/.test(html) && /og:image:width" content="1200"/.test(html), 'birthday: link-preview picture is an absolute https address with its size', 'birthday: og:image missing or relative');
      must(/facebookexternalhit/.test(read(path.join(r.outDir, 'robots.txt'))), 'birthday: robots.txt lets link-preview crawlers in', 'birthday: robots.txt blocks preview crawlers');
    } catch (e) { bad('birthday link-preview build failed: ' + e.message.split('\n')[1]); }
    try { const r = buildSite({ out: path.join(tmp, 'sitebd'), quiet: true }); const miss = (r.extra || []).filter((d) => !fs.existsSync(path.join(r.outDir, 'demo', d.path, 'index.html')));
      must((r.extra || []).length >= 2 && !miss.length, `birthday: ${(r.extra || []).length} live demos are inside the sales website folder`, 'birthday: a demo folder is missing from the sales website');
    } catch (e) { bad('sales website build failed: ' + e.message.split('\n')[0]); }
  }
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${failures ? '✖' : '✔'} ${checks - failures}/${checks} checks passed`);
process.exit(failures ? 1 : 0);
