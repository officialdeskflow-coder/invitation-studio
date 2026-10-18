#!/usr/bin/env python3
"""Makes the WhatsApp catalogue / Status pricing banners from landing-site/site.json (so prices always match the website).
Usage:  python engine/tools/make-banners.py        ->  marketing/whatsapp/banners/*.jpg
Needs:  pip install playwright pillow   and   playwright install chromium"""
import io, json, re, sys, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]; OUT = ROOT / 'marketing' / 'whatsapp' / 'banners'; OUT.mkdir(parents=True, exist_ok=True)
site = json.loads((ROOT / 'landing-site' / 'site.json').read_text(encoding='utf-8')); PV = ROOT / 'landing-site' / 'assets' / 'previews'; FD = ROOT / 'engine' / 'shared' / 'fonts'
def u(p): return Path(p).as_uri()
def esc(s): return str(s).replace('&', '&amp;').replace('<', '&lt;')
FONTS = ''.join(f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:{st};src:url({u(FD/f)}) format('woff2')}}" for fam, w, st, f in [
 ('Cormorant Garamond', 500, 'normal', 'cormorant-garamond-latin-500-normal.woff2'), ('Cormorant Garamond', 600, 'normal', 'cormorant-garamond-latin-600-normal.woff2'), ('Cormorant Garamond', 400, 'italic', 'cormorant-garamond-latin-400-italic.woff2'),
 ('Jost', 300, 'normal', 'jost-latin-300-normal.woff2'), ('Jost', 400, 'normal', 'jost-latin-400-normal.woff2'), ('Jost', 500, 'normal', 'jost-latin-500-normal.woff2')])
CSS = FONTS + """
*{box-sizing:border-box;margin:0;padding:0}body{background:#000}
.b{position:relative;width:1080px;overflow:hidden;color:#f7f2e8;font-family:'Jost',sans-serif;background:radial-gradient(1000px 760px at 22% 14%,#741630 0,#3b0b18 52%,#1b050b 100%)}
.b::before{content:"";position:absolute;inset:26px;border:2px solid rgba(214,184,120,.6)}.b::after{content:"";position:absolute;inset:42px;border:1px solid rgba(214,184,120,.28)}
.ring{position:absolute;border:1.5px solid rgba(214,184,120,.22);border-radius:50%}
.kick{position:absolute;left:86px;top:92px;font:500 26px/1 'Jost';letter-spacing:.34em;color:#d6b878}
h1{position:absolute;left:82px;top:136px;font:500 142px/1 'Cormorant Garamond';color:#f7f2e8;letter-spacing:-.01em}
.tag{position:absolute;left:88px;top:296px;font:italic 400 50px/1.1 'Cormorant Garamond';color:#e6cc92}
.badge{position:absolute;right:84px;top:78px;width:236px;height:236px;border-radius:50%;background:linear-gradient(145deg,#f4dfa3,#c49c50);color:#3b0b18;display:flex;flex-direction:column;align-items:center;justify-content:center;box-shadow:0 0 0 8px rgba(214,184,120,.25),0 18px 40px rgba(0,0,0,.45)}
.badge b{font:600 60px/1 'Cormorant Garamond'}.badge i{font:500 21px/1.15 'Jost';font-style:normal;letter-spacing:.06em;margin-top:8px;text-align:center}
ul.pts{position:absolute;left:88px;top:404px;width:440px;list-style:none}ul.pts li{position:relative;padding-left:44px;margin-bottom:20px;font:300 34px/1.26 'Jost'}
ul.pts li::before{content:"";position:absolute;left:4px;top:.5em;width:14px;height:14px;background:#d6b878;transform:rotate(45deg)}
.phones{position:absolute;right:58px;top:346px;width:450px;height:560px}.ph{position:absolute;width:236px;padding:7px;border-radius:38px;background:linear-gradient(145deg,#39463f,#17201b);box-shadow:0 34px 60px rgba(0,0,0,.55)}
.ph::before{content:"";position:absolute;top:15px;left:50%;width:70px;height:20px;margin-left:-35px;border-radius:99px;background:#080c0a;z-index:2}.ph img{display:block;width:100%;border-radius:31px}
.cta{position:absolute;left:86px;right:86px;bottom:74px;height:86px;border-radius:99px;background:linear-gradient(90deg,#ecd596,#d1a95a);color:#3b0b18;display:flex;align-items:center;justify-content:center;font:500 31px/1 'Jost';letter-spacing:.12em;text-transform:uppercase}
.fine{position:absolute;left:86px;right:86px;bottom:176px;text-align:center;font:300 28px/1 'Jost';letter-spacing:.06em;color:#e6cc92}
/* price list */
.pl h1{font-size:104px;top:120px;left:86px;right:86px;text-align:center}.pl .kick{left:0;right:0;text-align:center;top:84px}.pl .tag{left:0;right:0;text-align:center;top:250px}
.row{position:absolute;left:86px;right:86px;height:262px;border:1.5px solid rgba(214,184,120,.5);border-radius:26px;background:rgba(255,255,255,.045);padding:24px 40px;display:flex;gap:34px;align-items:center}
.row .nm{width:300px}.row h2{font:500 56px/1 'Cormorant Garamond';color:#f7f2e8}.row .sub{font:italic 400 29px/1.2 'Cormorant Garamond';color:#e6cc92;margin-top:8px}
.row .pr{margin-top:14px;font:600 60px/1 'Cormorant Garamond';color:#f4dfa3}.row .pr small{display:block;font:300 22px/1.2 'Jost';color:#cdbfa2;margin-top:4px}
.row ul{list-style:none;flex:1}.row li{position:relative;padding-left:34px;margin:9px 0;font:300 29px/1.25 'Jost'}.row li::before{content:"";position:absolute;left:3px;top:.5em;width:11px;height:11px;background:#d6b878;transform:rotate(45deg)}
.row.hot{background:linear-gradient(135deg,#f4dfa3,#c9a257);border-color:#f4dfa3;color:#3b0b18}.row.hot h2,.row.hot .pr{color:#3b0b18}.row.hot .sub{color:#5a1b2a}.row.hot .pr small{color:#5a1b2a}.row.hot li::before{background:#3b0b18}
.star{position:absolute;right:52px;top:-18px;background:#3b0b18;color:#f4dfa3;border:2px solid #f4dfa3;border-radius:99px;padding:8px 22px;font:500 21px/1 'Jost';letter-spacing:.2em}
"""
def phones(names, kind):
    if kind == 2: pos = [(0, 96, -5), (208, 10, 4)]
    else: pos = [(0, 118, -6), (146, 28, 0), (292, 96, 6)]
    return ''.join(f'<div class="ph" style="left:{x}px;top:{y}px;transform:rotate({r}deg);width:{218 if kind==2 else 160}px"><img src="{u(PV/(n+".webp"))}"></div>' for n, (x, y, r) in zip(names, pos))
