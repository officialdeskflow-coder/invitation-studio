#!/usr/bin/env python3
"""Captures the pictures the landing page needs.
Usage: python engine/tools/make-previews.py        (build the clients first: npm run build:all)
  1. phone screenshots of both demo cards -> landing-site/assets/previews/<name>-gate|hero|mid.webp (520 px wide)
  2. the 1200x630 link-preview picture (og.jpg), taken from the built landing page if READY-TO-UPLOAD/sales-website exists
     (run npm run build:site, then this tool again, then npm run build:site once more to include the new picture)
Needs: pip install playwright pillow  and  playwright install chromium"""
import os, sys, io
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'landing-site' / 'assets' / 'previews'; OUT.mkdir(parents=True, exist_ok=True)
DEMOS = [('royal', 'gursewak-simran', 'ven'), ('sage', 'kabir-anaya', 'sch')]   # (name, client folder, section id for the third shot)
def save(png, name):
    im = Image.open(io.BytesIO(png)).convert('RGB'); w = 520; im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(OUT / f'{name}.webp', quality=84, method=6); print('wrote', f'{name}.webp', im.size)
with sync_playwright() as p:
    b = p.chromium.launch()
    for name, client, sec in DEMOS:
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2); pg = ctx.new_page()
        pg.goto('file://' + str(ROOT / 'READY-TO-UPLOAD' / client / 'index.html')); pg.wait_for_timeout(1500)
        save(pg.screenshot(), f'{name}-gate')
        pg.click('#openBtn', force=True); pg.wait_for_timeout(9000); save(pg.screenshot(), f'{name}-hero')
        pg.evaluate(f"scrollTo(0,document.getElementById('{sec}').getBoundingClientRect().top+scrollY-20)"); pg.wait_for_timeout(4200); save(pg.screenshot(), f'{name}-mid')
        ctx.close()
    land = ROOT / 'READY-TO-UPLOAD' / 'sales-website' / 'index.html'
    if land.exists():
        pg = b.new_page(viewport={'width': 1200, 'height': 630}); pg.goto('file://' + str(land)); pg.wait_for_timeout(1800)
        pg.add_style_tag(content='.nav,.fab,.cta-row{display:none!important}*{transition:none!important}[data-reveal]{opacity:1!important;transform:none!important}.phones .phone{animation:none!important}'); pg.wait_for_timeout(500)
        im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); im.save(OUT / 'og.jpg', quality=88, optimize=True); print('wrote og.jpg', im.size)
    b.close()
