#!/usr/bin/env node
// npm run backup            -> backups/<name>-<version>-<timestamp>.zip  (sources only)
// npm run backup:full       -> same, plus READY-TO-UPLOAD/ (the built invitations)
// Zero dependencies: writes the ZIP format directly. Includes BACKUP-MANIFEST.txt with a SHA-256 for every file.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { ROOT } from './build.mjs';

const full = process.argv.includes('--with-built') || process.argv.includes('--include-dist');
const SKIP = new Set(['node_modules', '.git', 'backups', ...(full ? [] : ['READY-TO-UPLOAD']), '.DS_Store', '__pycache__', 'last-build.json']);
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (b) => { let c = 0xffffffff; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function walk(dir, base = '') { return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => SKIP.has(e.name) ? [] : e.isDirectory() ? walk(path.join(dir, e.name), `${base}${e.name}/`) : [`${base}${e.name}`]); }
const files = walk(ROOT).sort();
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const now = new Date();
const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1), dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
const manifest = [`${pkg.name} ${pkg.version} backup`, `created ${now.toISOString()}`, `files ${files.length}${full ? ' (includes READY-TO-UPLOAD/)' : ''}`, ''].concat(files.map((f) => `${crypto.createHash('sha256').update(fs.readFileSync(path.join(ROOT, f))).digest('hex')}  ${f}`)).join('\n') + '\n';
const top = `${pkg.name}/`; // unzips into ONE folder
const entries = [{ name: top + 'BACKUP-MANIFEST.txt', data: Buffer.from(manifest) }, ...files.map((f) => ({ name: top + f, data: fs.readFileSync(path.join(ROOT, f)) }))];
const chunks = [], central = []; let offset = 0;
for (const e of entries) {
  const name = Buffer.from(e.name, 'utf8'), crc = crc32(e.data); let comp = zlib.deflateRawSync(e.data, { level: 9 }), method = 8;
  if (comp.length >= e.data.length) { comp = e.data; method = 0; }
  const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(method, 8); lh.writeUInt16LE(dosTime, 10); lh.writeUInt16LE(dosDate, 12);
  lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(e.data.length, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
  chunks.push(lh, name, comp);
  const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(method, 10); ch.writeUInt16LE(dosTime, 12); ch.writeUInt16LE(dosDate, 14);
  ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(e.data.length, 24); ch.writeUInt16LE(name.length, 28); ch.writeUInt32LE((0o100644 << 16) >>> 0, 38); ch.writeUInt32LE(offset, 42);
  central.push(ch, name); offset += 30 + name.length + comp.length;
}
const cd = Buffer.concat(central), end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(offset, 16);
fs.mkdirSync(path.join(ROOT, 'backups'), { recursive: true });
const out = path.join(ROOT, 'backups', `${pkg.name}-${pkg.version}-${stamp}${full ? '-with-built' : ''}.zip`);
fs.writeFileSync(out, Buffer.concat([...chunks, cd, end]));
console.log(`✔ ${path.relative(process.cwd(), out)}  (${entries.length} files, ${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
