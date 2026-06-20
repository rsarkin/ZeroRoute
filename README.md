# 🌳 ZeroRoute

> **Family Carbon Intelligence Platform** 
> *Making carbon reduction a shared family goal, not an individual chore.*

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?style=for-the-badge&logo=vitest)

## 🌍 The Problem
Indian families have no simple way to understand, track, or reduce their household carbon footprint together. Existing apps are built for individuals, use Western emission factors irrelevant to India's grid and travel habits, and lack a social accountability layer. 

## 💡 The Solution
ZeroRoute provides three things no existing open-source carbon app provides together:
1. **👨‍👩‍👧‍👦 Family-level tracking:** One account, multiple member profiles, shared emissions dashboard.
2. **🇮🇳 India-specific calculation engine:** Accurate factors for grid intensity (0.82 kg CO₂/kWh), CNG, school buses, LPG cylinders, and EVs.
3. **🧠 Smart decision engine:** Analyzes the last week's data, identifies emission hotspots, and auto-generates a weekly plan with one actionable goal per family member.

---

## ✨ Core Features

### 🪴 The Virtual Forest
As your family reduces its footprint, watch your virtual forest grow! 
- **Main Family Tree:** Grows through 5 visual stages (Baseline → Seedling → Sapling → Young Tree → Full Tree → Flowering Tree).
- **Milestone Forest:** Earn badges for sustainable actions, and plant a new tree beside the main one. (EV trips even earn electric blue trees! ⚡)

### 📊 Smart Weekly Plans & Nudges
- **Scoring Engine:** Analyzes your family's emissions, finds the biggest hotspot, and assigns achievable tasks based on feasibility and impact.
- **Contextual Nudges:** Getting high electricity bills? ZeroRoute will suggest switching to LED bulbs or adjusting your AC temperature. 

### 🏆 Society Leaderboards
- Compete with other families in your neighborhood or city!
- Ranked by **% reduction from your personal baseline**, making it fair for households of any size.
- Privacy-first: Only your family name is displayed.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **Backend & Auth:** [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **Testing:** [Vitest](https://vitest.dev/)
- **Charts:** [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

First, clone the repository and install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Copy the example environment variables and add your Firebase credentials:
```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 📂 Folder Structure

```text
├── app/               # Next.js App Router pages and layouts
├── components/        # Reusable UI components
├── hooks/             # Custom React hooks
├── lib/               # Core intelligence (scoringEngine, nudgeEngine)
├── data/              # Constants (India emission factors, badges)
├── types/             # TypeScript interfaces and models
├── providers/         # Global state providers (Family, Auth)
└── tests/             # Vitest unit tests
```

---

## 🧪 Testing

We use Vitest to ensure our core logic (scoring and nudge engines) is bulletproof.

```bash
npm run test
```

---

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
