# PulseBoard — SaaS Analytics Dashboard 📊

A multi-tenant SaaS analytics dashboard built in Next.js 14 that lets users analyse GitHub profiles and repository data. First Next.js project in the roadmap — introduces App Router, Server Components, and Supabase authentication.

## Live Demo
[GitHub Repo](https://github.com/Vishal-subudhi/pulseboard)

## Features
- GitHub analytics dashboard — repos, languages, activity stats
- Supabase authentication (sign up, login, logout)
- Protected routes — dashboard only accessible when logged in
- Multi-tenant data isolation via Row Level Security (RLS)
- Server Components for fast, secure data fetching
- Client Components for interactive UI elements
- Dynamic greeting — Good morning / Good afternoon / Good evening based on time
- Zustand for client-side state management
- Responsive dark theme dashboard layout

## Tech Stack
- Next.js 14 (App Router)
- React Server Components
- Supabase (Auth + PostgreSQL database + Row Level Security)
- Zustand (client state)
- Tailwind CSS v3
- GitHub REST API

## Project Structure
```
pulseboard/
  app/
    (auth)/
      login/page.jsx
      signup/page.jsx
    (dashboard)/
      dashboard/page.jsx     ← Server Component
      layout.jsx             ← Protected layout
    layout.jsx               ← Root layout
    page.jsx                 ← Landing page
  components/
    DashboardHeader.jsx      ← Greeting + user info
    StatsGrid.jsx            ← Repo/follower stats
    LanguageChart.jsx        ← Language distribution
    RepoList.jsx             ← Top repositories
  lib/
    supabase.js              ← Supabase client
    github.js                ← GitHub API helpers
  store/
    dashboardStore.js        ← Zustand store
```

## How to run
1. Clone the repo
2. Run `npm install`
3. Create a Supabase project at supabase.com
4. Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
5. Run `npm run dev`

## Key Concepts Used

### Next.js 14 App Router
First project using the App Router. Key mental model shift from React:
- Server Components (default) — fetch data before page reaches browser, no loading spinners
- Client Components ("use client") — useState, useEffect, user interaction
- Server Components can contain Client Components, not the other way around

### Supabase Row Level Security
Each user's data is isolated at the database level:
```sql
CREATE POLICY "Users see only their own data"
ON github_stats
FOR SELECT
USING (auth.uid() = user_id);
```
No extra backend code needed — the database enforces privacy automatically.

### Greeting Feature (added independently)
```jsx
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
```
Small feature, added independently — identified where it belonged in the component tree and wired it in without guidance.

## Server vs Client Component Split
```
DashboardPage (Server)     ← fetches GitHub data server-side
  ├── DashboardHeader (Client)   ← greeting, needs time/interactivity
  ├── StatsGrid (Server)         ← static display, no interaction
  ├── LanguageChart (Client)     ← interactive chart, onClick
  └── RepoList (Server)          ← static list, no interaction
```

## Vibe Coding Notes
This project was built using the vibe coding process:
- Architecture and component structure designed by the developer
- AI generated the boilerplate and wiring
- Developer reviewed every component, asked questions about unfamiliar patterns
- Greeting feature added independently — identified the right location and logic without prompting
- Key learning: understanding Server vs Client component boundaries, not just running the code

## Reflection
**Project:** PulseBoard — SaaS Analytics Dashboard

**Date completed:** 28/06/2026

**What I built:** A SaaS analytics dashboard in Next.js 14 with Supabase auth, GitHub data analysis, protected routes, and Row Level Security

**Main concepts learned:** Next.js 14 App Router, Server Components vs Client Components, Supabase authentication, Row Level Security, multi-tenant data architecture

**What was hardest:** Internalizing the Server vs Client component mental model — which code runs where and why it matters

**What I'd do differently:** Add more analytics features and polish the UI for a more complete SaaS feel

**Feature I added myself:** Dynamic greeting (Good morning/afternoon/evening) based on time of day

**Time taken:** 10 days
