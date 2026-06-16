# Deployment Guide

This app is a standard **Next.js 16** project and deploys with zero config on **Vercel** (the
recommended host, built by the Next.js team). Everything below assumes the repo is already on
GitHub.

## Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **New Project** → import `board-game-club-hub`.
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
Supabase backend (see below). Without it, the app falls back to an in-memory store that works
locally but resets on restart and isn't shared across serverless instances.

## Sessions persistence — free Supabase setup

Supabase's free tier needs no credit card. Setup takes ~3 minutes:

1. Create a project at [supabase.com](https://supabase.com) (pick a region near your users).
2. Open the **SQL Editor** and run this to create the table:

   ```sql
   create table sessions (
     id uuid primary key default gen_random_uuid(),
     date timestamptz not null,
     description text default '',
     host text not null,
     players jsonb default '[]'::jsonb,
     game jsonb,                         -- legacy single game (kept for old rows)
     games jsonb default '[]'::jsonb,    -- games for the night (a session can have several)
     location text default '',           -- where it's happening (optional)
     rsvps jsonb default '{}'::jsonb,
     created_at timestamptz default now()
   );

   -- Small trusted group: allow anon read/write to sessions only.
   alter table sessions enable row level security;
   create policy "sessions open" on sessions
     for all using (true) with check (true);
   ```

   > The open policy suits a small private group. Tighten it (require auth, validate fields)
   > if the site becomes public.

   **Already created the table earlier?** Add the newer optional columns with:

   ```sql
   alter table sessions add column if not exists games jsonb default '[]'::jsonb;
   alter table sessions add column if not exists location text default '';
   ```

   Until these columns exist the app still works — it just stores a single game and no location.

   For **member collection uploads** (Collection → Add from BGG → save), add this table too:

   ```sql
   create table if not exists member_collections (
     member text not null,
     game_id text not null,
     name text not null,
     year int,
     min_players int default 1,
     max_players int default 1,
     min_playtime int default 0,
     max_playtime int default 0,
     community_rating numeric default 0,
     bgg_rank int,
     thumbnail text default '',
     image text default '',
     updated_at timestamptz default now(),
     primary key (member, game_id)
   );
   alter table member_collections enable row level security;
   create policy "member_collections open" on member_collections for all using (true) with check (true);
   grant all on member_collections to anon, authenticated;
   ```

   Without it, CSV uploads still parse and display — they just can't be saved to the community.

   *(Optional, recommended)* Add this function so RSVPs update **atomically** (no lost writes when
   two people RSVP at the same instant). Without it, the app falls back to a read-modify-write,
   which is fine for low traffic:

   ```sql
   create or replace function set_rsvp(p_id uuid, p_name text, p_status text)
   returns setof sessions language sql as $$
     update sessions
     set rsvps = case
       when p_status = 'clear' then rsvps - p_name
       else rsvps || jsonb_build_object(p_name, p_status)
     end
     where id = p_id
     returning *;
   $$;
   ```

3. In **Project Settings → API**, copy the **Project URL** and the public API key — newer
   projects show a **publishable** key (`sb_publishable_…`); older ones show an **anon** key
   (`eyJ…`). Either works.
4. Add them to `.env.local` locally (see [`.env.example`](.env.example)) and to your Vercel
   project's **Settings → Environment Variables**:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   # older projects: NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (use this instead)
   ```

   This key is safe to expose to the browser by design; access is governed by the RLS policy above.

> ⏰ **Idle pause:** free Supabase projects pause after ~7 days with **no** database activity. The
> [`keep-supabase-awake`](.github/workflows/keep-supabase-awake.yml) Action pings it every few days
> to prevent that — add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as repository secrets to enable it.

Redeploy and the app automatically switches from the in-memory store to Supabase — no code change.

> ℹ️ **Why no live BGG calls in production?** BoardGameGeek's XML API now requires authentication
> and returns `401` to anonymous requests. Collections are therefore gathered ahead of time via
> the Playwright scrapers in [`scripts/`](scripts/) (which also pull high-resolution artwork) and
> committed as data. The `/update` and `/[username]` routes still attempt a live BGG fetch and
> fall back to sample data for the `demo` / `Deedeen` usernames. See the README's
> *Refreshing the data* section to regenerate the datasets.

## Other hosts

The app also runs on any Node host that supports Next.js (Netlify, Railway, Render, a container,
etc.) using `npm run build` + `npm run start`. Vercel is simply the lowest-friction option.
