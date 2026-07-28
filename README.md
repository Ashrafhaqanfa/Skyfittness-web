# Gym Admin Portal — Web (React + Vite)

A web version of the GymApp, built so you can install it on an iPhone for
free via Safari's "Add to Home Screen" — no Apple Developer account needed.

It uses the **same Firebase project and Firestore data** as the native iOS
app (members, payments, categories, plans, admins, attendance, enquiries,
dietPlans, referrals) — nothing needs to be migrated.

## 1. Add your Firebase config

Open `src/firebase.js` and replace the placeholder values with your project's
real config:

Firebase Console → Project Settings (gear icon) → General tab → scroll to
"Your apps" → Web app → SDK setup and configuration → "Config".

```js
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
}
```

If you don't have a Web app registered yet in your Firebase project:
Project Settings → General → "Your apps" → click the `</>` (Web) icon →
follow the prompts (no need to add the Firebase Hosting SDK, just the config).

## 2. Install dependencies and run locally (optional, to test first)

```bash
npm install
npm run dev
```

Open the printed `localhost` URL in your browser to try it out.

## 3. Deploy for free

Push this folder to a GitHub repo, then connect it to **one** of:

- **Vercel** (vercel.com) — "Add New Project" → import the repo → it
  auto-detects Vite → Deploy. Done in about a minute.
- **Netlify** (netlify.com) — "Add new site" → "Import an existing project"
  → pick the repo → Build command: `npm run build`, Publish directory: `dist`
  → Deploy.
- **GitHub Pages** — needs an extra `base` setting in `vite.config.js`
  (`base: '/your-repo-name/'`) since GitHub Pages serves from a subpath;
  Vercel/Netlify are simpler if you'd rather skip that step.

Both Vercel and Netlify give you a free `https://yourapp.vercel.app` (or
similar) URL automatically — that's what you'll open on the iPhone.

## 4. Add to iPhone home screen

1. On your iPhone, open the deployed URL in **Safari** (must be Safari, not
   Chrome — "Add to Home Screen" behaves differently in other browsers)
2. Tap the **Share** button (square with an arrow)
3. Scroll down, tap **Add to Home Screen**
4. It now behaves like a real app: its own icon, opens full-screen with no
   browser address bar

## 5. Firebase security rules

Since this web app talks to Firestore directly from the browser (same as
your iOS app does), make sure your Firestore security rules require
authentication — they likely already do if the iOS app enforces the same
thing. Double check in Firebase Console → Firestore Database → Rules.

## What's real vs. what's a placeholder

- **All data screens (Members, Payments, Attendance, Enquiries, Diet Plans,
  Referrals, Reports) are fully wired to Firestore** — same as the iOS app.
- **Record Payment generates a real PDF receipt automatically**, right after
  saving — same as `ReceiptService.swift` / `RecordPaymentView.swift`.
- **Payments by Date + daily/monthly Balance Sheet PDF downloads** work the
  same as the iOS `PaymentsView.swift` / `ReportsView.swift`.
- **Gym name** used on receipts and the daily balance sheet is a small
  persisted setting (`localStorage`), matching the iOS app's
  `@AppStorage("gymName")` — set it once in Record Payment or Payments, it's
  remembered from then on. The monthly Reports screen has its own separate,
  one-off gym name field, matching the iOS app exactly (that screen doesn't
  use the shared setting there either).
- **"Manage Staff"** calls the same `createStaffAccount` Cloud Function your
  iOS app uses — this one *is* already deployed and working, since it's part
  of the original project.
- **Google Sign-In, SMS, AI Assistant, Subscription, Exercise/Measurement
  libraries, QR check-in, Contact us** are honest "Coming soon" placeholders,
  same as in the iOS app — not faked as working.
- **Avatar / document photo uploads** in Add Member preview locally in the
  browser but aren't persisted anywhere yet (needs Firebase Storage wired up
  as a follow-up).
- There is **no "Send Expiry Reminders Now" button** in this build — that
  was proposed in an earlier chat message but was never actually pasted into
  the real `functions/index.js` or `SettingsView.swift`, so it's correctly
  left out here too, to match your real repo exactly. If you do add
  `sendExpiryRemindersNow` to your Cloud Functions later, ask and it can be
  added back to this web app's More screen in a couple of lines.
