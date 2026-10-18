// Resolves files to either data URIs (single-file build) or copied, hashed files (split build).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const MIME = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg' };

export function makeAssets({ mode, root, engine, tplDir, clientDir, outDir }) {
  const cache = new Map();
  const stats = [];
  const inside = (base, abs) => { const rel = path.relative(base, abs); return !rel.startsWith('..') && !path.isAbsolute(rel); };
  function url(abs) {
    if (cache.has(abs)) return cache.get(abs);
    if (!fs.existsSync(abs)) throw new Error(`Missing file: ${path.relative(root, abs)}`);
    const buf = fs.readFileSync(abs);
    let u;
    if (mode === 'inline') u = `data:${MIME[path.extname(abs).toLowerCase()] || 'application/octet-stream'};base64,${buf.toString('base64')}`;
    else {
      const name = `${crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8)}-${path.basename(abs)}`;
      fs.mkdirSync(path.join(outDir, 'assets'), { recursive: true });
      fs.writeFileSync(path.join(outDir, 'assets', name), buf);
      u = `assets/${name}`;
    }
    stats.push({ file: path.relative(root, abs), bytes: buf.length });
    cache.set(abs, u);
    return u;
  }
  const pick = (base, rel) => { const abs = path.resolve(base, rel); if (!inside(base, abs)) throw new Error(`Path escapes its folder: ${rel}`); return abs; };
  return {
    tpl: (rel) => url(pick(path.join(tplDir, 'assets'), rel)),
    client: (rel) => url(pick(clientDir, rel)),
    shared: (rel) => url(pick(path.join(engine || root, 'shared'), rel)),
    stats: () => stats,
  };
}
