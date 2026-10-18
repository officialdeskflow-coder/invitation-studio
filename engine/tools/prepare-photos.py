#!/usr/bin/env python3
"""Crop and compress client photos for the invitation (3:4 portrait, 500x667 WebP, about 50-80 KB each).

Usage:
  python engine/tools/prepare-photos.py INPUT_FOLDER_OR_FILES... --out clients/<slug>/photos [--focus 0.3] [--width 500] [--quality 80]

--focus  vertical focus of the crop, 0 = keep the top of the photo, 1 = keep the bottom (default 0.3, good for portraits so heads stay in frame).
Needs Pillow:  pip install pillow
Tip: start from the largest original you have; the card shows photos up to about 300 px wide, so 500 px is sharp on 2x screens
(for very sharp 3x phones use --width 750)."""
import argparse, sys
from pathlib import Path
try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit('Pillow is missing. Run: pip install pillow')
ap = argparse.ArgumentParser(); ap.add_argument('inputs', nargs='+'); ap.add_argument('--out', required=True)
ap.add_argument('--focus', type=float, default=0.3); ap.add_argument('--width', type=int, default=500); ap.add_argument('--quality', type=int, default=80)
a = ap.parse_args(); out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
files = []
for i in a.inputs:
    p = Path(i); files += sorted(f for f in p.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp', '.heic')) if p.is_dir() else [p]
if not files: sys.exit('No images found.')
for n, f in enumerate(files, 1):
    im = ImageOps.exif_transpose(Image.open(f)).convert('RGB'); w, h = im.size; tw, th = a.width, round(a.width * 4 / 3)
    if w / h > 3 / 4: nw = round(h * 3 / 4); x = (w - nw) // 2; box = (x, 0, x + nw, h)
    else: nh = round(w * 4 / 3); y = round((h - nh) * min(max(a.focus, 0), 1)); box = (0, y, w, y + nh)
    im = im.crop(box).resize((tw, th), Image.LANCZOS); dest = out / f'photo-{n}.webp'; im.save(dest, quality=a.quality, method=6)
    print(f'{f.name} -> {dest}  ({dest.stat().st_size // 1024} KB)' + ('  WARNING: source is small, may look soft' if min(w, h) < tw else ''))
