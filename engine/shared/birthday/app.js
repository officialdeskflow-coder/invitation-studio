/* =============================================================
   Birthday invitation: behaviour and animation
   Reads window.INVITE (js/config.js), builds the page, then animates it.
   Rules: native scrolling only, animate transform/opacity only, content can never stay hidden
   (a timer reveals anything left behind), and reduced-motion visitors get a calmer version.
   ============================================================= */
(function () {
  'use strict';
  var d = document, C = window.INVITE || {}, app = d.getElementById('app');
  var theme = C.theme === 'gold' ? 'gold' : 'party';
  var G = window.gsap, ST = window.ScrollTrigger, ok = !!(G && ST);
  var calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var full = ok && !calm;
  if (ok) { G.registerPlugin(ST); ST.config({ ignoreMobileResize: true }); } else d.documentElement.classList.add('nomo');
  d.body.classList.add('theme-' + theme);

  /* ---------- wording (override anything in config.texts) ---------- */
  var T = Object.assign({
    open: 'Tap to open', countdownTitle: 'Counting down to the party!', detailsTitle: 'The details', whenLabel: 'When', whereLabel: 'Where',
    planTitle: 'Party plan', findTitle: 'Find us', mapBtn: 'Open in Maps', calBtn: 'Add to calendar', gcal: 'or add to Google Calendar',
    rsvpTitle: 'Will you come?', nameLabel: 'Your name', namePh: 'Your name', attendLabel: 'Are you coming?', yes: "Yes, we’ll be there!", no: "Sorry, we can’t make it",
    guestsLabel: 'How many are coming?', msgLabel: 'A note (optional)', send: 'Send RSVP', sending: 'Sending…', needName: 'Please tell us your name.', needChoice: 'Please choose yes or no.',
    thanksYes: 'Yay! See you there!', thanksNo: 'Thank you for letting us know.', failed: 'Could not send. Please try again.', waNote: 'Your RSVP opens in WhatsApp. Tap send there.',
    seeYou: 'See you there!', top: 'Back to the top', days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds', partyTime: "It’s party time!", daysTo: ' days to go'
  }, C.texts || {});

  /* ---------- helpers ---------- */
  var $ = function (s, r) { return (r || d).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || d).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pad = function (n, l) { n = String(n); while (n.length < (l || 2)) n = '0' + n; return n; };
  var WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], MO = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function parts(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso || ''); return m ? { y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5] } : null; }
  function dateLabel(iso) { var p = parts(iso); if (!p) return ''; return WD[new Date(Date.UTC(p.y, p.mo - 1, p.d)).getUTCDay()] + ', ' + p.d + ' ' + MO[p.mo - 1] + ' ' + p.y; }
  function timeLabel(iso) { var p = parts(iso); if (!p) return ''; return (p.h % 12 || 12) + ':' + pad(p.mi) + ' ' + (p.h < 12 ? 'AM' : 'PM'); }
  function ordinal(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return '<span>' + n + '</span><sup>' + (s[(v - 20) % 10] || s[v] || s[0]) + '</sup>'; }
  var V = C.venue || {}, R = C.rsvp || {}, H = C.host || {};
  var COLORS = theme === 'gold' ? ['#d6b878', '#f1dca0', '#a8863f', '#fff3cf'] : ['#ff6b57', '#ffd75e', '#7fd6b2', '#8c7bff', '#ffffff', '#5bb8ff'];
  d.title = C.pageTitle || 'Birthday invitation';

  /* ---------- decorations ---------- */
  function balloonSVG(c) { return '<svg viewBox="0 0 96 190" aria-hidden="true"><ellipse cx="48" cy="58" rx="40" ry="50" fill="' + c + '"/><ellipse cx="34" cy="38" rx="9" ry="14" fill="#fff" opacity=".35" transform="rotate(-20 34 38)"/><path d="M44 106l4 8 4-8z" fill="' + c + '"/><path d="M48 114c-10 18 10 30 0 50" stroke="#1d2b53" stroke-width="2" fill="none" opacity=".55"/></svg>'; }
  var BL = [{ l: 4, t: 13, w: 74, c: '#ff6b57' }, { l: 76, t: 11, w: 66, c: '#ffd75e' }, { l: 42, t: 9, w: 58, c: '#7fd6b2' }, { l: 86, t: 58, w: 58, c: '#8c7bff' }, { l: 1, t: 66, w: 64, c: '#ffd75e' }];
  function gateDeco() {
    if (theme === 'gold') return [[12, 18], [80, 12], [24, 74], [74, 70], [50, 8], [90, 44], [6, 46]].map(function (p) { return '<i class="spk" style="left:' + p[0] + '%;top:' + p[1] + '%"></i>'; }).join('');
    return BL.map(function (b) { return '<div class="bln" style="left:' + b.l + '%;top:' + b.t + '%;width:' + b.w + 'px"><div class="bob">' + balloonSVG(b.c) + '</div></div>'; }).join('');
  }
  function sprinkle(n, seed, top, bottom) {
    var out = '', s = seed || 7; function r() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    for (var i = 0; i < n; i++) { var c = COLORS[Math.floor(r() * COLORS.length)], sz = 8 + Math.floor(r() * 12), k = Math.floor(r() * 3), yy = r() < .5 ? r() * top : Math.min(96, 100 - r() * bottom), st = 'left:' + (r() * 94).toFixed(1) + '%;top:' + yy.toFixed(1) + '%;';
      if (k === 0) st += 'width:' + sz + 'px;height:' + (sz / 2 + 3) + 'px;background:' + c + ';border-radius:3px;transform:rotate(' + Math.floor(r() * 180) + 'deg)';
      else if (k === 1) st += 'width:' + (sz / 2 + 5) + 'px;height:' + (sz / 2 + 5) + 'px;background:' + c + ';border-radius:50%';
      else st += 'width:0;height:0;border-left:' + (sz / 2) + 'px solid transparent;border-right:' + (sz / 2) + 'px solid transparent;border-bottom:' + sz + 'px solid ' + c + ';transform:rotate(' + Math.floor(r() * 180) + 'deg)';
      out += '<i style="' + st + '"></i>'; }
    return '<div class="sprinkle" aria-hidden="true">' + out + '</div>';
  }
  function divider() { return theme === 'gold'
    ? '<div class="divider" aria-hidden="true"><svg viewBox="0 0 150 34"><path d="M0 17H62M88 17H150" stroke="currentColor" stroke-width="1" fill="none"/><path d="M75 8l9 9-9 9-9-9z" fill="none" stroke="currentColor"/></svg></div>'
    : '<div class="divider" aria-hidden="true"><svg viewBox="0 0 150 34"><path d="M4 18q9-14 18 0t18 0 18 0 18 0 18 0 18 0 18 0" stroke="currentColor" stroke-width="5" stroke-linecap="round" fill="none"/></svg></div>'; }
  function bunting() {
    /* one 400x80 tile that repeats sideways, so the flags keep their size on any screen */
    var cols = ['#ff6b57', '#ffd75e', '#7fd6b2', '#8c7bff', '#5bb8ff'], pts = [], flags = '', i, x;
    function y(px) { return 12 + 26 * Math.sin(Math.PI * px / 400); }
    for (x = 0; x <= 400; x += 10) pts.push(x + ',' + y(x).toFixed(1));
    for (i = 0; i < 9; i++) { x = 22 + i * 44.5; var yy = y(x); flags += '<path d="M' + (x - 17) + ' ' + (yy - 1) + 'L' + (x + 17) + ' ' + (yy - 1) + 'L' + x + ' ' + (yy + 36) + 'Z" fill="' + cols[i % 5] + '"/>'; }
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80"><polyline points="' + pts.join(' ') + '" fill="none" stroke="#1d2b53" stroke-opacity=".5" stroke-width="2"/>' + flags + '</svg>';
    return '<div class="bunt" aria-hidden="true" style="background-image:url(&quot;data:image/svg+xml,' + encodeURIComponent(svg) + '&quot;)"></div>';
  }
  function scallop() { var p = 'M0 0H400'; for (var i = 0; i < 12; i++) p += 'a16.67 16.67 0 0 1-33.34 0'; return p + 'Z'; }
  function mapSVG() {
    var bg = theme === 'gold' ? '#1a140b' : '#cfeee0', rd = theme === 'gold' ? '#d6b878' : '#ffffff', bl = theme === 'gold' ? '#241b0e' : '#e9f7ef', pin = theme === 'gold' ? '#d6b878' : '#ff6b57', core = theme === 'gold' ? '#0e0b06' : '#fff';
    return '<svg viewBox="0 0 400 220" role="img" aria-label="' + esc(V.name) + '"><rect width="400" height="220" fill="' + bg + '"/><g fill="' + bl + '"><rect x="30" y="24" width="90" height="56" rx="10"/><rect x="262" y="26" width="104" height="62" rx="10"/><rect x="40" y="130" width="76" height="62" rx="10"/><rect x="156" y="138" width="86" height="56" rx="10"/><rect x="280" y="138" width="90" height="56" rx="10"/></g><g fill="none" stroke="' + rd + '" stroke-width="' + (theme === 'gold' ? 1.5 : 10) + '" stroke-linecap="round" opacity="' + (theme === 'gold' ? .55 : 1) + '"><path d="M-10 108L410 100M140 -10L170 230M250 -10C240 70 300 110 410 120"/></g><g transform="translate(200 56)"><path d="M0 70C-20 44-30 30-30 14a30 30 0 1 1 60 0c0 16-10 30-30 56z" fill="' + pin + '"/><circle cx="0" cy="14" r="11" fill="' + core + '"/></g></svg>';
  }
  var ICON = { gift: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="12" width="24" height="16" rx="2"/><path d="M2 12h28v-4H2zM16 8v20M16 8c-2-5-8-5-8-1.5S12 8 16 8zM16 8c2-5 8-5 8-1.5S20 8 16 8z"/></svg>', up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>', cal: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>', pin: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></svg>' };

  /* ---------- page markup ---------- */
  function html() {
    var hasPlan = (C.schedule || []).length > 0, hasRsvp = !!R.enabled;
    var gateTitle = theme === 'gold' ? esc(C.age) : esc(C.name) + ' party!';
    var heroBalloons = theme === 'gold' ? '' : [[ -6, 8, 74, '#ff6b57', .35], [82, 4, 66, '#ffd75e', .55], [80, 74, 56, '#8c7bff', .8], [-4, 79, 60, '#7fd6b2', .65]].map(function (b) { return '<div class="pl" data-speed="' + b[4] + '" style="left:' + b[0] + '%;top:' + b[1] + '%;width:' + b[2] + 'px"><div class="bln" style="position:relative;width:100%"><div class="bob">' + balloonSVG(b[3]) + '</div></div></div>'; }).join('');
    var h = '<div class="gate" id="gate" role="dialog" aria-modal="true" aria-label="' + esc(T.open) + '"><div class="gh l"></div><div class="gh r"></div><div class="g-frame"></div>' + bunting() + gateDeco() +
      '<div class="g-content"><p class="g-k">' + esc(C.kicker) + '</p><h1 class="g-name">' + gateTitle + '</h1>' + (theme === 'gold' && C.subtitle ? '<p class="g-sub">' + esc(C.subtitle) + '</p>' : '') + '<button class="g-btn" id="openBtn" type="button">' + (theme === 'gold' ? '' : ICON.gift) + '<span>' + esc(T.open) + '</span></button></div>' +
      '<svg class="g-edge" viewBox="0 0 400 30" preserveAspectRatio="none" aria-hidden="true"><path d="' + scallop() + '"/></svg></div><div class="prog" id="prog" aria-hidden="true"></div><main class="col" id="col">';
    /* hero */
    h += '<section class="sec hero" id="hero" aria-labelledby="h1">' + sprinkle(theme === 'gold' ? 16 : 26, 11, 24, 24) + (theme === 'gold' ? '' : bunting()) + heroBalloons + '<div class="hc"><p class="k" data-i>' + esc(C.kicker) + '</p>';
    if (theme === 'gold') h += '<div class="age" id="age">' + esc(C.age) + '</div><h1 class="sub" id="h1" data-i>' + esc(C.subtitle || C.name) + '</h1>';
    else h += '<h1 class="name" id="h1" data-i>' + esc(C.name) + '</h1><div class="age" id="age">' + ordinal(C.age) + '</div><div class="occ" data-i>' + esc(C.occasion) + '</div>';
    h += '<p class="when" data-i><span>' + esc(dateLabel(C.start)) + '</span><span class="sep">  ·  </span><span>' + esc(timeLabel(C.start)) + '</span></p><p class="where" data-i>' + esc(V.name) + '</p><div class="cue" data-i aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></div></div></section>';
    /* countdown */
    h += '<section class="sec" id="cd"><h2 data-split>' + esc(T.countdownTitle) + '</h2><p class="vh" id="cdsr"></p><div class="units" aria-hidden="true" data-reveal>' +
      [['d', T.days], ['h', T.hours], ['m', T.minutes], ['s', T.seconds]].map(function (u) { return '<div class="u"><span class="num" id="n-' + u[0] + '"><b>--</b></span><span class="lab">' + esc(u[1]) + '</span></div>'; }).join('') + '</div><p class="cd-note" id="cdn" hidden>' + esc(T.partyTime) + '</p></section>';
    /* details */
    var cards = [{ l: T.whenLabel, v: dateLabel(C.start), s: timeLabel(C.start) + (C.end ? ' to ' + timeLabel(C.end) : '') }, { l: T.whereLabel, v: V.name, s: V.address }].concat(C.details || []);
    h += '<section class="sec" id="det">' + divider() + '<h2 data-split style="margin-top:18px">' + esc(T.detailsTitle) + '</h2><div class="cards">' + cards.map(function (c, i) { return '<div class="card" data-reveal data-x="' + (i % 2 ? 40 : -40) + '"><div class="l">' + esc(c.label || c.l) + '</div><div class="v">' + esc(c.value || c.v) + '</div>' + (c.s ? '<div class="s">' + esc(c.s) + '</div>' : '') + '</div>'; }).join('') + '</div></section>';
    /* party plan */
    if (hasPlan) h += '<section class="sec" id="plan"><h2 data-split>' + esc(T.planTitle) + '</h2><div class="tl" id="tl"><span class="rail" aria-hidden="true"></span><span class="fill" id="fill" aria-hidden="true"></span>' + C.schedule.map(function (s) { return '<div class="it"><i class="dt" aria-hidden="true"></i><div class="t">' + esc(s.time) + '</div><div class="n">' + esc(s.title) + '</div></div>'; }).join('') + '</div></section>';
    /* venue */
    h += '<section class="sec" id="venue"><h2 data-split>' + esc(T.findTitle) + '</h2><div class="mapcard" data-reveal>' + mapSVG() + '</div><div data-reveal><div class="vname">' + esc(V.name) + '</div><div class="vaddr">' + esc(V.address) + '</div></div>' +
      '<div class="btns" data-reveal><a class="btn" href="' + esc(V.mapUrl) + '" target="_blank" rel="noopener">' + ICON.pin + esc(T.mapBtn) + '</a><button class="btn alt" id="calBtn" type="button">' + ICON.cal + esc(T.calBtn) + '</button><p class="glink"><a id="gcal" href="#" target="_blank" rel="noopener">' + esc(T.gcal) + '</a></p></div></section>';
    /* RSVP */
    if (hasRsvp) h += '<section class="sec" id="rsvp"><h2 data-split>' + esc(T.rsvpTitle) + '</h2><form class="rbox" id="rform" novalidate data-reveal><label class="l" for="r-name">' + esc(T.nameLabel) + '</label><input id="r-name" name="name" type="text" maxlength="60" autocomplete="name" placeholder="' + esc(T.namePh) + '">' +
      '<label class="l">' + esc(T.attendLabel) + '</label><div class="choice"><label><input type="radio" name="attend" value="yes"><span>' + esc(T.yes) + '</span></label><label><input type="radio" name="attend" value="no"><span>' + esc(T.no) + '</span></label></div>' +
      '<div id="gwrap"><label class="l" for="r-guests">' + esc(T.guestsLabel) + '</label><select id="r-guests" name="guests">' + Array.apply(null, { length: R.maxGuests || 4 }).map(function (_, i) { return '<option>' + (i + 1) + '</option>'; }).join('') + '</select></div>' +
      '<label class="l" for="r-msg">' + esc(T.msgLabel) + '</label><textarea id="r-msg" name="msg" maxlength="300"></textarea><input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><button class="btn" id="rsub" type="submit">' + esc(T.send) + '</button><p class="rst" id="rst" aria-live="polite"></p></form>' + (R.replyBy ? '<p class="reply-by" data-reveal>' + esc(R.replyBy) + '</p>' : '') + '</section>';
    /* closing */
    h += '<section class="sec bye" id="bye">' + sprinkle(theme === 'gold' ? 12 : 18, 29, 12, 30) + '<div class="hc"><div class="big" data-reveal>' + esc(T.seeYou) + '</div>' + (H.note ? '<p data-reveal>' + esc(H.note) + '</p>' : '') + (H.names ? '<div class="hosts" data-reveal>' + esc(H.names) + '</div>' : '') + '<button class="top" id="top" type="button" aria-label="' + esc(T.top) + '" data-reveal>' + ICON.up + '</button></div></section></main>';
    return h;
  }
  app.innerHTML = html();
  d.documentElement.classList.add('locked');

  /* ---------- confetti (DOM pieces, removed after use) ---------- */
  function burst(x, y, n, spread) {
    if (!ok) return; if (!full) n = Math.min(n, 12);
    for (var i = 0; i < n; i++) {
      var p = d.createElement('i'); p.className = 'cfp'; var c = COLORS[Math.floor(Math.random() * COLORS.length)], s = Math.round(rnd(7, 15)), k = Math.floor(Math.random() * 3);
      p.style.cssText = 'width:' + s + 'px;height:' + (k === 1 ? s : Math.round(s / 2) + 3) + 'px;background:' + c + ';border-radius:' + (k === 1 ? '50%' : '2px');
      d.body.appendChild(p); var tx = x + rnd(-spread, spread), ty = y + rnd(-spread * 1.3, spread * .3);
      G.fromTo(p, { x: x, y: y, rotation: 0, opacity: 1, scale: 1 }, { x: tx, y: ty, rotation: rnd(-540, 540), duration: rnd(.7, 1.2), ease: 'power3.out' });
      G.to(p, { y: ty + rnd(120, 340), x: tx + rnd(-40, 40), opacity: 0, rotation: '+=' + rnd(-200, 200), duration: rnd(1, 1.6), delay: rnd(.6, .9), ease: 'power1.in', onComplete: (function (el) { return function () { el.remove(); }; })(p) });
    }
  }

  /* ---------- hidden start states (set by script, so content is visible if the script fails) ---------- */
  function split(el) {
    if (!el || el.dataset.sp) return []; el.dataset.sp = 1; el.setAttribute('aria-label', el.textContent.trim());
    el.innerHTML = el.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w" aria-hidden="true"><span class="wi">' + esc(w) + '</span></span>'; }).join(' ');
    return $$('.wi', el);
  }
  if (ok) {
    $$('h2[data-split]').forEach(function (h) { G.set(split(h), { yPercent: 115 }); });
    G.set('[data-reveal]', { opacity: 0, y: 34 });
    $$('.card[data-x]').forEach(function (c) { G.set(c, { x: full ? +c.dataset.x : 0 }); });
    G.set('#hero [data-i]', { opacity: 0, y: 34 }); G.set('#age', { opacity: 0 }); G.set('#hero .bln', { opacity: 0 });
  }

  /* ---------- opening ---------- */
  var gate = $('#gate'), btn = $('#openBtn'), opened = false;
  function unlock() { gate.style.display = 'none'; d.documentElement.classList.remove('locked'); if (ok) ST.refresh(); }
  function intro(t, at) {
    t.to('#hero [data-i]', { opacity: 1, y: 0, duration: .9, stagger: .12, ease: 'power3.out' }, at)
     .fromTo('#age', { scale: .4, opacity: 0, rotation: -8 }, { scale: 1, opacity: 1, rotation: 0, duration: 1.1, ease: 'back.out(1.8)', clearProps: 'rotation' }, at + .15)
     .to('#hero .bln', { opacity: 1, duration: .8, stagger: .1 }, at + .1)
     .add(function () { if (full) heroFx(); }, '>');
  }
  function open() {
    if (opened) return; opened = true; btn.disabled = true;
    if (!ok) { unlock(); return; }
    var r = btn.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, t = G.timeline({ defaults: { ease: 'power3.out' } });
    t.add(function () { burst(cx, cy, theme === 'gold' ? 46 : 54, 240); }, .1);
    if (theme === 'gold') {
      t.to(btn, { scale: .94, duration: .15 }, 0).to('.g-frame', { opacity: 0, duration: .5 }, .1).to('.gh', { '--edge': 1, duration: .4 }, .35).to('.g-content', { opacity: 0, scale: 1.1, duration: .7, ease: 'power2.in' }, .15)
       .to('.gh.l', { xPercent: -102, duration: 1.5, ease: 'power3.inOut' }, .5).to('.gh.r', { xPercent: 102, duration: 1.5, ease: 'power3.inOut' }, .5)
       .to('.gate .spk', { opacity: 0, duration: .5 }, .3).add(unlock, 2.05);
      intro(t, 1.3);
    } else {
      t.to(btn, { scale: .92, duration: .12 }, 0).to(btn, { scale: 1, duration: .35, ease: 'back.out(3)' }, .12)
       .to('.gate .bln', { y: -(innerHeight * 1.25), duration: 1.5, stagger: .07, ease: 'power2.in' }, .3).to('.g-content', { opacity: 0, y: -30, duration: .5 }, .35)
       .to(gate, { y: -(innerHeight + 40), duration: 1.25, ease: 'power3.inOut' }, .85).add(unlock, 2.1);
      intro(t, 1.5);
    }
  }
  btn.addEventListener('click', open);
  if (full) { $$('.gate .bob').forEach(function (b, i) { G.to(b, { y: -14, rotation: i % 2 ? 3 : -3, duration: 2 + i * .3, ease: 'sine.inOut', yoyo: true, repeat: -1 }); }); G.to('.gate .spk', { opacity: .2, scale: .6, duration: 1.4, stagger: { each: .2, repeat: -1, yoyo: true }, ease: 'sine.inOut' }); }

  /* ---------- scroll animation ---------- */
  function heroFx() {
    $$('#hero .pl').forEach(function (el) { G.to(el, { y: -innerHeight * (+el.dataset.speed), ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: .8 } }); });
    $$('#hero .bob').forEach(function (b, i) { var tw = G.to(b, { y: -12, rotation: i % 2 ? 3 : -3, duration: 2.2 + i * .35, ease: 'sine.inOut', yoyo: true, repeat: -1 }); ST.create({ trigger: b, start: 'top bottom', end: 'bottom top', onToggle: function (s) { tw.paused(!s.isActive); } }); });
    G.to('#hero .hc', { y: -50, opacity: .25, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 35%', scrub: .8 } });
  }
  if (ok) {
    G.to('#prog', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: .3 } });
    /* one gentle reveal for everything marked data-reveal */
    ST.batch('[data-reveal]', { start: function () { return 'top ' + Math.round(Math.max(innerHeight * .9, innerHeight - 90)) + 'px'; }, once: true, onEnter: function (els) { G.to(els, { opacity: 1, y: 0, x: 0, duration: full ? 1 : .6, stagger: .12, ease: 'power3.out', overwrite: 'auto' }); } });
    $$('h2[data-split]').forEach(function (h) { ST.create({ trigger: h, start: 'top 88%', once: true, onEnter: function () { G.to($$('.wi', h), { yPercent: 0, duration: 1, stagger: .09, ease: 'power4.out' }); } }); });
    /* party plan: the line grows with the scroll, each stop lights up as it is passed */
    var tl = $('#tl');
    if (tl) { var fill = $('#fill'), its = $$('.it', tl);
      ST.create({ trigger: tl, start: 'top 72%', end: 'bottom 62%', scrub: .6, onUpdate: function (s) { fill.style.transform = 'scaleY(' + s.progress.toFixed(3) + ')'; its.forEach(function (el, i) { el.classList.toggle('on', s.progress >= (i + .15) / its.length); }); } }); }
    /* countdown boxes pop in */
    ST.create({ trigger: '#cd', start: 'top 75%', once: true, onEnter: function () { cdOn = true; if (full) G.fromTo('#cd .u', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, stagger: .1, ease: 'back.out(2)', clearProps: 'scale' }); } });
    ST.create({ trigger: '#bye', start: 'top 70%', once: true, onEnter: function () { var b = $('#top'); if (b) { var r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 30, 200); } } });
  }

  /* ---------- countdown ---------- */
  var cdOn = false, last = {}, T0 = Date.parse(C.start);
  function setv(k, v) {
    var el = $('#n-' + k); if (!el || last[k] === v) return; last[k] = v; var cur = el.firstChild;
    if (!cdOn || !full || d.hidden) { cur.textContent = v; return; }
    var nx = d.createElement('b'); nx.className = 'nx'; nx.textContent = v; el.appendChild(nx);
    G.fromTo(nx, { yPercent: 100 }, { yPercent: 0, duration: .45, ease: 'power3.out' });
    G.to(cur, { yPercent: -100, opacity: 0, duration: .45, ease: 'power3.out', onComplete: function () { cur.textContent = v; G.set(cur, { yPercent: 0, opacity: 1 }); nx.remove(); } });
  }
  function tick() {
    var s = Math.max(0, Math.floor((T0 - Date.now()) / 1000)), dd = Math.floor(s / 86400);
    setv('d', pad(dd)); setv('h', pad(Math.floor(s % 86400 / 3600))); setv('m', pad(Math.floor(s % 3600 / 60))); setv('s', pad(s % 60));
    if (s === 0) $('#cdn').hidden = false;
    if (last.sr !== dd) { last.sr = dd; $('#cdsr').textContent = dd + T.daysTo; }
  }
  (function loop() { tick(); setTimeout(loop, 1000 - (Date.now() % 1000) + 5); })();
  d.addEventListener('visibilitychange', tick);

  /* ---------- add to calendar ---------- */
  function icsDate(iso) { return new Date(Date.parse(iso)).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  var title = C.pageTitle || 'Birthday party', where = [V.name, V.address].filter(Boolean).join(', ');
  var gc = $('#gcal'); if (gc) gc.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + icsDate(C.start) + '/' + icsDate(C.end || C.start) + '&location=' + encodeURIComponent(where);
  var cb = $('#calBtn'); if (cb) cb.addEventListener('click', function () {
    var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Birthday invitation//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@birthday-invitation', 'DTSTAMP:' + icsDate(new Date().toISOString()), 'DTSTART:' + icsDate(C.start), 'DTEND:' + icsDate(C.end || C.start), 'SUMMARY:' + title.replace(/[,;]/g, ' '), 'LOCATION:' + where.replace(/[,;]/g, ' '), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    var a = d.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'birthday.ics'; d.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  });

  /* ---------- RSVP: sends through WhatsApp (or your own endpoint if you set one) ---------- */
  var form = $('#rform');
  if (form) {
    var st = $('#rst'), say = function (m, k) { st.textContent = m; st.className = 'rst ' + (k || ''); };
    $$('input[name=attend]', form).forEach(function (r) { r.addEventListener('change', function () { var g = $('#gwrap'); if (g) g.style.display = r.value === 'no' ? 'none' : ''; }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var name = form.elements.name.value.trim(), a = form.querySelector('input[name=attend]:checked');
      if (form.elements.website.value) return; if (!name) return say(T.needName, 'err'); if (!a) return say(T.needChoice, 'err');
      var data = { event: title, name: name, attending: a.value, guests: a.value === 'yes' ? Number(form.elements.guests.value) : 0, message: form.elements.msg.value.trim() }, yes = a.value === 'yes';
      function good() { say(yes ? T.thanksYes : T.thanksNo, 'ok'); if (yes) { var r = $('#rsub').getBoundingClientRect(); burst(r.left + r.width / 2, r.top, 40, 220); } }
      if (R.endpoint) { $('#rsub').disabled = true; say(T.sending); fetch(R.endpoint, { method: 'POST', body: JSON.stringify(data) }).then(function (r) { if (!r.ok) throw 0; good(); }).catch(function () { say(T.failed, 'err'); }).then(function () { $('#rsub').disabled = false; }); return; }
      var num = String(R.whatsapp || '').replace(/\D/g, ''), msg = 'RSVP: ' + title + '\n' + name + ' - ' + (yes ? 'coming (' + data.guests + ')' : "can't make it") + (data.message ? '\n' + data.message : '');
      if (!num) { say(T.failed, 'err'); return; }
      var url = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg); good(); say((yes ? T.thanksYes : T.thanksNo) + ' ' + T.waNote, 'ok'); if (!window.open(url, '_blank', 'noopener')) location.href = url;
    });
  }
  var topBtn = $('#top'); if (topBtn) topBtn.addEventListener('click', function () { scrollTo({ top: 0, behavior: full ? 'smooth' : 'auto' }); });

  /* ---------- failsafe: nothing may stay hidden ---------- */
  if (ok) { var seen = new WeakMap(); setInterval(function () { if (!opened) return; $$('[data-reveal],h2[data-split]').forEach(function (e) { var r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight - 2) { seen.delete(e); return; }
    var hid = e.hasAttribute('data-split') ? (function () { var w = $('.wi', e); return w && new DOMMatrix(getComputedStyle(w).transform).m42 > 2; })() : +getComputedStyle(e).opacity < .05; if (!hid) { seen.delete(e); return; }
    var n = (seen.get(e) || 0) + 1; seen.set(e, n); if (n >= 2) { seen.delete(e); if (e.hasAttribute('data-split')) G.to($$('.wi', e), { yPercent: 0, duration: .5 }); else G.to(e, { opacity: 1, y: 0, x: 0, duration: .6 }); } }); }, 1500); }
})();
