#!/usr/bin/env node
// `npm run build`
//   npm run build                    builds EVERY couple and the sales website into READY-TO-UPLOAD/ (what Cloudflare / any host runs)
//   npm run build -- <couple-name>   builds just that couple
//   add --single-file for one self-contained index.html per page
import fs from 'node:fs';
import path from 'node:path';
import { build, ROOT } from './build.mjs';
import { buildSite } from './build-site.mjs';
import { TemplateError } from './lib/engine.mjs';

const args = process.argv.slice(2);
const split = !args.includes('--single-file');
const oi = args.indexOf('--out'); const out = oi > -1 ? path.resolve(args[oi + 1]) : path.join(ROOT, 'READY-TO-UPLOAD');
const named = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
const everything = !named.length;
const names = everything ? fs.readdirSync(path.join(ROOT, 'clients')).filter((n) => !n.startsWith('_') && fs.existsSync(path.join(ROOT, 'clients', n, 'client.json'))) : named;
let failed = 0;
for (const n of names) { try { build(n, { split, out }); } catch (e) { failed++; console.error(`✖ ${n}: ${e instanceof TemplateError ? 'template error: ' : ''}${e.message}`); } }
if (everything) { try { buildSite({ single: !split, out }); } catch (e) { failed++; console.error('✖ sales website: ' + e.message); } }
if (failed) { console.error(`\n${failed} build step(s) failed.`); process.exit(1); }
if (everything) console.log('\n✔ Everything built. The website is in READY-TO-UPLOAD/sales-website');
