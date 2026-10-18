#!/usr/bin/env node
// Build one client (or all) into READY-TO-UPLOAD/<client>/  (that folder is exactly what you upload).
//   node engine/build/build.mjs <client>        -> index.html + app.css + app.js + assets/ + robots.txt
//   node engine/build/build.mjs --all           every folder in clients/ (skips names starting with _)
//   add --single-file for one self-contained index.html (no link previews, no music)
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { compile, render, TemplateError } from './lib/engine.mjs';
import { makeAssets } from './lib/assets.mjs';
import { finalize, validate, runtimeConfig, deepMerge } from './lib/config.mjs';
import { imageInfo } from './lib/imgsize.mjs';

export const ENGINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // .../engine
export const ROOT = path.resolve(ENGINE, '..'); // project folder (clients/, templates/, READY-TO-UPLOAD/)
const read = (p) => fs.readFileSync(p, 'utf8');
const PRELUDE = 'var d=K.d,html=K.html,$=K.$,$$=K.$$,G=K.G,ST=K.ST,ok=K.ok,full=K.full,reduce=K.reduce,Y=K.Y,rnd=K.rnd,burst=K.burst,words=K.words,WI=K.WI,enter=K.enter,tlx=K.tlx,head=K.head,fade=K.fade,bloom=K.bloom,sway=K.sway,drift=K.drift,showAll=K.showAll,S=K.S,CONFIG=K.CONFIG;';

