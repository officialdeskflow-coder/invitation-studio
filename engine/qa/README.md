# Browser QA

Setup once: `pip install playwright pillow` then `playwright install chromium`.

| Script | Use |
|---|---|
| `smoke.py <index.html> [--rsvp]` | Fast check (about 30 s). Exit code 1 on errors, overflow or hidden elements. |
| `qa.py <index.html>` | Full animation QA. Prints `QA PASSED` or `NEEDS ATTENTION`. |
| `parity.py old.html new.html` | Compares every element's position, size and key styles at 8 scroll positions with a frozen clock. Use when refactoring a design that must not change. |

All three open file:// URLs, so build first (`npm run build -- <couple-name>`) and pass `READY-TO-UPLOAD/<couple-name>/index.html`.
| `site-smoke.py <landing index.html>` | Landing page: overflow at 7 widths, booking message, demos open, JavaScript off. |
