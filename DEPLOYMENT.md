# Deployment Guide

This app is a standard **Next.js 16** project and deploys with zero config on **Vercel** (the
recommended host, built by the Next.js team). Everything below assumes the repo is already on
GitHub.

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **New Project** → import `board-game-collection-viewer`.
3. Leave the defaults — Vercel auto-detects Next.js (build `next build`, output `.next`).
4. **Deploy**. The site is live in ~30s, with automatic HTTPS.

After the first import, **every push to `main` auto-deploys**. Pull requests get their own
preview URL.

### Custom domain (optional)

Vercel dashboard → **Settings → Domains** → add your domain and follow the DNS instructions.

## Deployment checks

If your Vercel project has **Deployment Checks** enabled, note:

- **Lint** must pass — run `npm run lint` locally before pushing; a single ESLint error fails
  the deploy.
- **Typecheck** is skipped (there's no separate `typecheck` script); types are still checked as
  part of `next build`.
- **Microfrontends Config Present** only applies to microfrontend apps and can be turned off in
  the project's check settings if it blocks a deploy.

## Local commands

```bash
npm install      # install dependencies
npm run dev      # dev server at http://localhost:3000
npm run lint     # ESLint (must be clean for Vercel)
npm run build    # production build
npm run start    # serve the production build locally
```

## Environment variables

The community library and sample collections are baked in as static data
(see [`lib/community.ts`](lib/community.ts) and [`lib/deedeen-collection.ts`](lib/deedeen-collection.ts)),
so the app runs with **no env vars at all**.

To make **sessions + RSVPs persistent** (the `/session` and `/schedule` pages), add a free
Firebase/Firestore backend (see below). Without it, the app falls back to an in-memory store
that works locally but resets on restart and isn't shared across serverless instances.

## Sessions persistence — free Firebase setup

Firestore's **Spark** plan is free, needs no credit card, and never pauses. Setup takes ~3 minutes:

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Build → Firestore Database → Create database** (start in *test mode*, or use the rules below).
3. **Project settings → General → Your apps → Web app** (`</>`), register an app, and copy the
   config values.
4. Add these to `.env.local` locally (see [`.env.example`](.env.example)) and to your Vercel
   project's **Settings → Environment Variables**:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

   These are **not secrets** — the Firebase web config is meant to be public; access is governed
   by Firestore security rules.

5. Suggested Firestore rules for a small trusted group (only the `sessions` collection is used):

   ```text
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /sessions/{id} {
         allow read, write: if true;
       }
     }
   }
   ```

   > Tighten these later if the site becomes public (e.g. require auth, validate fields).

Redeploy and the app automatically switches from the in-memory store to Firestore — no code change.

> ℹ️ **Why no live BGG calls in production?** BoardGameGeek's XML API now requires authentication
> and returns `401` to anonymous requests. Collections are therefore gathered ahead of time via
> the Playwright scrapers in [`scripts/`](scripts/) (which also pull high-resolution artwork) and
> committed as data. The `/update` and `/[username]` routes still attempt a live BGG fetch and
> fall back to sample data for the `demo` / `Deedeen` usernames. See the README's
> *Refreshing the data* section to regenerate the datasets.

## Other hosts

The app also runs on any Node host that supports Next.js (Netlify, Railway, Render, a container,
etc.) using `npm run build` + `npm run start`. Vercel is simply the lowest-friction option.
