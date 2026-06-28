# PulseBoard — SaaS Analytics Dashboard 📊

A multi-tenant SaaS analytics dashboard built in Next.js 14 with Supabase authentication. Users log in, connect their GitHub, and view analytics about their repositories and activity in a clean dashboard UI.

## Live Demo
[GitHub Repo](https://github.com/Vishal-subudhi/pulseboard)

## Features
- Supabase authentication — sign up, log in, log out
- Protected dashboard — only accessible when logged in
- GitHub analytics — total repos connected, activity overview
- Dynamic greeting — Good morning / Good afternoon / Good evening based on time of day
- Multi-tenant data isolation via Supabase Row Level Security
- Server Components for fast initial page loads
- Dark theme responsive dashboard layout

## Tech Stack
- Next.js 14 (App Router)
- React Server Components
- Supabase (Auth + PostgreSQL + Row Level Security)
- Zustand (client-side state)
- Tailwind CSS v3

## How to run
1. Clone the repo
2. Run `npm install`
3. Create a Supabase project at supabase.com
4. Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
5. Run `npm run dev`

## Key Concepts Used

### Next.js 14 App Router
First project using Next.js — biggest learning was the Server vs Client split:
- Server Components (default) — fetch data before reaching the browser, no loading spinners
- Client Components ("use client") — useState, useEffect, user interaction
- Protected routes using Next.js middleware and Supabase session

### Supabase Row Level Security
Each user only sees their own data — enforced at the database level:
```sql
CREATE POLICY "Users see only their own data"
ON user_stats
FOR SELECT
USING (auth.uid() = user_id);
```

### Greeting Feature (added independently)
```jsx
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}
```
Small feature added without guidance — identified the right component and wired it in independently.

## Vibe Coding Notes
Built using the vibe coding process — architecture designed by the developer, boilerplate AI-generated, developer reviewed every component and made all product decisions. The greeting feature was added entirely independently.

## Reflection
**Project:** PulseBoard — SaaS Analytics Dashboard

**Date completed:** 28/06/2026

**What I built:** A SaaS analytics dashboard with Supabase login, protected routes, GitHub repo analytics, and a time-based greeting

**Main concepts learned:** Next.js 14 App Router, Server vs Client Components, Supabase authentication, Row Level Security, protected routing

**What was hardest:** Understanding the Server vs Client component mental model — which code runs where and why

**What I'd do differently:** Add more detailed analytics and a richer dashboard with charts

**Feature I added myself:** Dynamic greeting based on time of day

**Time taken:** 10 days
