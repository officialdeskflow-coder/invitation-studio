#!/usr/bin/env node
// node engine/build/new-template.mjs <new-id> [--from royal-maroon-gold]
// Copies an existing template as the starting point for a new design.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './build.mjs';

const args = process.argv.slice(2);
const id = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--from');
const fi = args.indexOf('--from'); const from = fi > -1 ? args[fi + 1] : 'royal-maroon-gold';
if (!id || !/^[a-z0-9][a-z0-9-]{2,40}$/.test(id)) { console.error('Usage: node engine/build/new-template.mjs <new-id> [--from royal-maroon-gold]'); process.exit(1); }
const src = path.join(ROOT, 'templates', from), dst = path.join(ROOT, 'templates', id);
if (!fs.existsSync(src)) { console.error(`Unknown template "${from}"`); process.exit(1); }
if (fs.existsSync(dst)) { console.error(`templates/${id} already exists.`); process.exit(1); }
fs.cpSync(src, dst, { recursive: true });
const tj = path.join(dst, 'template.json'); const t = JSON.parse(fs.readFileSync(tj, 'utf8'));
t.id = id; t.name = id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '); t.version = '0.1.0';
fs.writeFileSync(tj, JSON.stringify(t, null, 1));
console.log(`Created templates/${id} (copied from ${from}).\nNext: restyle components/*/*.css and base.css, swap assets/, adjust defaults.json,\nthen point a client at it with "template": "${id}" and run npm run build -- <client> && npm test.\nGuide: docs/ADD-A-TEMPLATE.md`);
