# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working
with code in this repository.

@AGENTS.md

---

## Repository Overview

Frontend-only Travel Planner app built with Next.js 14 (App Router),
TypeScript, and Tailwind CSS. No backend, no database, no API.
All data is persisted in the browser via localStorage.

---

## Commands

### Development
cd travel-planner
npm install
npm run dev        # http://localhost:3000
npm run build      # production build — must pass before deploying
npm run lint       # TypeScript + ESLint checks

### Deploy to Vercel
cd travel-planner
npx vercel         # preview deploy
npx vercel --prod  # production deploy

---

## Project Structure

travel-planner/
├── app/
│   ├── page.tsx              # Homepage — trip list, stats, filter
│   ├── expenses/page.tsx     # All expenses across trips with filter
│   ├── trip/[id]/page.tsx    # Trip detail — itinerary, budget, notes
│   ├── layout.tsx            # Root layout — includes <Toaster />
│   └── globals.css           # Tailwind base + CSS custom properties
├── components/
│   ├── Navbar.tsx            # Top nav — app name + Create Trip button
│   ├── TripCard.tsx          # Card shown on homepage grid
│   ├── CreateTripModal.tsx   # Modal for create and edit trip (dual mode)
│   └── ConfirmModal.tsx      # Reusable delete confirmation modal
├── hooks/
│   └── useTrips.ts           # Loads, refreshes, deletes trips from localStorage
├── lib/
│   └── types/
│       ├── trip.ts           # Trip interface definition
│       └── index.ts          # Re-exports all types
└── utils/
    └── storage.ts            # All localStorage read/write helpers

---

## Architecture

### Data flow
All data lives in localStorage under the key "trips".
No API calls, no server state, no environment variables needed.

Read  → utils/storage.ts → getTrips() / getTripById()
Write → utils/storage.ts → saveTrips() / updateTrip() / deleteTripById()
State → hooks/useTrips.ts → used in app/page.tsx only

### Trip data structure
interface Trip {
  id: string                         # Date.now().toString()
  name: string
  destination: string
  days: number
  startDate: string                  # ISO date string (YYYY-MM-DD)
  itinerary?: {
    [key: string]: string[]          # day1: [], day2: [], ...
  }
  budget?: {
    total: number
    expenses: {
      name: string
      amount: number
      category: string               # Food | Hotel | Travel | Shopping | Other
    }[]
  }
}

### Pages
/ (homepage)
  - Loads trips via useTrips() hook
  - Stats row: Total Trips, Upcoming, Past, Total Spent (all derived)
  - Filter state: 'all' | 'upcoming' | 'past'
  - Upcoming = startDate > today, Past = startDate <= today
  - Grid of TripCards + CreateTripModal + ConfirmModal

/trip/[id]
  - Loads trip by id via getTripById() in useEffect
  - Three sections: Trip details, Itinerary, Budget
  - Itinerary: State A (none) → State B (view) → State C (edit)
  - Budget: set total, add/edit/delete expenses with categories
  - Edit trip via CreateTripModal in edit mode
  - Delete trip → ConfirmModal → deleteTripById → router.push('/')

/expenses
  - Reads all trips from localStorage on mount
  - Flattens all expenses across all trips into a single array
  - Filter pills: All | Food | Hotel | Travel | Shopping | Other
  - Shows expense count + total for active filter

---

## Key Constraints

- No backend — never suggest API routes, server actions, or databases
- No NEXT_PUBLIC_ env vars — not needed, everything is localStorage
- Always use @/utils/storage for localStorage — never call
  localStorage directly in page or component files
- Always use @/lib/types for the Trip interface — never redefine it
- Always use CSS variables from globals.css for colors — never hardcode
- Always use .card and .btn-primary utility classes from globals.css
- Currency is always Indian Rupee — use ₹ symbol and
  toLocaleString('en-IN') for number formatting
- react-hot-toast is installed — use toast.success() and toast.error()
  for all user feedback
- react-countup is installed — use for animating budget numbers

---

## Design System

CSS custom properties defined in globals.css:

--color-primary         #2563eb   blue-600
--color-primary-hover   #1d4ed8   blue-700
--color-background      #f8fafc   slate-50
--color-surface         #ffffff   white
--color-border          #e2e8f0   slate-200
--color-text-primary    #0f172a   slate-900
--color-text-secondary  #64748b   slate-500
--color-text-muted      #94a3b8   slate-400

Reusable classes:
.btn-primary   blue button with hover state
.card          white card with border, shadow, hover lift
.page-background  slate-50 full height background

---

## CI / CD

Vercel project root is configured to travel-planner/
Every push to master triggers an automatic Vercel production deploy.
Run npm run build locally before pushing — build must pass cleanly.

GitHub repo: https://github.com/tanidutta/travel-planner
Vercel project: https://travel-planner-woad-rho.vercel.app