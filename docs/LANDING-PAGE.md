# Landing page (your sales website)

A single elegant page that shows your work and takes bookings. **One file controls it: `landing-site/site.json`.**

## Build and upload
```
npm run build:site
```
Upload the folder **`READY-TO-UPLOAD/sales-website/`** to Netlify or Cloudflare Pages. It already contains both live demo cards (they open at `yoursite/demo/royal-maroon-gold/` and `yoursite/demo/sage-garden/`), so you do not upload anything else for the sales site.
Couples' own invitations are separate: each one is its own folder in `READY-TO-UPLOAD/`.

## Edit before you go live (in `landing-site/site.json`)
| Key | What to do |
|---|---|
| `contact.whatsapp` | **Required.** Country code + number, digits only, for example `919876543210`. Every Book button uses it. It currently holds a placeholder. |
| `brand.name`, `brand.tagline` | Your business name. |
| `pricing.items[].price` and `unit` | Suggested starting prices are filled in (Classic ₹3,999, Signature ₹6,999, Planner ₹2,999 per card for 5+). Change them any time; empty shows "Price on request". Package names and feature lists are examples: change them to what you really sell. |
| `siteUrl` | Your final https address, for example `https://your-project.pages.dev`. **This switches on the picture people see when you share the link** (plus canonical link and sitemap). See `docs/LINK-PREVIEW.md`. |
| `contact.email`, `contact.instagram` | Optional; shown in the booking section when filled. |
| `faq.items` | Two answers are marked "(Placeholder...)": edit them to your real policy (changes after approval, how long the link stays online). |
| `testimonials` | Leave empty until you have real ones. Format: `[{"quote": "...", "who": "Rohan & Meera"}]`. Do not invent reviews. |
| `demos.items` | The designs shown. `previewUrl` is only used by the single-file build. |

The page text (headline, steps, features) is in the same file, so you can reword anything without touching code.

## When you change a design or add a template
1. `npm run build:all`
2. `python engine/tools/make-previews.py` (needs Python + Playwright + Pillow) retakes the phone pictures and the link-preview picture from the built cards.
3. `npm run build:site`
To show a new template, add an item to `demos.items` with its client folder, a short `path`, and its three picture names.

## How it works
- The booking form never stores anything. It builds a WhatsApp message (names, date, design, notes) and opens `wa.me/<your number>` so you receive it in chat.
- Typography: Cormorant Garamond for headings (italic only for the one accent word), Jost for text and labels, one fixed size scale and an 8-pixel spacing scale, both defined at the top of `landing-site/site.css`.
- Animations are gentle: content fades up as it scrolls into view, the two phones float slowly. Both stop for people who use Reduce Motion, and a timer guarantees nothing can stay hidden.
- Fonts and pictures are self-hosted, so nothing loads from other websites. No analytics or tracking is included.

## Checks
`npm test` includes landing page checks (links, images, security attributes, bad WhatsApp number rejected). For a browser check: `python engine/qa/site-smoke.py READY-TO-UPLOAD/sales-website/index.html` (overflow at 7 screen widths, the booking message, both demos opening, JavaScript off).

## Pricing notes
The suggested prices sit slightly below what comparable Indian digital-invite sellers list (about ₹5,000 for a basic animated web invite) so a new brand can win its first clients. Keep them only if they suit your costs and time: a card takes roughly one to two hours once the client's details and photos are ready. Add-ons you can sell separately without code changes: extra events beyond the default, Punjabi/Hindi wording, a song, extra revision rounds.

## One WhatsApp number or two?
One WhatsApp Business number can serve several services (posters, ads, invitations). Use labels (for example "Wedding invitations"), quick replies for the questionnaire and prices, and a greeting message. The landing page's messages start with "Hello! I would like a wedding invitation", so you can tell where each chat came from. Use a second number only if you want a separate brand identity or volume that needs more than one phone; a second number needs its own WhatsApp Business install.
