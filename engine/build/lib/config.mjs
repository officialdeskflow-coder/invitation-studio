// Merge defaults + client config, derive computed fields, validate with clear messages.
import fs from 'node:fs';
import path from 'node:path';

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
export function deepMerge(a, b) {
  if (!isObj(a) || !isObj(b)) return b === undefined ? a : b;
  const out = { ...a };
  for (const k of Object.keys(b)) out[k] = isObj(a[k]) && isObj(b[k]) ? deepMerge(a[k], b[k]) : b[k];
  return out;
}
const get = (o, p) => p.split('.').reduce((v, k) => (v == null ? v : v[k]), o);
function interpolate(node, root) {
  if (typeof node === 'string') return node.replace(/\$\{([\w.]+)\}/g, (_, p) => { const v = get(root, p); return v == null ? '' : String(v); });
  if (Array.isArray(node)) return node.map((x) => interpolate(x, root));
  if (isObj(node)) { const o = {}; for (const k of Object.keys(node)) o[k] = interpolate(node[k], root); return o; }
  return node;
}
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');

function eventIso(dateIso, time) {
  const m = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i.exec(String(time).trim());
  if (!m) return null;
  let h = +m[1]; const min = +(m[2] || 0); const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h < 12) h += 12; if (ap === 'AM' && h === 12) h = 0;
  const day = dateIso.slice(0, 10), tz = (/(Z|[+-]\d\d:\d\d)$/.exec(dateIso) || [''])[0];
  return `${day}T${pad(h)}:${pad(min)}:00${tz}`;
}

export function finalize(client, defaults, slug) {
  let cfg = deepMerge(defaults, client);
  cfg.slug = slug;
  const c = cfg.couple || {};
  if (c.first && c.second && !c.initials) c.initials = `${c.first[0]}${c.joiner || '&'}${c.second[0]}`.toUpperCase();
  cfg.couple = c;
  const dm = /^(\d{4})-(\d{2})-(\d{2})/.exec(cfg.date?.iso || '');
  if (dm) {
    const [, y, mo, d] = dm; const wd = new Date(Date.UTC(+y, +mo - 1, +d)).getUTCDay();
    cfg.date.display = cfg.date.display || `${d} · ${mo} · ${y}`;
    cfg.date.long = cfg.date.long || `${WD[wd]}, ${+d} ${MO[+mo - 1]} ${y}`;
  }
  cfg = interpolate(cfg, cfg); cfg = interpolate(cfg, cfg);
  // events
  for (const e of cfg.schedule.events || []) if (!e.iso && cfg.date?.iso && e.time) e.iso = eventIso(cfg.date.iso, e.time) || '';
  // venue
  const v = cfg.venue;
  v.mapLabel = v.mapLabel || String(v.city || v.name || '').split(',')[0];
  v.mapUrl = v.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(v.mapQuery || `${v.name || ''} ${v.city || ''}`.trim());
  // gallery alt text
  cfg.gallery.alts = (cfg.gallery.photos || []).map((_, i) => cfg.gallery.alts?.[i] || `${c.first} and ${c.second}, portrait ${i + 1}`);
  // rsvp
  const r = cfg.rsvp; const M = r.messages;
  r.invitationId = r.invitationId || slug;
  r.guestOptions = Array.from({ length: Number(r.maxGuests) || 1 }, (_, i) => ({ value: i + 1, label: `${i + 1} ${i === 0 ? M.guestOne : M.guestMany}` }));
  r.noteText = r.endpoint ? M.noteLive : M.noteDemo;
  // seo
  const s = cfg.seo;
  s.faviconSvg = `%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Ctext y=%27.9em%27 font-size=%2790%27%3E${encodeURIComponent(s.favicon || '💌')}%3C/text%3E%3C/svg%3E`;
  return cfg;
}

export function runtimeConfig(cfg, musicUrl) {
  return {
    event: { iso: cfg.date.iso, label: cfg.date.long },
    countdown: { srLabel: cfg.countdown.srLabel },
    rsvp: { endpoint: cfg.rsvp.endpoint, maxGuests: Number(cfg.rsvp.maxGuests), invitationId: cfg.rsvp.invitationId, messages: cfg.rsvp.messages },
    features: { progressBar: !!cfg.features.progressBar },
    music: { labelOn: cfg.music.labelOn, labelOff: cfg.music.labelOff, enabled: !!musicUrl },
  };
}

