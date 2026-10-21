#!/usr/bin/env python3
"""Browser check for a built birthday card.
Usage:  python engine/qa/birthday-smoke.py READY-TO-UPLOAD/aarav-birthday/index.html
Checks: no script errors, the gate opens, nothing stays hidden after scrolling (7 screen sizes), no sideways scroll,
countdown shows numbers, the date text is real, the calendar file downloads, RSVP (when present) validates and builds a
WhatsApp link, Reduce Motion works, and the card still shows everything if the animation library fails to load.
Needs: pip install playwright   and   playwright install chromium"""
import json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

if len(sys.argv) < 2:
    sys.exit(__doc__)
URL = Path(sys.argv[1]).resolve().as_uri()
SIZES = [(320, 568), (360, 740), (390, 844), (430, 932), (820, 1100), (1280, 800), (1280, 1400)]
HIDDEN = "[...document.querySelectorAll('[data-reveal]')].filter(e=>+getComputedStyle(e).opacity<.9).length"
HIDDEN_H2 = "[...document.querySelectorAll('h2')].filter(h=>{const w=h.querySelector('.wi');return w&&new DOMMatrix(getComputedStyle(w).transform).m42>2}).length"
bad = []; R = {}

def scroll_through(pg):
    H = pg.evaluate('document.documentElement.scrollHeight'); y = 0
    while y < H: pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(160); y += 320
    pg.evaluate('scrollTo(0,document.documentElement.scrollHeight)'); pg.wait_for_timeout(3200)

with sync_playwright() as p:
    b = p.chromium.launch()
    for w, h in SIZES:
        ctx = b.new_context(viewport={'width': w, 'height': h}, has_touch=w < 700); pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('requestfailed', lambda r: errs.append('request failed: ' + r.url))
        pg.goto(URL); pg.wait_for_timeout(900)
        fits = pg.evaluate("(()=>{const c=document.querySelector('.g-content').getBoundingClientRect();return c.top>=0&&c.bottom<=innerHeight})()")
        pg.click('#openBtn'); pg.wait_for_timeout(4300); scroll_through(pg)
        r = {'gateOpens': pg.evaluate("getComputedStyle(document.getElementById('gate')).display==='none'"), 'gateFits': fits, 'hidden': pg.evaluate(HIDDEN) + pg.evaluate(HIDDEN_H2),
             'overflowX': pg.evaluate('document.documentElement.scrollWidth>innerWidth+1'), 'errors': errs}
        R[f'{w}x{h}'] = r
        for k, v in r.items():
            if (k in ('gateOpens', 'gateFits') and not v) or (k in ('hidden',) and v) or (k == 'overflowX' and v) or (k == 'errors' and v): bad.append(f'{w}x{h}: {k}')
        ctx.close()
    # ---- details at phone size
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, accept_downloads=True); pg = ctx.new_page()
    pg.add_init_script("window.__opened=[];window.open=function(u){window.__opened.push(String(u));return {}}")
    pg.goto(URL); pg.wait_for_timeout(900); pg.click('#openBtn'); pg.wait_for_timeout(4300)
    D = {'countdownNumbers': pg.evaluate("[...document.querySelectorAll('.u .num')].every(n=>/^\\d+$/.test(n.firstChild.textContent))"),
         'dateText': pg.inner_text('.when').replace('\n', ' '), 'hasRsvp': pg.evaluate("!!document.getElementById('rform')")}
    if not D['countdownNumbers']: bad.append('countdown is not showing numbers')
    if not any(m in D['dateText'] for m in ('January','February','March','April','May','June','July','August','September','October','November','December', 'JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER')): bad.append('hero date text looks wrong: ' + D['dateText'])
    pg.evaluate("document.querySelector('#calBtn').scrollIntoView({block:'center'})"); pg.wait_for_timeout(500)
    with pg.expect_download() as dl: pg.click('#calBtn')
    ics = Path(dl.value.path()).read_text(); D['calendarFile'] = 'BEGIN:VEVENT' in ics and 'DTSTART:' in ics and 'DTEND:' in ics
    if not D['calendarFile']: bad.append('calendar file is not valid')
    if D['hasRsvp']:
        pg.evaluate("document.querySelector('#rform').scrollIntoView({block:'center'})"); pg.wait_for_timeout(1200)
        pg.click('#rsub'); D['needsName'] = 'name' in pg.inner_text('#rst').lower()
        pg.fill('#r-name', 'Test Guest'); pg.click('#rsub'); D['needsChoice'] = 'yes or no' in pg.inner_text('#rst').lower()
        pg.click('.choice label:first-child span'); pg.select_option('#r-guests', '2'); pg.fill('#r-msg', 'Excited!'); pg.click('#rsub'); pg.wait_for_timeout(700)
        url = pg.evaluate("window.__opened[0]||''"); D['whatsappLink'] = url.startswith('https://wa.me/') and 'Test%20Guest' in url and 'coming%20(2)' in url
        for k in ('needsName', 'needsChoice', 'whatsappLink'):
            if not D[k]: bad.append('RSVP: ' + k)
    R['details'] = D; ctx.close()
    # ---- Reduce Motion and no animation library
    for label, kw, block in (('reduceMotion', {'reduced_motion': 'reduce'}, False), ('noAnimationLibrary', {}, True)):
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, has_touch=True, **kw); pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        if block: pg.route('**/*gsap*.js', lambda r: r.abort()); pg.route('**/*ScrollTrigger*.js', lambda r: r.abort())
        pg.goto(URL); pg.wait_for_timeout(900); pg.click('#openBtn'); pg.wait_for_timeout(4300); scroll_through(pg)
        r = {'gateOpens': pg.evaluate("getComputedStyle(document.getElementById('gate')).display==='none'"), 'hidden': pg.evaluate(HIDDEN) + pg.evaluate(HIDDEN_H2), 'errors': errs}; R[label] = r
        if not r['gateOpens'] or r['hidden'] or r['errors']: bad.append(label)
        ctx.close()
    b.close()
print(json.dumps(R, indent=1))
print('BIRTHDAY SMOKE PASSED' if not bad else 'BIRTHDAY SMOKE FAILED: ' + '; '.join(bad))
sys.exit(1 if bad else 0)
