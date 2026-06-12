# PRD — ZeroRoute: Family Carbon Intelligence Platform

## 1. Overview

**Product Name:** ZeroRoute
**Version:** 1.0
**Vertical:** Individual Lifestyle & Habits
**Persona:** Sustainability-conscious Indian family
**Submission Type:** Hackathon — AI-evaluated + judge-reviewed

ZeroRoute is a family carbon intelligence platform that tracks shared home energy and transport emissions, grows a visual forest as the family reduces its footprint, and delivers a smart weekly action plan with contextual suggestions — making carbon reduction a shared family goal rather than an individual chore.

---

## 2. Problem Statement

Indian families have no simple way to understand, track, or reduce their household carbon footprint together. Existing apps are:

- Built for individuals, not households
- Using Western emission factors irrelevant to India's coal-heavy grid and local travel habits
- Giving generic tips with no connection to the user's actual data
- Lacking any social or family accountability layer

The result: families remain unaware of their emissions and have no actionable, personalised path to reduce them.

---

## 3. Solution

ZeroRoute provides three things no existing open-source carbon app provides together:

1. Family-level tracking — one account, multiple member profiles, shared emissions dashboard
2. India-specific calculation engine — 0.82 kg CO₂/kWh grid intensity, CNG, school bus, LPG cylinder, EV near-zero factor
3. Smart decision engine — analyses last week's data, identifies the emission hotspot, auto-generates a weekly plan with one action per family member and contextual suggestions based on actual patterns

---

## 4. Target Users

**Primary:** Indian families (3–5 members) living in urban or semi-urban areas who are aware of climate change and want to take action but do not know where to start.

**Key personas:**
- Hrushikesh (42, father) — drives to work daily, manages electricity bill
- Nakshatra (39, mother) — manages home, handles school runs
- Shreyas (16, son) — takes bus or car to school, wants to earn badges
- Anika (11, daughter) — observes family progress, unlocks milestone trees

---

## 5. Core Features

### Module 1: Family Onboarding
- Create family household with display name
- Add member profiles: name, age group (child / teen / adult)
- Register family vehicles: petrol / diesel / CNG / EV (EV gets ⚡ badge)
- Select city and neighbourhood (used for leaderboard cohort)
- Set reduction goal: 10%, 20%, or 30% below baseline over 4 weeks

### Module 2: Activity Logging
- Energy log: monthly electricity bill (₹ or kWh), AC hours per day, LPG cylinders used
- Trip log: mode (car with fuel type, EV, school bus, auto, metro, walk), distance in km
- School run toggle for recurring daily entries
- EV trips logged at near-zero emission factor (grid-charged)
- Recurring entry option: "same as last month / last trip"

### Module 3: Forest Dashboard
- Main family tree: SVG tree that grows through 5 visual stages as emissions reduce
  - Baseline → seedling
  - 5% reduction → sapling
  - 15% reduction → young tree
  - 25% reduction → full tree
  - Goal hit → flowering tree
- Milestone forest: every badge earned plants a new tree beside the main one
  - EV trip trees rendered in electric blue
  - Society rank #1 earns a golden tree
- Dashboard stats panel alongside forest:
  - Weekly CO₂ total with impact equivalent (e.g. "= driving Mumbai to Pune 3 times")
  - Progress ring toward weekly goal
  - This week vs last week comparison
  - Hotspot category card with plain-language reasoning
  - One contextual nudge card at a time

### Module 4: Weekly Plan + Smart Suggestions
- Auto-generated every Monday by the scoring engine
- Scoring engine logic: impact score × feasibility score × family profile weight
- Output: one shared family goal + one micro-action per member
- Plan explains its reasoning: "Transport was 71% of your emissions last week. Focus: reduce car trips."
- Contextual suggestions surfaced based on emission patterns:
  - Indoor plants → triggered when home energy is consistent hotspot
  - Switch to LED → triggered when electricity bill above ₹2,000/month
  - AC at 24°C → triggered when AC hours logged above 6/day
  - School bus 3 days → triggered when school run by car logged repeatedly
  - Carpool Wednesday → triggered when solo car commute is daily pattern
  - Unplug standby devices → triggered when electricity usage is persistent hotspot
- Each suggestion has a "Mark as done" button — completing it unlocks a badge

### Module 5: Society Leaderboard
- Families grouped by city / neighbourhood cohort
- Ranked by % reduction from personal baseline — fair across all household sizes
- EV badge (⚡) shown beside family name for EV-owning households
- EV trips earn a small bonus multiplier on reduction score
- Weekly top 3 families shown with reduction %, kg saved, and badges earned
- Privacy-first: displayed as family name only, no address or personal data
- Resets every Monday aligned with weekly plan cycle

### Module 6: Achievement Badges (12 total)
Each badge earned also plants a new tree in the family forest.

- 🌱 First Log — logged first activity
- 🎯 Goal Getter — hit weekly goal for the first time
- 🔥 On a Roll — 3-week goal streak
- ⚡ EV Pioneer — logged 5 EV trips
- 🚌 Bus Champion — school bus used 3× in one week
- ❄️ Cool It — AC under 4 hrs/day for a full week
- 🌿 Green Home — energy below target for 4 consecutive weeks
- 🏆 Society Topper — ranked #1 on neighbourhood leaderboard
- 🌳 Forest Keeper — 5 trees planted in family forest
- 💡 Bright Idea — completed the LED switch suggestion
- 🪴 Plant Parent — marked indoor plant suggestion as done
- 👨‍👩‍👧‍👦 Full Team — all members logged at least one activity in one week

