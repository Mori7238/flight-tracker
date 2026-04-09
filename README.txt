Flight Alert Tracker - fixed package

What was fixed:
1. Push functions now accept both env name styles:
   - VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
   - PUBLIC_VAPID_KEY / PRIVATE_VAPID_KEY
2. Server code now auto-converts DER private keys that start like MIGH... into the raw format web-push needs.
3. VAPID_SUBJECT is optional now. If you do not set it, the code falls back to:
   mailto:admin@example.com
4. The web page now shows clearer errors if push-public-key or save-subscription fails.
5. A helper file (_vapid.js) was added for all push functions.

Deploy structure:
- index.html
- manifest.json
- sw.js
- icons
- package.json
- netlify.toml
- netlify/functions/*.js

How to redeploy with Netlify Drop:
1. Open the folder flight_alert_fixed.
2. Select everything inside it.
3. Zip those files/folders together.
4. Drag the zip to Netlify Drop, or replace the old site upload.

Netlify env vars needed:
- VAPID_PUBLIC_KEY
- VAPID_PRIVATE_KEY
Optional:
- VAPID_SUBJECT=mailto:you@example.com
