# RSVP backend (Google Sheets + Apps Script)

One Apps Script web app can serve many couples. Each card sends its own `invitationId`; the script only accepts IDs on its allow-list.

## One-time set-up (about 10 minutes)
1. Create a Google Sheet owned by you (or the customer).
2. Open [script.new](https://script.new), name it `Wedding RSVP Receiver`, paste in `engine/integrations/google-apps-script/Code.gs`.
3. **Project Settings → Script properties**, add:
   - `RSVP_SPREADSHEET_ID`: the ID between `/d/` and `/edit` in the Sheet URL.
   - `RSVP_ALLOWED_INVITATIONS`: a JSON list of client slugs, e.g. `["gursewak-simran","rohan-meera"]`.
   - `RSVP_SHEET_NAME`: optional, defaults to `RSVPs`.
4. Run `setupRsvpSheet` once and approve the Google prompt. The `RSVPs` tab gets these columns: Timestamp, Invitation ID, Guest Name, Attendance, Guest Count, Message, Submission ID, Fingerprint.
5. **Deploy → New deployment → Web app**. Execute as *Me*; access *Anyone*. Copy the `/exec` URL.

## For every new couple
1. Add their slug to `RSVP_ALLOWED_INVITATIONS` (Project Settings), keeping the JSON valid.
2. In `clients/<slug>/client.json` set:
   ```json
   "rsvp": { "endpoint": "https://script.google.com/macros/s/XXXX/exec", "maxGuests": 4, "invitationId": "<slug>" }
   ```
   `invitationId` defaults to the slug, so you can omit it.
3. Rebuild (`npm run build -- <slug>`), open the card, send one real test RSVP, and confirm the row appears in the Sheet.
4. Filter the Sheet by **Invitation ID** to give each couple only their own rows (a filtered view or a copied tab).

## What the card sends
`invitationId, guestName, attendance (yes|no), guestCount, message, website (honeypot, must be empty), formAgeMs, submissionId`.
The card shows "saved" only when the server answers `{"ok":true,"saved":true}`. Network failures and unexpected replies stay visible as errors and can be retried; a retry reuses the same `submissionId` so nothing is saved twice.

## Limits worth knowing
- The honeypot and form-age checks are basic abuse protection, not a CAPTCHA.
- Leave `rsvp.endpoint` empty for DEMO mode: the form works visually but saves nothing (the build prints a warning so you cannot forget).
- `maxGuests` in the card must not exceed the script's own limit (10).
- After changing `Code.gs`, create a new deployment version.
