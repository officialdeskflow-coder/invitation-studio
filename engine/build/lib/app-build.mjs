// Builds "app" templates (the birthday cards). One shared engine (engine/shared/birthday/) serves every app template;
// a template only chooses the look (theme) and fonts, and each client.json supplies the party's details.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { compile, render } from './engine.mjs';
import { makeAssets } from './assets.mjs';
import { deepMerge } from './config.mjs';
import { imageInfo } from './imgsize.mjs';

const read = (p) => fs.readFileSync(p, 'utf8');
const KNOWN = new Set(['template', 'lang', 'pageTitle', 'kicker', 'name', 'age', 'occasion', 'subtitle', 'start', 'end', 'venue', 'details', 'schedule', 'host', 'rsvp', 'texts', 'seo']);
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;
const str = (v) => typeof v === 'string' && v.trim().length > 0;

export function validateApp(cfg, client, { clientDir, slug }) {
  const errors = [], warnings = [], E = (m) => errors.push(m), W = (m) => warnings.push(m);
  if (client.theme !== undefined) E('"theme" is chosen by the template (birthday-party or birthday-gold); remove it from client.json');
  for (const k of Object.keys(client)) if (!k.startsWith('_') && !KNOWN.has(k)) W(`unknown setting "${k}" is ignored (typo?)`);
  if (!str(cfg.pageTitle) || cfg.pageTitle.length > 80) E('pageTitle is required (up to 80 characters), for example "Aarav’s 5th Birthday Party"');
  if (!str(cfg.name) || cfg.name.length > 40) E('name is required (up to 40 characters), for example "Aarav’s"');
  if (!Number.isInteger(cfg.age) || cfg.age < 1 || cfg.age > 120) E('age must be a whole number from 1 to 120');
  if (!ISO.test(cfg.start || '') || Number.isNaN(Date.parse(cfg.start))) E('start must be the party time with its offset, like 2026-12-12T16:00:00+05:30');
  else {
    if (Date.parse(cfg.start) < Date.now()) W('start is in the past: the countdown will show zeros');
    if (cfg.end) { if (!ISO.test(cfg.end) || Number.isNaN(Date.parse(cfg.end))) E('end must look like 2026-12-12T19:00:00+05:30'); else if (Date.parse(cfg.end) <= Date.parse(cfg.start)) E('end must be after start'); }
  }
  if (!cfg.venue || !str(cfg.venue.name)) E('venue.name is required');
  else if (cfg.venue.mapUrl && !/^https:\/\//.test(cfg.venue.mapUrl)) E('venue.mapUrl must start with https:// (a Google Maps link)');
  else if (!cfg.venue.mapUrl) W('venue.mapUrl is empty: the "Open in Maps" button needs a link');
  if (!Array.isArray(cfg.details) || cfg.details.length > 6 || cfg.details.some((d) => !str(d.label) || !str(d.value))) E('details must be a list of up to 6 items, each with a label and a value');
  if (!Array.isArray(cfg.schedule) || cfg.schedule.length > 12 || cfg.schedule.some((s) => !str(s.time) || !str(s.title))) E('schedule must be a list of up to 12 items, each with a time and a title');
  const r = cfg.rsvp || {};
  if (typeof r.enabled !== 'boolean') E('rsvp.enabled must be true or false');
  else if (r.enabled) {
    if (!Number.isInteger(r.maxGuests) || r.maxGuests < 1 || r.maxGuests > 20) E('rsvp.maxGuests must be a whole number from 1 to 20');
    const digits = String(r.whatsapp || '').replace(/\D/g, '');
    if (r.endpoint) { if (!/^https:\/\//.test(r.endpoint)) E('rsvp.endpoint must start with https://'); }
    else if (digits.length < 8 || digits.length > 15) E('RSVP is on, so set rsvp.whatsapp (the host’s number: country code + digits only, like 919876543210) or rsvp.endpoint, or turn RSVP off with rsvp.enabled: false');
    else if (/^\d{1,3}0{8,}$/.test(digits)) W('rsvp.whatsapp is still the placeholder number: replies would open a chat with it');
  }
  if (cfg.seo.url && !/^https:\/\//.test(cfg.seo.url)) E('seo.url must start with https://');
  if (cfg.seo.ogImage && !fs.existsSync(path.resolve(clientDir, cfg.seo.ogImage))) E(`seo.ogImage: file not found: clients/${slug}/${cfg.seo.ogImage}`);
  return { errors, warnings };
}

export function buildApp({ slug, client, template, defaults, tplDir, clientDir, split, out, quiet, root, engine }) {
  const cfg = deepMerge(defaults, client);
  cfg.theme = template.theme;
  const { errors, warnings } = validateApp(cfg, client, { clientDir, slug });
  if (errors.length) throw new Error(`Config problems in clients/${slug}/client.json:\n  - ${errors.join('\n  - ')}`);

  const outDir = path.join(out, slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const assets = makeAssets({ mode: split ? 'split' : 'inline', root, engine, tplDir, clientDir, outDir });
  const appDir = path.join(engine, template.app.replace('shared:', 'shared/'));
  const sharedUrl = (rel) => assets.shared(rel.replace(/^shared:/, ''));

  // ---- css (fonts first) and js (this client's settings in front of the shared app)
  const fontCss = template.fonts.map((f) => `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style};font-display:swap;src:url(${sharedUrl(f.file)}) format('woff2')}`).join('\n');
  const css = fontCss + '\n' + read(path.join(appDir, 'style.css'));
  const runtime = { theme: cfg.theme, pageTitle: cfg.pageTitle, kicker: cfg.kicker, name: cfg.name, age: cfg.age, occasion: cfg.occasion, subtitle: cfg.subtitle, start: cfg.start, end: cfg.end || cfg.start, venue: cfg.venue, details: cfg.details, schedule: cfg.schedule, host: cfg.host, rsvp: cfg.rsvp, texts: cfg.texts };
  const js = `window.INVITE=${JSON.stringify(runtime).replace(/</g, '\\u003c')};\n` + read(path.join(appDir, 'app.js'));
  const vendor = template.vendor.map((v) => read(path.join(engine, v.replace('shared:', 'shared/'))));

  // ---- page details: title, description, favicon, link-preview picture
  cfg.themeColor = template.themeColor;
  cfg.seo.title = cfg.seo.title || cfg.pageTitle;
  cfg.seo.description = cfg.seo.description || `Tap to open the invitation to ${cfg.pageTitle}.`;
  const fav = cfg.theme === 'gold'
    ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#0e0b06"/><path d="M16 5l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#d6b878"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><ellipse cx="16" cy="13" rx="9" ry="10" fill="#ff6b57"/><path d="M14 23l2 4 2-4z" fill="#ff6b57"/></svg>';
  cfg.faviconSvg = encodeURIComponent(fav);
  Object.assign(cfg.seo, { ogImageUrl: '', ogImageType: '', ogImageW: '', ogImageH: '', ogImageAlt: `${cfg.pageTitle} invitation` });
  if (cfg.seo.ogImage && split && cfg.seo.url) {
    const rel = assets.client(cfg.seo.ogImage); cfg.seo.ogImageUrl = new URL(rel, cfg.seo.url.endsWith('/') ? cfg.seo.url : cfg.seo.url + '/').href;
    const file = path.resolve(clientDir, cfg.seo.ogImage), info = imageInfo(file); cfg.seo.ogImageType = info.type; if (info.w) { cfg.seo.ogImageW = String(info.w); cfg.seo.ogImageH = String(info.h); }
    if (info.w && (info.w < 600 || Math.abs(info.w / info.h - 1.91) > 0.15)) warnings.push(`seo.ogImage is ${info.w}x${info.h}: link previews look best at 1200x630`);
    if (fs.statSync(file).size > 400 * 1024) warnings.push('seo.ogImage is over 400 KB: WhatsApp may skip large preview pictures');
  } else if (cfg.seo.ogImage) warnings.push('seo.ogImage is set but shared links still need seo.url (the final https address) to show the picture');
  else warnings.push('no link-preview picture: add a 1200x630 picture to the client folder, then set seo.ogImage and seo.url');

  const ctx = {};
  if (split) {
    fs.writeFileSync(path.join(outDir, 'app.css'), css);
    fs.writeFileSync(path.join(outDir, 'app.js'), js);
    ctx.headAssets = '<link rel="stylesheet" href="app.css">';
    ctx.scripts = template.vendor.map((v) => `<script src="${sharedUrl(v)}"></script>`).join('\n') + '\n<script src="app.js"></script>';
  } else {
    ctx.headAssets = `<style>\n${css}\n</style>`;
    ctx.scripts = vendor.map((v) => `<script>${v}</script>`).join('\n') + `\n<script>\n${js}</script>`;
  }
  const page = render(compile(read(path.join(appDir, 'page.html')), 'birthday page'), [cfg, ctx], { assets, partial: () => { throw new Error('no partials in the birthday page'); }, name: 'birthday page' });
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  fs.writeFileSync(path.join(outDir, 'robots.txt'), cfg.seo.noindex ? 'User-agent: facebookexternalhit\nUser-agent: WhatsApp\nUser-agent: Twitterbot\nUser-agent: LinkedInBot\nAllow: /\n\nUser-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');

  const meta = { slug, template: `${template.id}@${template.version}`, mode: split ? 'split' : 'inline', builtAt: new Date().toISOString(), indexBytes: Buffer.byteLength(page), sha1: crypto.createHash('sha1').update(page).digest('hex'), sections: ['gate', 'hero', 'countdown', 'details', ...(cfg.schedule.length ? ['plan'] : []), 'venue', ...(cfg.rsvp.enabled ? ['rsvp'] : []), 'closing'], warnings };
  fs.writeFileSync(path.join(clientDir, 'last-build.json'), JSON.stringify(meta, null, 1)); // private log, never uploaded
  if (!quiet) {
    console.log(`✔ ${slug}  (${meta.template})  sections: ${meta.sections.join(', ')}`);
    warnings.forEach((w) => console.log(`  ! ${w}`));
    console.log(`  UPLOAD THIS FOLDER → ${path.relative(process.cwd(), outDir)}`);
  }
  return { outDir, meta, template, cfg, warnings };
}