---

## 6. Intelligence Layer

### Scoring Engine (lib/scoringEngine.ts)
Pure TypeScript function. No UI dependencies. Fully unit-tested with Vitest.

Inputs: array of EmissionLog entries for the past 7 days, FamilyProfile
Process:
  1. Aggregate CO₂ by category (energy vs transport)
  2. Identify hotspot (highest % contributor)
  3. Filter action library by feasibility (based on family vehicle type, member age groups)
  4. Score each action: impactScore × feasibilityScore
  5. Assign top action per member role
  6. Return WeeklyPlan object with goal, member actions, reasoning string

### Nudge Engine (lib/nudgeEngine.ts)
Pure TypeScript. Evaluates trigger rules against latest logs. Returns at most one NudgeAlert at a time.

Trigger rules:
  - Bill spike: current month electricity > last month by 20%+
  - AC overuse: AC hours logged > 6/day average this week
  - Goal at risk: by Wednesday, progress is below 40% of weekly target
  - Streak broken: weekly goal was hit last week but not on track this week

### India Emission Constants (data/constants.ts)
  - Grid intensity: 0.82 kg CO₂/kWh
  - Petrol car: 0.21 kg CO₂/km
  - Diesel car: 0.17 kg CO₂/km
  - CNG car: 0.11 kg CO₂/km
  - EV (grid-charged): 0.025 kg CO₂/km
  - School bus: 0.04 kg CO₂/km per passenger
  - Auto-rickshaw (CNG): 0.08 kg CO₂/km
  - Metro/local train: 0.03 kg CO₂/km
  - LPG cylinder: 11.5 kg CO₂/cylinder

---

## 7. TypeScript Data Models

FamilyProfile:
  - id, name, neighbourhoodId, cityId, goalPercent, createdAt

FamilyMember:
  - id, familyId, name, ageGroup (child | teen | adult), role

Vehicle:
  - id, familyId, type (petrol | diesel | cng | ev), label, hasEvBadge

EmissionLog:
  - id, familyId, memberId, category (energy | transport), subType, value, unit, co2Kg, date

WeeklyPlan:
  - id, familyId, weekStart, sharedGoal, memberActions[], hotspotCategory, reasoningText, suggestions[]

NudgeAlert:
  - id, familyId, type, message, triggeredAt, dismissed

Badge:
  - id, familyId, badgeKey, earnedAt, treeUnlocked

LeaderboardEntry:
  - familyId, familyName, neighbourhoodId, reductionPercent, co2Saved, badges[], hasEvBadge, weekRank

---

## 8. App Screen Flow

Login → Family Onboarding → Forest Dashboard → Weekly Plan → Log Activity → Progress Chart → Society Leaderboard → Badges

---

## 9. Folder Structure

/app               → Next.js App Router pages and layouts
/components        → UI components (one responsibility per file)
/hooks             → Custom React hooks (useEmissionLogger, useFamilyScore, useWeeklyPlan)
/lib               → scoringEngine.ts, nudgeEngine.ts, emissionCalculator.ts
/data              → constants.ts (India emission factors), actionLibrary.ts, badgeDefinitions.ts
/types             → All TypeScript interfaces
/providers         → FamilyProvider, AuthProvider
/tests             → Vitest unit tests for scoring engine, nudge engine, calculator
/public            → SVG assets (tree stages, badge icons)
middleware.ts      → Route protection via Firebase Auth
README.md          → Project overview, setup, features, India-specific rationale
AGENT.md           → AI agent instructions, persona context, decision logic rules
PRD.md             → This document
.env.example       → Placeholder environment variables
.github/workflows  → ci.yml (lint + test on push)

---

## 10. Evaluation Criteria Alignment

Code Quality:
  Strict TypeScript throughout. ESLint + Prettier enforced via Husky. Single-responsibility components. All logic in lib/ and hooks/, never in JSX. Clean folder structure with one purpose per directory.

Security:
  Firebase Auth with Google sign-in. Route protection in middleware.ts. No secrets committed — .env.example provided. CI/CD runs on every push. Firestore rules scoped to authenticated family members only.

Efficiency:
  Server components used for all data-fetching routes. Client components only where interactivity is required. co2.js pattern for emission calculations (no redundant computation). Recharts renders SVG — no canvas overhead.

Testing:
  Vitest unit tests for scoringEngine.ts and nudgeEngine.ts covering: normal week, no logs edge case, single member family, all categories equal, EV-only transport week, goal already met.

Accessibility:
  shadcn/ui components with ARIA labels built in. Keyboard navigation on all interactive elements. Colour contrast compliant. Dark and light mode via next-themes. SVG trees with descriptive aria-label attributes.

---

## 11. Success Metrics

- Family logs at least one activity per week for 4 consecutive weeks
- Weekly plan completion rate above 60%
- At least one badge earned per family in first two weeks
- Society leaderboard has at least 3 families in the same neighbourhood cohort
- Evaluation score target: 97%+

---

## 12. Out of Scope (v1.0)

- Food and shopping emission categories
- AI chatbot or LLM integration
- Carbon offset marketplace
- Push notifications (web nudges only)
- Multi-language support
- Native mobile app