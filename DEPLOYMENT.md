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

None are required — the community library and sample collections are baked in as static data
(see [`lib/community.ts`](lib/community.ts) and [`lib/deedeen-collection.ts`](lib/deedeen-collection.ts)).

> ℹ️ **Why no live BGG calls in production?** BoardGameGeek's XML API now requires authentication
> and returns `401` to anonymous requests. Collections are therefore gathered ahead of time via
> the Playwright scrapers in [`scripts/`](scripts/) (which also pull high-resolution artwork) and
> committed as data. The `/update` and `/[username]` routes still attempt a live BGG fetch and
> fall back to sample data for the `demo` / `Deedeen` usernames. See the README's
> *Refreshing the data* section to regenerate the datasets.

## Other hosts

The app also runs on any Node host that supports Next.js (Netlify, Railway, Render, a container,
etc.) using `npm run build` + `npm run start`. Vercel is simply the lowest-friction option.
