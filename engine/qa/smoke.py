"""Fast smoke test (about 30 s): opens the card, scrolls through it, reports console errors, sideways overflow,
elements left hidden, and optionally exercises the RSVP form.  Usage: python engine/qa/smoke.py READY-TO-UPLOAD/<client>/index.html [--rsvp]"""
import os, sys, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.abspath(sys.argv[1])
HID = """(()=>{const o=[];document.querySelectorAll('.rv,.flr,.arch2,.oval,#mand,.cell,.sp-h').forEach(e=>{const c=getComputedStyle(e);let bad=false;
 if(e.classList.contains('sp-h')){const w=e.querySelector('.wi');bad=w&&new DOMMatrix(getComputedStyle(w).transform).m42>2}else bad=+c.opacity<.99||(c.clipPath!=='none'&&c.clipPath.includes('100%'));
 if(bad)o.push((e.id||String(e.className.baseVal??e.className)).slice(0,30))});return o})()"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 390, 'height': 844}); errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text[:140]) if m.type in ('error', 'warning') and 'ERR_NAME' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto(URL); pg.wait_for_timeout(700); pg.click('#openBtn', force=True); pg.wait_for_timeout(8200)
    H = pg.evaluate('document.documentElement.scrollHeight'); y = 0
    while y < H: pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(150); y += 170
    pg.evaluate(f'scrollTo(0,{H})'); pg.wait_for_timeout(3200)
    r = {'height': H, 'overflowX': pg.evaluate('document.documentElement.scrollWidth>innerWidth'), 'stuckHidden': pg.evaluate(HID), 'errors': errs,
         'sections': pg.evaluate("[...document.querySelectorAll('main > section')].map(s=>s.id)"), 'audioButton': pg.evaluate("!!document.getElementById('snd')&&!document.getElementById('snd').hidden")}
    if '--rsvp' in sys.argv and pg.evaluate("!!document.getElementById('rseal')"):
        pg.evaluate("document.getElementById('rsvp').scrollIntoView()"); pg.wait_for_timeout(1800); pg.evaluate("rseal.click()"); pg.wait_for_timeout(2500)
        pg.fill('#rname', 'Test Guest'); pg.select_option('#ratt', 'yes'); pg.evaluate("rsub.click()"); pg.wait_for_timeout(2500)
        r['rsvp'] = {'formOpen': pg.evaluate("rform.classList.contains('shown')"), 'status': pg.inner_text('#rst'), 'state': pg.evaluate("rst.dataset.s"), 'note': pg.inner_text('#rnote'), 'guestOptions': pg.evaluate("rg.options.length")}
    print(json.dumps(r, indent=1)); b.close()
    sys.exit(1 if r['errors'] or r['stuckHidden'] or r['overflowX'] else 0)
