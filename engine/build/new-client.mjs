#!/usr/bin/env node
// node engine/build/new-client.mjs <name> [--template royal-maroon-gold]
// Creates clients/<slug>/ with a working starter config and placeholder photos so it builds immediately.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './build.mjs';

const args = process.argv.slice(2);
const slug = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--template');
const ti = args.indexOf('--template'); const tpl = ti > -1 ? args[ti + 1] : 'royal-maroon-gold';
if (!slug || !/^[a-z0-9][a-z0-9-]{1,48}$/.test(slug)) { console.error('Usage: node engine/build/new-client.mjs <name>   (lowercase letters, numbers, dashes; e.g. rohan-simran)'); process.exit(1); }
if (!fs.existsSync(path.join(ROOT, 'templates', tpl))) { console.error(`Unknown template "${tpl}". Available: ${fs.readdirSync(path.join(ROOT, 'templates')).join(', ')}`); process.exit(1); }
const dir = path.join(ROOT, 'clients', slug);
if (fs.existsSync(dir)) { console.error(`clients/${slug} already exists.`); process.exit(1); }
const tplInfo = JSON.parse(fs.readFileSync(path.join(ROOT, 'templates', tpl, 'template.json'), 'utf8'));
if (tplInfo.kind === 'app') { // birthday cards: start from the demo card of that look
  const demoSlug = tpl === 'birthday-gold' ? 'riya-30th' : 'aarav-birthday';
  const starter = JSON.parse(fs.readFileSync(path.join(ROOT, 'clients', demoSlug, 'client.json'), 'utf8'));
  starter._help = 'Fill in the real details. Anything you leave out uses the template defaults. Keys starting with _ are ignored. Guide: docs/BIRTHDAY-CARDS.md';
  starter.template = tpl; delete starter.seo.ogImage; starter.seo.noindex = true;
  fs.mkdirSync(path.join(dir, 'photos'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'client.json'), JSON.stringify(starter, null, 2) + '\n');
  console.log(`Created clients/${slug} (${tpl})\n  1. Edit clients/${slug}/client.json (names, age, date, venue, plan, host, RSVP number)\n  2. npm run build -- ${slug}\n  3. upload the folder READY-TO-UPLOAD/${slug}`);
  process.exit(0);
}
const demo = path.join(ROOT, 'clients', 'gursewak-simran', 'photos');
fs.mkdirSync(path.join(dir, 'photos'), { recursive: true });
['couple1', 'couple2', 'couple3'].forEach((n, i) => fs.copyFileSync(path.join(demo, `${n}.webp`), path.join(dir, 'photos', `REPLACE-ME-${i + 1}.webp`)));
const cfg = {
  _help: 'Fill in the real details. Anything you leave out uses the template defaults. Keys starting with _ are ignored. Full guide: docs/ADD-A-CLIENT.md',
  template: tpl,
  couple: { first: 'Bride', second: 'Groom' },
  date: { iso: '2027-01-15T18:00:00+05:30' },
  hero: { pa: '' },
  invite: { where: 'Venue name, City' },
  schedule: { events: [{ time: '5:30 PM', title: 'Guests arrive', place: 'Main hall' }, { time: '7:00 PM', title: 'Ceremony', place: 'Main hall' }, { time: '9:00 PM', title: 'Dinner', place: 'Garden' }] },
  venue: { name: 'Venue name', city: 'City, State', mapQuery: 'Venue name City' },
  gallery: { caption: '', photos: ['photos/REPLACE-ME-2.webp', 'photos/REPLACE-ME-3.webp'] },
  closing: { photo: 'photos/REPLACE-ME-1.webp' },
  rsvp: { endpoint: '', maxGuests: 4 },
  seo: { noindex: true },
  sections: { countdown: true, schedule: true, venue: true, gallery: true, rsvp: true },
};
fs.writeFileSync(path.join(dir, 'client.json'), JSON.stringify(cfg, null, 2) + '\n');
console.log(`Created clients/${slug}\n  1. Put the real photos in clients/${slug}/photos (python engine/tools/prepare-photos.py can crop and compress them)\n  2. Edit clients/${slug}/client.json\n  3. npm run build -- ${slug}\n  4. upload the folder READY-TO-UPLOAD/${slug}`);