def item(p, label, imgs, fine):
    pts = ''.join(f'<li>{esc(f)}</li>' for f in p['features'])
    unit = esc(p['unit']).replace(', ', ',<br>') if len(p['unit']) > 14 else esc(p['unit'])
    return f"""<div class="b" style="height:1080px"><div class="ring" style="width:760px;height:760px;right:-120px;top:230px"></div><div class="ring" style="width:560px;height:560px;right:-20px;top:330px"></div>
<div class="kick">{esc(label)}</div><h1>{esc(p['name'])}</h1><div class="tag">{esc(p['tagline'])}</div>
<div class="badge"><b>{esc(p['price'])}</b><i>{unit}</i></div><ul class="pts">{pts}</ul><div class="phones">{phones(imgs, 2 if len(imgs)==2 else 3)}</div>
<div class="cta">Message us on WhatsApp to book</div></div>"""
def pricelist(items):
    rows = ''
    for i, p in enumerate(items):
        feats = ''.join(f'<li>{esc(f)}</li>' for f in p['features'][:3])
        rows += f"""<div class="row{' hot' if p.get('featured') else ''}" style="top:{326+i*270}px">{'<span class="star">MOST CHOSEN</span>' if p.get('featured') else ''}<div class="nm"><h2>{esc(p['name'])}</h2><div class="sub">{esc(p['tagline'])}</div><div class="pr">{esc(p['price'])}<small>{esc(p['unit'])}</small></div></div><ul>{feats}</ul></div>"""
    return f"""<div class="b pl" style="height:1350px"><div class="kick">WEDDING INVITATIONS</div><h1>Packages &amp; Prices</h1><div class="tag">Animated invitations your guests open on their phones</div>{rows}
<div class="fine" style="bottom:182px">Private preview before you share  ·  RSVPs in your Google Sheet</div><div class="cta">Message us on WhatsApp to book</div></div>"""
P = {p['name']: p for p in site['pricing']['items']}
cards = {
 'invite-1-classic': (item(P['Classic'], 'WEDDING INVITATIONS', ['royal-hero', 'sage-hero'], 'Choose either design  ·  Private preview first'), 1080),
 'invite-2-signature': (item(P['Signature'], 'WEDDING INVITATIONS', ['royal-gate', 'sage-mid'], 'Music, Punjabi / Hindi wording, link preview'), 1080),
 'invite-3-planner': (item(P['Planner'], 'FOR WEDDING PLANNERS', ['royal-hero', 'sage-hero', 'royal-mid'], 'Volume rates for repeat bookings'), 1080),
 'invite-4-price-list': (pricelist(site['pricing']['items']), 1350)}
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1350})
    for name, (body, h) in cards.items():
        tmp = Path(tempfile.gettempdir()) / f'banner-{name}.html'; tmp.write_text(f'<!doctype html><meta charset="utf-8"><style>{CSS}</style>{body}', encoding='utf-8')
        pg.goto(tmp.as_uri()); pg.evaluate('document.fonts.ready.then(()=>1)'); pg.wait_for_timeout(700)
        png = pg.screenshot(clip={'x': 0, 'y': 0, 'width': 1080, 'height': h}); im = Image.open(io.BytesIO(png)).convert('RGB'); im.save(OUT / f'{name}.jpg', quality=92, optimize=True)
        print('wrote', f'{name}.jpg', im.size, round((OUT / f'{name}.jpg').stat().st_size / 1024), 'KB')
    b.close()
