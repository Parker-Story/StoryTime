# StoryTime

A social TV tracking app. Log shows you're watching, rate episodes, write reviews, and follow what your friends are watching.

**[storytime.app](https://storytime.app)** — sign up and start tracking.

---

## What it does

- Track shows by status: Watching, Finished, Want to Watch, or Dropped
- Rate shows and write reviews (with optional spoiler tagging)
- Mark individual episodes as watched with per-episode ratings and notes
- See what your friends are watching and what they thought
- Friend reviews are surfaced first on each show's page
- Discover new shows through trending, top rated, and currently airing sections

## Stack

**Frontend**
- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/) — CSS-native theming via custom properties
- [shadcn/ui](https://ui.shadcn.com/) components built on [@base-ui/react](https://base-ui.com/)
- [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode with system preference default

**Backend**
- [Supabase](https://supabase.com/) — PostgreSQL database, auth, and file storage
- Row-level security policies on every table
- Next.js Server Actions for all mutations — no separate API layer

**Data**
- [TMDB API](https://developer.themoviedb.org/) for show metadata, posters, and episode info
- Show data is cached in the database on first access and refreshed periodically

**Deployment**
- [Vercel](https://vercel.com/)

## Why this stack

Next.js App Router lets data fetching live right next to the components that need it, and Server Components mean most pages ship no client JS by default. Supabase handles auth and the database together without needing a separate backend. Tailwind v4's CSS-first approach makes theming clean — the whole palette is a handful of CSS custom properties that swap between light and dark mode. TMDB has a solid free tier and good TV coverage.

## Running locally

```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and TMDB_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
