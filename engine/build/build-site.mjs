#!/usr/bin/env node
// Builds your sales website: landing-site/ (the SOURCE, never uploaded)  ->  READY-TO-UPLOAD/sales-website/   (upload THAT folder)
//   node engine/build/build-site.mjs                 full site: index.html + site.css + site.js + assets/ + demo/ (the two live demos)
//   node engine/build/build-site.mjs --single-file   one self-contained index.html (demo buttons use "previewUrl")
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, ENGINE, build } from './build.mjs';
import { compile, render } from './lib/engine.mjs';
import { makeAssets } from './lib/assets.mjs';
import { imageInfo } from './lib/imgsize.mjs';

const read = (p) => fs.readFileSync(p, 'utf8');

export function buildSite({ single = false, out = path.join(ROOT, 'READY-TO-UPLOAD'), quiet = false, siteDir = path.join(ROOT, 'landing-site') } = {}) {
  const site = JSON.parse(read(path.join(siteDir, 'site.json')));
  const errors = [], warnings = [];
  const digits = String(site.contact.whatsapp || '').replace(/\D/g, '');
  if (!site.brand?.name) errors.push('brand.name is required');
  if (digits.length < 8 || digits.length > 15) errors.push('contact.whatsapp must be the full number with country code, digits only (for example 919876543210)');
  if (/^\d{1,3}0{8,}$/.test(digits)) warnings.push('contact.whatsapp is still the placeholder number: every Book button opens a chat with it');
  if (!site.siteUrl) warnings.push('siteUrl is empty: no link preview picture, canonical link or sitemap (set it to your final https:// address)');
  else if (!/^https:\/\//.test(site.siteUrl)) errors.push('siteUrl must start with https://');
  if (!site.pricing.items.some((p) => p.price)) warnings.push('No package has a price yet: the page shows "Price on request"');
  for (const it of site.demos.items) {
    if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(it.path)) errors.push(`demo path "${it.path}" must be lowercase letters, numbers and dashes`);
    if (!single && !fs.existsSync(path.join(ROOT, 'clients', it.client, 'client.json'))) errors.push(`demo client not found: clients/${it.client}`);
    for (const im of it.images) if (!fs.existsSync(path.join(siteDir, 'assets', 'previews', `${im}.webp`))) errors.push(`missing preview image landing-site/assets/previews/${im}.webp (run: python engine/tools/make-previews.py)`);
    if (single && !it.previewUrl) warnings.push(`demo "${it.name}" has no previewUrl: its button will not open anything in a single-file build`);
  }
  if (errors.length) throw new Error(`Problems in landing-site/site.json:\n  - ${errors.join('\n  - ')}`);

  const outDir = path.join(out, 'sales-website');
  fs.rmSync(outDir, { recursive: true, force: true }); fs.mkdirSync(outDir, { recursive: true });
  const assets = makeAssets({ mode: single ? 'inline' : 'split', root: ROOT, engine: ENGINE, tplDir: siteDir, clientDir: siteDir, outDir });

  // ---- derived fields
  const wa = (msg) => `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
  const intro = site.book.messageIntro;
  site.contact.waBase = `https://wa.me/${digits}`;
  site.contact.waUrl = wa(intro);
  site.planners.waUrl = wa('Hello! I am a wedding planner and would like to ask about planner rates.');
  site.demos.items.forEach((it) => { it.waUrl = wa(`${intro} I would like the "${it.name}" design.`); it.href = single ? (it.previewUrl || '#') : `demo/${it.path}/`; [it.shotA, it.shotB, it.shotC] = it.images.map((im) => assets.tpl(`previews/${im}.webp`)); });
  site.pricing.items.forEach((p) => { p.waUrl = wa(`${intro} I am interested in the ${p.name} package.`); });
  site.year = new Date().getFullYear();
  Object.assign(site.seo, { ogImageUrl: '', ogImageType: '', ogImageW: '', ogImageH: '', ogImageAlt: `${site.brand.name}: ${site.brand.tagline}` });
  const ogFile = site.seo.ogImage ? path.join(siteDir, 'assets', site.seo.ogImage) : '';
  if (ogFile && !fs.existsSync(ogFile)) errors.push(`seo.ogImage not found: landing-site/assets/${site.seo.ogImage} (run: python engine/tools/make-previews.py)`);
  if (ogFile && site.siteUrl && !single && !errors.length) { site.seo.ogImageUrl = new URL(assets.tpl(site.seo.ogImage), site.siteUrl.replace(/\/?$/, '/')).href; const info = imageInfo(ogFile); site.seo.ogImageType = info.type; if (info.w) { site.seo.ogImageW = String(info.w); site.seo.ogImageH = String(info.h); } }
  site.jsonld = site.siteUrl ? JSON.stringify({ '@context': 'https://schema.org', '@type': 'ProfessionalService', name: site.brand.name, url: site.siteUrl, description: site.seo.description }).replace(/</g, '\\u003c') : '';

  // ---- fonts, css, js
  const fontUrl = (f) => assets.shared(`fonts/${f.file}`);
  const fontCss = site.fonts.map((f) => `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style};font-display:swap;src:url(${fontUrl(f)}) format('woff2')}`).join('\n');
  const css = fontCss + '\n' + read(path.join(siteDir, 'site.css'));
  const js = read(path.join(siteDir, 'site.js'));
  site.preloads = '';
  if (single) { site.headAssets = `<style>\n${css}\n</style>`; site.scripts = `<script>\n${js}</script>`; }
  else { fs.writeFileSync(path.join(outDir, 'site.css'), css); fs.writeFileSync(path.join(outDir, 'site.js'), js); site.headAssets = '<link rel="stylesheet" href="site.css">'; site.scripts = '<script src="site.js"></script>'; }

  // ---- the two live demos travel inside the landing folder (full build only)
  if (!single) for (const it of site.demos.items) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invi-demo-'));
    const ov = site.siteUrl ? { seo: { url: `${site.siteUrl.replace(/\/?$/, '/')}demo/${it.path}/`, ...(fs.existsSync(path.join(ROOT, 'clients', it.client, 'photos', 'og.jpg')) ? { ogImage: 'photos/og.jpg' } : {}) } } : null;
    try { build(it.client, { out: tmp, split: true, quiet: true, overrides: ov }); fs.cpSync(path.join(tmp, it.client), path.join(outDir, 'demo', it.path), { recursive: true }); } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  }

  // ---- page + site files
  const html = render(compile(read(path.join(siteDir, 'page.html')), 'landing page'), [site], { assets, partial: () => { throw new Error('no partials in the landing page'); }, name: 'landing page' });
  fs.writeFileSync(path.join(outDir, 'index.html'), html);
  const base = site.siteUrl ? site.siteUrl.replace(/\/?$/, '/') : '';
  fs.writeFileSync(path.join(outDir, 'robots.txt'), (site.seo.noindex ? 'User-agent: *\nDisallow: /\n' : 'User-agent: facebookexternalhit\nUser-agent: WhatsApp\nUser-agent: Twitterbot\nUser-agent: LinkedInBot\nAllow: /\n\nUser-agent: *\nAllow: /\nDisallow: /demo/\n') + (base && !site.seo.noindex ? `Sitemap: ${base}sitemap.xml\n` : ''));
  if (base && !site.seo.noindex) fs.writeFileSync(path.join(outDir, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${base}</loc></url></urlset>\n`);
  if (!single) fs.writeFileSync(path.join(outDir, '_headers'), '/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n');
  fs.writeFileSync(path.join(siteDir, 'last-build.json'), JSON.stringify({ builtAt: new Date().toISOString(), mode: single ? 'single-file' : 'full', indexBytes: Buffer.byteLength(html), warnings }, null, 1));
  if (!quiet) { console.log(`✔ landing page (${single ? 'single file' : 'full'}, ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB index.html)`); warnings.forEach((w) => console.log(`  ! ${w}`)); console.log(`  UPLOAD THIS FOLDER → ${path.relative(process.cwd(), outDir)}`); }
  return { outDir, warnings, site };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2); const oi = args.indexOf('--out');
  try { buildSite({ single: args.includes('--single-file'), out: oi > -1 ? path.resolve(args[oi + 1]) : undefined }); } catch (e) { console.error('✖ ' + e.message); process.exit(1); }
}
