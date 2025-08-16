# Watch2EarnReall – Telegram Mini App (Frontend)

This is a bright, flashy, modern single‑page frontend designed for Telegram WebApps.

## Folders
- `index.html` – main app file (includes Monetag + Telegram SDK)
- `assets/css/styles.css` – styling (neon/glassmorphism)
- `assets/js/app.js` – logic (tabs, check‑in, tasks, referral, profile)

## What you must change
1. Replace `YOUR_BOT_USERNAME` in `assets/js/app.js` with your bot username (e.g., `watch2earnreall_bot`) to generate the referral link:  
   `https://t.me/<bot>?start=ref_<user_id>`.

2. Replace `YOUR_ZONE_ID` in `index.html` and in `assets/js/app.js` (`MONETAG_FN`) with your Monetag `data-zone` id, for example:
   ```html
   <script src="//libtl.com/sdk.js" data-zone="9711117" data-sdk="show_9711117"></script>
   ```
   and in JS:
   ```js
   const MONETAG_FN = "show_9711117";
   ```

3. Connect your backend endpoints for:
   - `/reward/complete` (validate ad completion and credit)
   - `/withdraw` (create withdrawal request)
   - (optional) `/checkin` and `/referrals`

The UI already calls placeholders — just swap with your URLs.

## Deploy
- Any static host works (Vercel, Netlify, GitHub Pages, Railway static, etc.)
- In BotFather, set the WebApp URL in your inline keyboard/button.

Enjoy! ✨
