"""Parity check: compare two builds element by element (layout + key styles) at several scroll positions.
Usage: python engine/qa/parity.py <old.html> <new.html>
Runs both pages in calm mode with a frozen clock and seeded Math.random so only real differences show."""
import sys, json, os
from playwright.sync_api import sync_playwright
INIT = """(()=>{const D=Date,fixed=new D('2026-10-17T10:00:00Z').getTime();
class FD extends D{constructor(...a){a.length?super(...a):super(fixed)}static now(){return fixed}};window.Date=FD;
let s=12345;Math.random=()=>{s=(s*1664525+1013904223)%4294967296;return s/4294967296}})();"""
SNAP = """(()=>{const props=['display','position','opacity','color','backgroundColor','fontSize','fontFamily','transform','clipPath','zIndex','overflow'];
const out=[];document.querySelectorAll('body *').forEach(e=>{if(['SCRIPT','STYLE','DEFS','SYMBOL','PATH','CIRCLE','RECT','G','USE','TEXT','STOP','RADIALGRADIENT','LINEARGRADIENT'].includes(e.tagName.toUpperCase()))return;
const r=e.getBoundingClientRect(),c=getComputedStyle(e);const cls=(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className)||'';
out.push({k:e.tagName.toLowerCase()+'.'+String(cls).trim().split(/\\s+/).sort().join('.'),r:[r.x,r.y+scrollY,r.width,r.height].map(v=>Math.round(v)),s:props.map(p=>c[p]).join('|')})});return out})()"""
def snapshots(br, path):
    ctx = br.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce'); pg = ctx.new_page()
    pg.add_init_script(INIT); pg.goto('file://' + os.path.abspath(path)); pg.wait_for_timeout(800)
    pg.add_style_tag(content='*{animation:none!important;transition:none!important}')
    pg.evaluate("document.getElementById('openBtn').click()"); pg.wait_for_timeout(9500)
    H = pg.evaluate('document.documentElement.scrollHeight'); res = {'height': H, 'snaps': {}}
    for y in range(0, H, 650):
        pg.evaluate(f'scrollTo(0,{y})'); pg.wait_for_timeout(1500); res['snaps'][y] = pg.evaluate(SNAP)
    ctx.close(); return res
with sync_playwright() as p:
    br = p.chromium.launch(); A = snapshots(br, sys.argv[1]); B = snapshots(br, sys.argv[2]); br.close()
print('page height old/new:', A['height'], B['height'])
bad = 0
for y in A['snaps']:
    a, b = A['snaps'][y], B['snaps'].get(y)
    if b is None: print('scroll', y, 'missing in new'); bad += 1; continue
    ka, kb = [x['k'] for x in a], [x['k'] for x in b]
    if ka != kb:
        import difflib; d = [l for l in difflib.unified_diff(ka, kb, lineterm='', n=0) if not l.startswith(('---', '+++', '@@'))]
        print('scroll', y, 'ELEMENT LIST DIFFERS', len(ka), 'vs', len(kb), d[:8]); bad += 1; continue
    mism = []
    for x, z in zip(a, b):
        dr = max(abs(i - j) for i, j in zip(x['r'], z['r']))
        if dr > 1 or x['s'] != z['s']: mism.append((x['k'], x['r'], z['r'], '' if x['s'] == z['s'] else 'STYLE ' + str([(i, j) for i, j in zip(x['s'].split('|'), z['s'].split('|')) if i != j][:3])))
    print('scroll', y, f'{len(a)} elements, mismatches: {len(mism)}'); bad += bool(mism)
    for m in mism[:6]: print('   ', m)
print('PARITY', 'OK' if not bad else f'FAILED ({bad} positions)')
sys.exit(1 if bad else 0)