export function validate(cfg, ctx) {
  const errors = [], warnings = [];
  const E = (m) => errors.push(m), W = (m) => warnings.push(m);
  const { template, clientDir, enabled, client } = ctx;
  const str = (v, max, label, req = true) => { if (v == null || v === '') { if (req) E(`${label} is required`); return; } if (typeof v !== 'string') return E(`${label} must be text`); if (v.length > max) W(`${label} is long (${v.length} chars, suggested max ${max})`); };
  if (!/^[a-z0-9][a-z0-9-]{1,48}$/.test(cfg.slug)) E(`slug "${cfg.slug}" must be lowercase letters, numbers and dashes`);
  str(cfg.couple.first, 30, 'couple.first'); str(cfg.couple.second, 30, 'couple.second'); str(cfg.couple.initials, 5, 'couple.initials');
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/.test(cfg.date.iso || '') || Number.isNaN(Date.parse(cfg.date.iso))) E('date.iso must look like 2027-04-17T18:30:00+05:30 (with a time zone)');
  else if (Date.parse(cfg.date.iso) < Date.now()) W('date.iso is in the past: the countdown will show zeros and "today"');
  str(cfg.hero.kicker, 40, 'hero.kicker'); str(cfg.invite.title, 40, 'invite.title');
  if (!Array.isArray(cfg.invite.paragraphs) || cfg.invite.paragraphs.length < 1 || cfg.invite.paragraphs.length > 3) E('invite.paragraphs needs 1 to 3 paragraphs');
  else cfg.invite.paragraphs.forEach((p, i) => str(p, 320, `invite.paragraphs[${i}]`));
  str(cfg.invite.where, 70, 'invite.where');
  for (const id of Object.keys(cfg.sections || {})) if (!template.sections.some((s) => s.id === id && !s.required)) E(`sections.${id} is not an optional section of template ${template.id}`);
  if (enabled.has('schedule')) {
    const ev = cfg.schedule.events || [];
    if (ev.length < 1 || ev.length > 8) E('schedule.events needs 1 to 8 events (or turn the section off with "sections": {"schedule": false})');
    let prev = -Infinity;
    ev.forEach((e, i) => { str(e.time, 12, `schedule.events[${i}].time`); str(e.title, 60, `schedule.events[${i}].title`); if (e.place) str(e.place, 60, `schedule.events[${i}].place`);
      const t = Date.parse(e.iso || ''); if (Number.isNaN(t)) E(`schedule.events[${i}]: could not read the time "${e.time}" (use e.g. "6:30 PM" or add an "iso" value)`); else { if (t < prev) W(`schedule.events[${i}] is earlier than the one before it`); prev = t; } });
  }
  if (enabled.has('venue')) { str(cfg.venue.name, 50, 'venue.name'); str(cfg.venue.city, 60, 'venue.city'); if (!/^https:\/\//.test(cfg.venue.mapUrl)) E('venue.mapUrl must start with https://'); }
  const checkFile = (rel, label, maxKB) => {
    if (!rel) return; const abs = path.resolve(clientDir, rel);
    if (!fs.existsSync(abs)) return E(`${label}: file not found: clients/${cfg.slug}/${rel}`);
    if (!/\.(webp|jpe?g|png)$/i.test(rel)) W(`${label}: use .webp for the smallest file`);
    const kb = fs.statSync(abs).size / 1024; if (kb > maxKB) W(`${label}: ${Math.round(kb)} KB is heavy (aim for under ${maxKB} KB, see tools/prepare-photos.py)`);
  };
  if (enabled.has('gallery')) {
    const ph = cfg.gallery.photos || [];
    if (ph.length < 1) E('gallery.photos needs 1 or 2 photos (or turn the section off)'); if (ph.length > 2) W('gallery.photos: only the first 2 photos are shown by this template');
    ph.slice(0, 2).forEach((p, i) => checkFile(p, `gallery.photos[${i}]`, 300));
  }
  checkFile(cfg.closing.photo, 'closing.photo', 300);
  if (!cfg.closing.photo) W('closing.photo is empty: the closing arch will be blank');
  if (enabled.has('rsvp')) {
    const r = cfg.rsvp;
    if (r.endpoint && !/^https:\/\/script\.google(usercontent)?\.com\//.test(r.endpoint) && !/^https:\/\//.test(r.endpoint)) E('rsvp.endpoint must be an https:// URL (or empty for demo mode)');
    if (r.endpoint && !/^https:\/\/script\.google/.test(r.endpoint)) W('rsvp.endpoint is not a Google Apps Script URL; make sure it accepts the same JSON fields');
    if (!Number.isInteger(Number(r.maxGuests)) || r.maxGuests < 1 || r.maxGuests > 10) E('rsvp.maxGuests must be a whole number from 1 to 10');
    if (!/^[a-z0-9][a-z0-9-]{2,60}$/.test(r.invitationId)) E('rsvp.invitationId must be lowercase letters, numbers and dashes (3 to 61 chars)');
    if (!r.endpoint) W('rsvp.endpoint is empty: the form runs in DEMO mode and saves nothing. Set it before sending to guests.');
  }
  if (cfg.seo.url && !/^https:\/\//.test(cfg.seo.url)) E('seo.url must start with https://');
  if (cfg.seo.ogImage && !fs.existsSync(path.resolve(clientDir, cfg.seo.ogImage))) E(`seo.ogImage: file not found: clients/${cfg.slug}/${cfg.seo.ogImage}`);
  if (cfg.music.src) { checkFile(null); const abs = path.resolve(clientDir, cfg.music.src); if (!fs.existsSync(abs)) E(`music.src: file not found: clients/${cfg.slug}/${cfg.music.src}`); else if (fs.statSync(abs).size > 1.5e6) W('music.src is over 1.5 MB: build with --split so the song is a separate file'); }
  const known = new Set([...Object.keys(ctx.defaults), 'slug', 'template']);
  for (const k of Object.keys(client)) if (!known.has(k) && !k.startsWith('_')) W(`unknown top-level key "${k}" (typo? keys starting with _ are ignored)`);
  return { errors, warnings };
}
