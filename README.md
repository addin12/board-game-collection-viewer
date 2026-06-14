# Board Game Collection Viewer

A public-facing web application for browsing and managing board game collections from [BoardGameGeek](https://boardgamegeek.com).

## Features

✨ **Current (MVP)**

- 🔍 Search any public BoardGameGeek collection by username
- 📊 View detailed collection statistics (total games, plays, ratings)
- 🎮 Filter by player count and play time
- 📈 Sort by BGG rank, community rating, your rating, times played, and more
- 🌙 Beautiful dark gaming aesthetic UI
- ⚡ Fast client-side filtering and sorting
- 📱 Fully responsive (mobile, tablet, desktop)
- 🔄 Automatic retry on network errors
- 🎪 Demo mode for testing UI

🚀 **Upcoming**

- 👥 User accounts and authentication
- 🗓️ Create and manage play sessions
- 📱 RSVP system for group play events
- 💬 WhatsApp notifications to play groups
- 💾 Sync your real BGG collection to database

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Try the demo:** Enter `demo` as the username to see sample data.

### Build for Production

```bash
npm run build
npm run start
```

## Free Hosting

Choose one (all free tier):

1. **Vercel** (Recommended) — Deploy in 2 minutes
   - Go to [vercel.com](https://vercel.com) → Import GitHub repo → Deploy
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed steps

2. **Netlify** — Alternative with similar features
3. **Railway** — Great for future database needs
4. **Render** — Simple and straightforward

👉 See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment guide and instructions.

## Project Structure

```text
app/                          # Next.js app router
├── page.tsx                 # Landing page with search
├── [username]/
│   ├── page.tsx            # Collection view
│   ├── loading.tsx         # Loading skeleton
│   └── error.tsx           # Error boundary
└── api/
    └── collection/[username]/route.ts  # API endpoint

components/                   # React components
├── SearchForm.tsx           # Homepage search
├── GameGrid.tsx            # Collection grid with filters
├── FilterBar.tsx           # Filter controls
├── GameCard.tsx            # Individual game card
├── CollectionStats.tsx     # Stats summary

lib/                         # Utilities and APIs
├── bgg.ts                  # BoardGameGeek API client
├── types.ts                # TypeScript interfaces
└── utils.ts                # Helper functions
```

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **APIs:** BoardGameGeek XML API
- **Hosting:** Vercel (free tier)
- **Database:** (future) Supabase PostgreSQL
- **Notifications:** (future) Twilio WhatsApp

## Development

### Running Tests

```bash
npm run lint          # Run ESLint
npm run build         # Build for production
```

### Environment Variables (Optional)

For future phases, create `.env.local`:

```env
# Supabase (Phase 2)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Twilio WhatsApp (Phase 3)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
```

## Known Limitations

- **BGG Authentication:** BoardGameGeek API recently added Bearer token requirement. **Workaround:** Use the `demo` username to test the app with sample data.
- **Rate Limiting:** BGG API may be slow during peak hours. The app includes automatic retry logic.

## Performance

- ⚡ First page load: ~1-2 seconds
- 🔄 Collection load: 2-5 seconds (BGG API dependent)
- 🎯 Filters: Instant (client-side)
- 📦 Bundle size: ~150KB (Next.js optimized)

## Roadmap

- [ ] Phase 1: Collection viewer (MVP) ✅ **Done**
- [ ] Phase 2: Session scheduling + user accounts
- [ ] Phase 3: WhatsApp/Email notifications
- [ ] Phase 4: Collection sync to database
- [ ] Phase 5: Social features (groups, shared sessions)

## Contributing

Found a bug or have a suggestion? Open an issue or pull request!

## License

MIT — Feel free to use this project for learning or as a template for your own collection manager.

## Resources

- [BoardGameGeek](https://boardgamegeek.com) — The source of all board game data
- [BGG XML API](https://boardgamegeek.com/wiki/page/BGG_XML_API2) — API documentation
- [Next.js Docs](https://nextjs.org/docs) — Framework documentation
- [Vercel Deployment](https://vercel.com/docs) — Deployment guide
