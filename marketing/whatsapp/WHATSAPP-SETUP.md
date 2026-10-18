# WhatsApp Business: add wedding invitations to your existing account

Same number, same Catalogue. About 15 minutes. Fill the three **[brackets]** first:
- **[website link]** : your sales website address (after you upload `READY-TO-UPLOAD/sales-website`)
- **[delivery time]** : what you really promise (for example "3 working days"). Do not promise more than you can do.
- **[payment details]** : your UPI ID or bank details, and whether you take an advance

Banners are in `marketing/whatsapp/banners/` (1080 px JPG). If you change a price in `landing-site/site.json`, run `python engine/tools/make-banners.py` and the banners update to match.

---
## 1. Catalogue: three new items
Open **Catalogue -> Add new item**. For each item: add the picture, then paste the name, price and description. Add `invite-4-price-list.jpg` as a **second picture** on every item so people also see all packages.

| | Item 1 | Item 2 | Item 3 |
|---|---|---|---|
| **Picture** | `invite-1-classic.jpg` | `invite-2-signature.jpg` | `invite-3-planner.jpg` |
| **Name** | Classic Invite - Animated Wedding Card | Signature Invite - Music + Link Preview | Planner Pack - Per Card, 5+ Cards |
| **Price** | 3999 | 6999 | 2999 |
| **Link** (optional) | [website link]/#pricing | [website link]/#pricing | [website link]/#pricing |

**Descriptions (copy each one):**

*Classic Invite*
> Starting price. 1 animated wedding invitation, your choice of 2 designs: tap-to-open card, countdown, schedule, map link, photo gallery, RSVPs to your Google Sheet and a private shareable link. Private preview before you share. Message us to book.

*Signature Invite*
> Starting price. Everything in Classic plus your song with a play button, Punjabi or Hindi wording and a WhatsApp link preview with your picture. Private preview before you share. Message us to book.

*Planner Pack*
> Per card, for 5 or more invitations. Made for wedding planners booking several weddings: volume rates and quick repeat orders. Message us for planner details.

Then **Add new collection**: name it **Wedding Invitations** and tick the three items. Your graphics items stay in their own collection, so each type of customer sees the right prices.

---
## 2. Messages (Settings -> Business tools)

### Greeting message (sent to new customers). Replace your current one with this, so it covers both services
```
Hello! Thank you for messaging us. 🙏
What can we help you with?
1️⃣ Graphics: posters, offer creatives, festival packs, reel ads
2️⃣ Wedding invitations: animated cards your guests open on their phones
Reply *1* or *2*, or just tell us what you need. Prices are in our Catalogue.
We reply within [your reply time].
```
The free Business app cannot branch automatically on "1" or "2". When someone replies 2, send the quick reply `/invite` below.

### Away message (outside your working hours)
```
Thank you for your message! We are away right now and will reply by [time / day].
In the meantime, our Catalogue shows packages and prices for graphics and wedding invitations.
```

### Quick replies (Business tools -> Quick replies). Type `/` in any chat to use them
**Shortcut `/invite`** (first answer to any invitation inquiry)
```
Thank you for your interest in our animated wedding invitations! 🙏
It is a card your guests open on their phones: a tap-to-open animation, countdown, schedule, venue map, photo gallery, optional music, and RSVPs that arrive in your own Google Sheet.

Packages:
• Classic ₹3,999: your choice of 2 designs, all the essentials
• Signature ₹6,999: plus your song, Punjabi/Hindi wording and a WhatsApp link preview
• Planner ₹2,999 per card (5 or more cards)

Live demos: [website link]
Delivery: [delivery time] after we receive your details.

To start, please tell me your names, wedding date and which design you like. I will send the details list next.
```
**Shortcut `/invdetails`** (what you need from them)
```
To prepare your invitation, please send:
1. Names exactly as you want them spelled
2. Wedding date, start time and city
3. Each event: name, time, place (up to 8)
4. Venue name and Google Maps link
5. 3 portrait photos (high quality, faces in the upper half). Please confirm you have permission to use them.
6. Any Punjabi/Hindi wording you want
7. A song, if you want music (please confirm you have the right to use it)
8. The Google account (email) that should receive RSVPs
9. Which design: Royal Maroon & Gold or Sage Garden
```
**Shortcut `/invdemo`**
```
Here are the live demos. Tap the seal or lotus to open them:
Royal Maroon & Gold: [website link]/demo/royal-maroon-gold/
Sage Garden: [website link]/demo/sage-garden/
Best opened on your phone. 😊
```
**Shortcut `/invpay`**
```
To confirm your booking: [payment details].
Please send a screenshot after paying and we will start right away. 🙏
```
**Shortcut `/invpreview`**
```
Your private preview is ready: [preview link]
Please check carefully: spelling of names, date and times, every event, venue and map.
Reply with all changes in one message. When you are happy, reply APPROVED and we will publish it.
```
**Shortcut `/invfinal`**
```
Your invitation is live! 🎉
Link: [final link]
How to share: send this link on WhatsApp to your guests. It shows a preview picture, and guests tap to open it.
Your RSVP replies arrive here: [Google Sheet link]
Need a change later? Message us here.
```
**Shortcut `/invplanner`**
```
Thank you for reaching out! We offer planner rates for 5 or more invitations (from ₹2,999 per card). Tell me how many weddings you are planning this season and which design style your couples prefer, and I will share the details.
```

### Labels (Business tools -> Labels): one per stage
`Invite: New` -> `Invite: Details received` -> `Invite: Preview sent` -> `Invite: Paid / Approved` -> `Invite: Delivered` (plus `Planner`). Tag every chat so you never lose track of who is waiting for what. Keep invitation clients' photos and details under these labels, separate from your graphics clients.

---
## 3. Check before you save
- Only keep promises you will keep: delivery time, advance payment, how many changes you allow, how long the link stays online. Edit those lines to your real policy.
- The prices match the website. If you change one, change the Catalogue item, the quick replies and re-run the banner tool.
- Screen names in the app can differ slightly between phone and desktop versions; the steps are the same.
