# ZeroRoute — Tech Stack

## Core Framework
- Next.js 14 (App Router, Server Components)
- TypeScript (strict mode)
- React 18

## Styling & UI
- Tailwind CSS
- shadcn/ui (accessible component library)
- Framer Motion (tree growth animations)
- Lucide React (SVG icon set)
- Recharts (SVG-based emission charts)
- next-themes (dark / light mode)

## Google Services

### Authentication
- Google OAuth 2.0 via Firebase Authentication
  Sign in with Google — one-tap family account creation

### Database
- Firebase Firestore
  Stores family profiles, emission logs, weekly plans, badges, leaderboard entries

### Storage
- Firebase Storage
  Stores family avatar images and exported progress report PDFs

### Serverless Functions
- Firebase Cloud Functions
  Runs the weekly plan generator every Monday (scheduled trigger)
  Runs nudge engine checks daily
  Updates neighbourhood leaderboard rankings every Sunday night

### Analytics
- Firebase Analytics + Google Analytics 4
  Tracks feature usage, weekly plan completion rate, badge unlock frequency
  Measures retention — how many families return week 2, 3, 4

### Performance Monitoring
- Firebase Performance Monitoring
  Tracks app load time, Firestore query latency, scoring engine execution time

### Crash Reporting
- Firebase Crashlytics
  Captures runtime errors and unhandled exceptions in production

### Remote Config
- Firebase Remote Config
  Controls suggestion trigger thresholds without a redeploy
  e.g. adjust AC overuse threshold from 6hrs to 5hrs without code change

### Calendar Integration
- Google Calendar API
  Family can add their weekly plan actions directly to Google Calendar
  e.g. "Carpool Wednesday" added as a recurring calendar event with one click

### Email Notifications
- Gmail API via Google Workspace
  Sends weekly progress summary email to the family every Sunday
  Format: total CO₂ this week, goal hit or missed, next week's plan preview, badges earned

### Maps & Location
- Google Maps JavaScript API
  Used during neighbourhood selection in onboarding — visual map picker
- Google Places API
  Autocomplete for city and neighbourhood input during onboarding

### Hosting & Deployment
- Vercel (primary deployment, Vercel + GitHub integration)
- Firebase Hosting (fallback / staging environment)

### Search & Indexing
- Google Search Console
  Connected to the deployed Vercel URL for visibility and crawl monitoring

### AI (optional, no chatbot)
- Google Gemini API (via Vertex AI)
  Used only for generating the reasoning text in weekly plans
  e.g. "Transport was 71% of your emissions — here is why that matters"
  Single API call per weekly plan generation — not a chat interface

## Testing
- Vitest (unit tests for scoring engine, nudge engine, emission calculator)
- React Testing Library (component interaction tests)

## Code Quality
- ESLint (Next.js recommended ruleset)
- Prettier (auto-format on save)
- Husky (pre-commit lint + test gate)
- lint-staged (runs only on changed files)

## CI/CD
- GitHub Actions
  Workflow: lint → test → build → deploy to Vercel on every push to main

## Environment & Security
- .env.example (all keys documented, no secrets committed)
- Firebase Security Rules (Firestore scoped to authenticated family only)
- Next.js middleware.ts (route protection, unauthenticated redirect)

## Developer Tools
- pnpm (fast package manager)
- Turbopack (Next.js dev server, faster HMR)
- TypeScript path aliases (@/components, @/lib, @/types)