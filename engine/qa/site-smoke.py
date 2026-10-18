"""Landing page checks.  Usage: python engine/qa/site-smoke.py READY-TO-UPLOAD/sales-website/index.html
Checks: console errors, sideways overflow at 7 widths, anchors resolve, booking form builds the WhatsApp message,
both demo cards open from the landing folder, content stays visible with JavaScript off."""
import os, sys, json
from urllib.parse import urlparse, parse_qs, unquote
from playwright.sync_api import sync_playwright
path = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else 'READY-TO-UPLOAD/sales-website/index.html'); URL = 'file://' + path; R = {}; bad = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text[:140]) if m.type in ('error', 'warning') else None)
    pg.goto(URL); pg.wait_for_timeout(1200)
    R['errors'] = errs
    ov = {}
    for w in (320, 360, 390, 430, 768, 1024, 1440):
        pg.set_viewport_size({'width': w, 'height': 900}); pg.wait_for_timeout(250); ov[w] = pg.evaluate('document.documentElement.scrollWidth>innerWidth')
    R['overflowX'] = ov
    ids = set(pg.evaluate("[...document.querySelectorAll('[id]')].map(e=>e.id)"))
    R['brokenAnchors'] = [h for h in pg.evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].map(a=>a.getAttribute('href').slice(1))") if h and h not in ids]
    R['externalLinksNoopener'] = pg.evaluate("[...document.querySelectorAll('a[target=_blank]')].every(a=>/noopener/.test(a.rel))")
    pg.set_viewport_size({'width': 1280, 'height': 900}); pg.evaluate("window.__u=null;window.open=function(u){window.__u=u;return {}}")
    pg.fill('#b-names', 'Rohan & Meera'); pg.fill('#b-date', '2027-02-14'); pg.select_option('#b-style', index=2); pg.fill('#b-notes', 'Punjabi wording'); pg.click('#bform button[type=submit]'); pg.wait_for_timeout(300)
    u = pg.evaluate('window.__u'); q = parse_qs(urlparse(u).query).get('text', [''])[0] if u else ''
    R['whatsapp'] = {'url_host': urlparse(u).netloc if u else None, 'message': q}
    if not u or 'Rohan & Meera' not in q or '14 February 2027' not in q: bad.append('booking form message wrong')
    demos = {}
    for href in pg.evaluate("[...document.querySelectorAll('.demo .btn:not(.btn-ghost)')].map(a=>a.getAttribute('href'))"):
        if href.startswith('http') or href == '#': demos[href] = 'external/skipped'; continue
        d = b.new_page(viewport={'width': 390, 'height': 844}); de = []; d.on('pageerror', lambda e: de.append(str(e)))
        d.goto('file://' + os.path.join(os.path.dirname(path), href, 'index.html')); d.wait_for_timeout(1500)
        demos[href] = {'hasSeal': d.evaluate("!!document.getElementById('openBtn')"), 'errors': de}; d.close()
        if not demos[href]['hasSeal'] or de: bad.append('demo ' + href)
    R['demos'] = demos
    pg.close()
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, java_script_enabled=False); n = ctx.new_page(); n.goto(URL); n.wait_for_timeout(500)
    R['noJS_hiddenReveals'] = n.evaluate("[...document.querySelectorAll('[data-reveal]')].filter(e=>+getComputedStyle(e).opacity<.99).length"); ctx.close(); b.close()
if errs or any(ov.values()) or R['brokenAnchors'] or not R['externalLinksNoopener'] or R['noJS_hiddenReveals'] or bad: print(json.dumps(R, indent=1)); print('\nLANDING NEEDS ATTENTION', bad); sys.exit(1)
print(json.dumps(R, indent=1)); print('\nLANDING PASSED')