export function build(slug, { split = true, out = path.join(ROOT, 'READY-TO-UPLOAD'), quiet = false, clientsDir = path.join(ROOT, 'clients'), overrides = null } = {}) {
  const clientDir = path.join(clientsDir, slug);
  const clientFile = path.join(clientDir, 'client.json');
  if (!fs.existsSync(clientFile)) throw new Error(`No such client: ${path.relative(ROOT, clientFile)}`);
  const client = overrides ? deepMerge(JSON.parse(read(clientFile)), overrides) : JSON.parse(read(clientFile));
  const tplId = client.template || 'royal-maroon-gold';
  const tplDir = path.join(ROOT, 'templates', tplId);
  if (!fs.existsSync(tplDir)) throw new Error(`Unknown template "${tplId}" (see templates/)`);
  const template = JSON.parse(read(path.join(tplDir, 'template.json')));
  const defaults = JSON.parse(read(path.join(tplDir, 'defaults.json')));
  const cfg = finalize(client, defaults, slug);

  const enabled = new Set(template.sections.filter((s) => s.required || cfg.sections[s.id] !== false).map((s) => s.id));
  const { errors, warnings } = validate(cfg, { template, clientDir, enabled, client, defaults });
  if (errors.length) throw new Error(`Config problems in clients/${slug}/client.json:\n  - ${errors.join('\n  - ')}`);

  const outDir = path.join(out, slug);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });
  const assets = makeAssets({ mode: split ? 'split' : 'inline', root: ROOT, engine: ENGINE, tplDir, clientDir, outDir });
  const cache = {};
  const partial = (name) => { const f = path.join(tplDir, name); return (cache[f] ||= compile(read(f), name)); };
  const mk = (name, extra = {}) => render(compile(read(path.join(tplDir, name)), name), [cfg, { ...extra }], { assets, partial, name });
  const comp = (id) => path.join('components', id, `${id}.html`);

  // --- svg art: every svg/*.html partial becomes {{{svg.<name>}}}; seal*.html get two halves with unique gradient ids
  const svgDir = path.join('svg');
  const camel = (n) => n.replace(/-(\w)/g, (_, c) => c.toUpperCase());
  const edgesFile = path.join(tplDir, svgDir, 'edges.json');
  const edgeDefs = fs.existsSync(edgesFile) ? JSON.parse(read(edgesFile)) : null;
  const tornFile = path.join(tplDir, svgDir, 'torn.json');
  const tornPaths = fs.existsSync(tornFile) ? JSON.parse(read(tornFile)) : [];
  const seal = (file, text, tag) => [`${tag}-a`, `${tag}-b`].map((gid) => mk(path.join(svgDir, file), { gid, text }).trim());
  cfg.svg = {};
  for (const f of fs.readdirSync(path.join(tplDir, svgDir)).filter((n) => n.endsWith('.html'))) {
    const base = f.replace(/\.html$/, '');
    if (base === 'seal') cfg.svg.sealGate = seal(f, cfg.couple.initials, 'sg');
    else if (base === 'seal-rsvp') cfg.svg.sealRsvp = seal(f, cfg.rsvp.sealText, 'sr');
    else cfg.svg[camel(base)] = mk(path.join(svgDir, f)).trim();
  }

  // --- sections with automatic edges between differently-toned sections
  const edge = (style, toTone, n) => {
    if (edgeDefs) { const d = edgeDefs[style]?.[toTone]; if (!d) throw new Error(`template edge "${style}" has no "${toTone}" variant (svg/edges.json)`); return Array.isArray(d) ? d[n % d.length] : d; }
    if (style === 'curve') return toTone === 'dark'
      ? '<svg class="curve ctop" viewBox="0 0 390 44" preserveAspectRatio="none" aria-hidden="true"><path class="cf" d="M0 44V28Q195 -14 390 28V44Z"/><path class="cl" pathLength="1" d="M0 28Q195 -14 390 28"/></svg>'
      : '<svg class="curve cbot" viewBox="0 0 390 44" preserveAspectRatio="none" aria-hidden="true"><path class="cf" d="M0 44V12Q195 54 390 12V44Z"/><path class="cl" pathLength="1" d="M0 12Q195 54 390 12"/></svg>';
    return `<svg class="torn${toTone === 'dark' ? ' dk' : ''}" viewBox="0 0 390 26" preserveAspectRatio="none" aria-hidden="true"><path d="${tornPaths[n % tornPaths.length]}"/></svg>`;
  };
  const order = template.sections.filter((s) => enabled.has(s.id));
  let prevTone = null; const edgeN = {};
  const parts = [];
  for (const s of order) {
    if (prevTone && prevTone !== s.tone && s.edge) { parts.push(edge(s.edge, s.tone, edgeN[s.edge] || 0)); edgeN[s.edge] = (edgeN[s.edge] || 0) + 1; }
    parts.push(mk(comp(s.id)).trim());
    prevTone = s.tone;
  }
  const hasMusic = !!cfg.music.src;
  if (hasMusic) cfg.music.url = assets.client(cfg.music.src);
  const ctx = { sections: parts.join('\n '), gate: mk(comp(template.gate)).trim(), music: hasMusic ? mk(comp('music')).trim() : '' };

  // --- css
  const comps = [template.gate, ...order.map((s) => s.id)];
  const cssOf = (id) => path.join(tplDir, 'components', id, `${id}.css`);
  const files = [];
  for (const item of template.css.order) {
    if (item === '@gate') files.push(cssOf(template.gate));
    else if (item === '@sections') order.forEach((s) => files.push(cssOf(s.id)));
    else if (item === '@optional') { if (hasMusic) files.push(cssOf('music')); }
    else files.push(path.join(tplDir, item));
  }
  const sharedUrl = (rel) => assets.shared(rel.replace(/^shared:/, ''));
  const fontCss = template.fonts.map((f) => `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:${f.style};font-display:block;src:url(${sharedUrl(f.file)}) format('woff2')}`).join('\n');
  const cssSrc = files.map((f) => `/* ${path.relative(tplDir, f)} */\n${read(f)}`).join('\n');
  const cssBody = render(compile(cssSrc, 'css'), [cfg], { assets, partial, name: 'css' });
  const css = fontCss + '\n' + cssBody;

  // --- js
  const runtime = runtimeConfig(cfg, hasMusic);
  const jsComps = [...comps, ...(hasMusic ? ['music'] : [])];
  const js = '(function(){\n' + `var CONFIG=${JSON.stringify(runtime).replace(/</g, '\\u003c')};\n` + read(path.join(ENGINE, template.js.core.replace('shared:', 'shared/'))) + '\n'
    + jsComps.map((id) => `/* component: ${id} */\nK.add('${id}',function(){${PRELUDE}\n${read(path.join(tplDir, 'components', id, `${id}.js`))}});`).join('\n')
    + '\n' + read(path.join(ENGINE, template.js.boot.replace('shared:', 'shared/'))) + '\n})();\n';
  const vendor = template.vendor.map((v) => read(path.join(ENGINE, v.replace('shared:', 'shared/'))));

  // --- link-preview picture (Open Graph): social apps need an absolute https address, so seo.url is required
  Object.assign(cfg.seo, { ogImageUrl: '', ogImageType: '', ogImageW: '', ogImageH: '', ogImageAlt: `${cfg.couple.first} ${cfg.couple.joiner} ${cfg.couple.second} wedding invitation` });
  if (cfg.seo.ogImage && split && cfg.seo.url) {
    const rel = assets.client(cfg.seo.ogImage); cfg.seo.ogImageUrl = new URL(rel, cfg.seo.url.endsWith('/') ? cfg.seo.url : cfg.seo.url + '/').href;
    const info = imageInfo(path.resolve(clientDir, cfg.seo.ogImage)); cfg.seo.ogImageType = info.type; if (info.w) { cfg.seo.ogImageW = String(info.w); cfg.seo.ogImageH = String(info.h); }
    if (info.w && (info.w < 600 || Math.abs(info.w / info.h - 1.91) > 0.15)) warnings.push(`seo.ogImage is ${info.w}x${info.h}: link previews look best at 1200x630 (python engine/tools/make-og.py ${slug})`);
    if (fs.statSync(path.resolve(clientDir, cfg.seo.ogImage)).size > 400 * 1024) warnings.push('seo.ogImage is over 400 KB: WhatsApp may skip large preview pictures');
  } else if (cfg.seo.ogImage) warnings.push('seo.ogImage is set but shared links still need seo.url (the final https address) to show the picture');
  else warnings.push(`no link-preview picture: run  python engine/tools/make-og.py ${slug}  then set seo.url`);

  if (split) {
    fs.writeFileSync(path.join(outDir, 'app.css'), css);
    fs.writeFileSync(path.join(outDir, 'app.js'), js);
    ctx.headAssets = '<link rel="stylesheet" href="app.css">';
    ctx.scripts = template.vendor.map((v) => `<script src="${sharedUrl(v)}"></script>`).join('\n') + '\n<script src="app.js"></script>';
  } else {
    ctx.headAssets = `<style>\n${css}\n</style>`;
    ctx.scripts = vendor.map((v) => `<script>${v}</script>`).join('\n') + `\n<script>\n${js}</script>`;
  }
  const page = render(compile(read(path.join(tplDir, template.page)), 'page'), [cfg, ctx], { assets, partial, name: 'page' });
  fs.writeFileSync(path.join(outDir, 'index.html'), page);
  fs.writeFileSync(path.join(outDir, 'robots.txt'), cfg.seo.noindex ? 'User-agent: facebookexternalhit\nUser-agent: WhatsApp\nUser-agent: Twitterbot\nUser-agent: LinkedInBot\nAllow: /\n\nUser-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');

  const bytes = Buffer.byteLength(page);
  const meta = { slug, template: `${template.id}@${template.version}`, mode: split ? 'split' : 'inline', builtAt: new Date().toISOString(), indexBytes: bytes, sha1: crypto.createHash('sha1').update(page).digest('hex'), sections: order.map((s) => s.id), warnings };
  fs.writeFileSync(path.join(clientDir, 'last-build.json'), JSON.stringify(meta, null, 1)); // private log, never uploaded
  if (!quiet) {
    console.log(`✔ ${slug}  (${meta.template})  sections: ${meta.sections.join(', ')}`);
    warnings.forEach((w) => console.log(`  ! ${w}`));
    console.log(`  UPLOAD THIS FOLDER → ${path.relative(process.cwd(), outDir)}`);
  }
  return { outDir, meta, template, cfg, warnings };
}

// ---- CLI
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const split = !args.includes('--single-file');
  const oi = args.indexOf('--out'); const out = oi > -1 ? path.resolve(args[oi + 1]) : path.join(ROOT, 'READY-TO-UPLOAD');
  const names = args.includes('--all')
    ? fs.readdirSync(path.join(ROOT, 'clients')).filter((n) => !n.startsWith('_') && fs.existsSync(path.join(ROOT, 'clients', n, 'client.json')))
    : args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
  if (!names.length) { console.error('Usage: node engine/build/build.mjs <client-name> | --all  [--single-file] [--out dir]'); process.exit(1); }
  let failed = 0;
  for (const n of names) { try { build(n, { split, out }); } catch (e) { failed++; console.error(`✖ ${n}: ${e instanceof TemplateError ? 'template error: ' : ''}${e.message}`); } }
  process.exit(failed ? 1 : 0);
}
