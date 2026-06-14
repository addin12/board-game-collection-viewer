# Quick Start Guide

## 🎮 Test the App Right Now

The dev server is already running on `http://localhost:3000`

**Enter this username to see it working:** `demo`

This will show you 3 sample board games with full functionality.

## 🧪 Try the Features

1. **View Collection Stats**
   - Total games, play count, ratings
   - Most played game
   - Your average rating

2. **Filter & Sort**
   - Filter by minimum player count (1-8)
   - Filter by maximum play time (30-300 min)
   - Sort by: Rank, Name, Rating, Plays, Play Time
   - Clear filters button

3. **Game Cards**
   - BGG rank with badge
   - Community rating (yellow stars)
   - Your personal rating (blue stars)
   - Times you've played
   - Player counts and play time

## 🚀 Deploy to the Web (Free)

### Option 1: Vercel (2 minutes)

**Easiest option!**

1. Push to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/board-game-collection-viewer.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" → Select your repo → Deploy
4. Done! Your site is live 🎉

### Option 2: Netlify

1. Push to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com) → "New site from Git"
3. Connect your repo → Deploy
4. Done!

For more details, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔧 Development

### Run locally
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm run start
```

### Run linter
```bash
npm run lint
```

## 📁 Project Structure

```
app/                          # Pages & routes
├── page.tsx                 # Landing page
└── [username]/
    ├── page.tsx            # Collection page
    ├── loading.tsx         # Loading UI
    └── error.tsx           # Error handling

components/                   # React components
├── SearchForm.tsx           # Search input
├── GameGrid.tsx            # Games grid
├── FilterBar.tsx           # Filters
└── GameCard.tsx            # Game card

lib/                         # Utilities
├── bgg.ts                  # BGG API
├── types.ts                # Types
└── utils.ts                # Helpers
```

## 🎯 What's Next?

### Phase 2: Add Sessions (Users can create play sessions)
- User accounts with Supabase
- Create/join game sessions
- See who's attending

### Phase 3: Notifications (Send WhatsApp invites)
- Twilio integration
- Send session invites via WhatsApp
- RSVP tracking

### Phase 4: Real BGG Data (Use your actual collection)
- Sync with your BGG profile
- Store in database
- Faster loading

## ⚠️ Known Issue

BGG API now requires Bearer authentication. **Workaround:** Use the `demo` username to test the UI. Real BGG data will work once authentication is added (Phase 2).

## 🆘 Need Help?

1. **App won't start?**
   ```bash
   npm install
   npm run dev
   ```

2. **Deploy issues?**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Check your GitHub/Vercel account

3. **Want to use real BGG data?**
   - See [DEPLOYMENT.md](./DEPLOYMENT.md) section on BGG Authentication

## 📚 Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Vercel](https://vercel.com)
- [BoardGameGeek](https://boardgamegeek.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Ready to deploy?** Follow the Vercel steps above — it takes less than 2 minutes! 🚀
