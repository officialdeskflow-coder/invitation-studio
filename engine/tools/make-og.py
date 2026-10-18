#!/usr/bin/env python3
"""Makes the link-preview picture (1200x630) for one couple: names, date and a phone showing their card.
Usage:  python engine/tools/make-og.py <client-name> [--write-config]
Build the card first (npm run build -- <client-name>). Output: clients/<client-name>/photos/og.jpg
--write-config also sets  "seo": {"ogImage": "photos/og.jpg"}  in client.json.
Then set seo.url (the card's final https address) and rebuild: the picture shows when the link is shared.
Needs: pip install playwright pillow   and   playwright install chromium"""
import base64, io, json, sys, tempfile
from datetime import date
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]; FD = ROOT / 'engine' / 'shared' / 'fonts'
args = [a for a in sys.argv[1:] if not a.startswith('--')]
if not args: sys.exit('Usage: python engine/tools/make-og.py <client-name> [--write-config]')
slug = args[0]; cdir = ROOT / 'clients' / slug; cfgp = cdir / 'client.json'; built = ROOT / 'READY-TO-UPLOAD' / slug / 'index.html'
if not cfgp.exists(): sys.exit(f'No such client: clients/{slug}')
if not built.exists(): sys.exit(f'Build the card first:  npm run build -- {slug}')
cfg = json.loads(cfgp.read_text(encoding='utf-8')); tpl = cfg.get('template', 'royal-maroon-gold'); c = cfg.get('couple', {})
first, second, joiner = c.get('first', ''), c.get('second', ''), c.get('joiner', '&')
d = date.fromisoformat(cfg['date']['iso'][:10]); MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']; when = f'{d.day} {MONTHS[d.month-1]} {d.year}'
THEMES = {'royal-maroon-gold': ('radial-gradient(900px 600px at 20% 10%,#741630,#3b0b18 55%,#1b050b)', '#d6b878', '#f7f2e8', '#e6cc92'),
          'sage-garden': ('radial-gradient(900px 600px at 20% 10%,#4d6d59,#2d4337 60%,#1c2c24)', '#e8b9a8', '#f6f1e7', '#e9d7a8')}
bg, acc, txt, soft = THEMES.get(tpl, THEMES['royal-maroon-gold'])
def font(fam, w, st, f): return f"@font-face{{font-family:'{fam}';font-weight:{w};font-style:{st};src:url({(FD/f).as_uri()}) format('woff2')}}"
FONTS = ''.join([font('Cormorant Garamond', 500, 'normal', 'cormorant-garamond-latin-500-normal.woff2'), font('Cormorant Garamond', 400, 'italic', 'cormorant-garamond-latin-400-italic.woff2'), font('Jost', 500, 'normal', 'jost-latin-500-normal.woff2')])
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2); pg = ctx.new_page()
    pg.goto(built.as_uri()); pg.wait_for_timeout(1500); pg.click('#openBtn', force=True); pg.wait_for_timeout(9500)
    shot = Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); shot = shot.resize((520, round(shot.height * 520 / shot.width)), Image.LANCZOS); ctx.close()
    buf = io.BytesIO(); shot.save(buf, 'JPEG', quality=90); uri = 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
    size = 104 if len(first + second) <= 11 else 92 if len(first + second) <= 16 else 76
    html = f"""<!doctype html><meta charset="utf-8"><style>{FONTS}*{{box-sizing:border-box;margin:0}}
body{{width:1200px;height:630px;overflow:hidden;background:{bg};color:{txt};font-family:'Jost',sans-serif;position:relative}}
.fr{{position:absolute;inset:22px;border:2px solid {acc}99}}.fr2{{position:absolute;inset:36px;border:1px solid {acc}44}}
.t{{position:absolute;left:84px;top:110px;width:640px}}.k{{font:500 24px/1 'Jost';letter-spacing:.34em;color:{acc}}}
h1{{font:500 {size}px/1.02 'Cormorant Garamond';margin-top:30px;color:{txt}}}h1 i{{font:italic 400 .62em/1 'Cormorant Garamond';color:{acc};margin:0 .06em}}
.d{{font:500 30px/1 'Jost';letter-spacing:.22em;text-transform:uppercase;margin-top:40px;color:{soft}}}.s{{font:italic 400 38px/1.2 'Cormorant Garamond';margin-top:26px;color:{soft}}}
.ph{{position:absolute;right:92px;top:46px;width:268px;padding:7px;border-radius:40px;background:linear-gradient(145deg,#39463f,#17201b);transform:rotate(4deg);box-shadow:0 30px 60px #0008}}
.ph::before{{content:"";position:absolute;top:14px;left:50%;width:76px;height:20px;margin-left:-38px;border-radius:99px;background:#080c0a;z-index:2}}.ph img{{display:block;width:100%;border-radius:33px}}</style>
<div class="fr"></div><div class="fr2"></div><div class="t"><div class="k">WEDDING INVITATION</div><h1>{first} <i>{joiner}</i> {second}</h1><div class="d">{when}</div><div class="s">Tap to open your invitation</div></div>
<div class="ph"><img src="{uri}"></div>"""
    tmp = Path(tempfile.gettempdir()) / f'og-{slug}.html'; tmp.write_text(html, encoding='utf-8')
    pg = b.new_page(viewport={'width': 1200, 'height': 630}); pg.goto(tmp.as_uri()); pg.evaluate('document.fonts.ready.then(()=>1)'); pg.wait_for_timeout(600)
    out = cdir / 'photos' / 'og.jpg'; out.parent.mkdir(exist_ok=True); Image.open(io.BytesIO(pg.screenshot())).convert('RGB').save(out, quality=88, optimize=True); b.close()
print('wrote', out.relative_to(ROOT), f'({out.stat().st_size // 1024} KB, 1200x630)')
if '--write-config' in sys.argv:
    cfg.setdefault('seo', {})['ogImage'] = 'photos/og.jpg'; cfgp.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + '\n', encoding='utf-8'); print('set seo.ogImage in client.json')
print('Next: set  "seo": {"url": "https://your-card-address/"}  in client.json, then  npm run build --', slug)
