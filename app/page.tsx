'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';
import { TreePine, Zap, Users, Trophy, Leaf, Sprout } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      router.push('/onboarding');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-sand">
      {/* Top Banner */}
      <div className="bg-[#ebdcb9]/30 border-b border-[#e5e3df] text-[#1a1a1a] text-center py-2 px-4 text-xs font-semibold flex items-center justify-center gap-1.5">
        <Leaf className="w-3.5 h-3.5 text-brand-olive animate-pulse" />
        <span>
          Welcome to ZeroRoute — A Family Carbon Intelligence Platform for Sustainable Lifestyles
        </span>
      </div>

      {/* Header */}
      <header className="w-full bg-forest-green border-b border-emerald-950 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center tracking-tight">
          <span className="font-chido text-2xl md:text-3xl tracking-wide uppercase text-[#ebdcb9] font-extrabold">
            ZeroRoute
          </span>
        </div>
        <button
          onClick={handleLogin}
          className="notion-btn-secondary-on-dark text-sm font-medium py-1.5 px-4 border-[#ebdcb9]/30 hover:border-[#ebdcb9] text-[#ebdcb9] hover:bg-emerald-950/50 transition-colors"
        >
          Sign In
        </button>
      </header>

      {/* Hero Section */}
      <section className="bg-brand-navy text-white text-center py-20 px-6 relative overflow-hidden flex flex-col items-center">
        {/* Decorative background grid and shapes */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

        {/* Floating circles representing "sticky notes" style dots */}
        <div
          className="absolute top-10 left-12 w-4 h-4 bg-brand-pink rounded-full blur-xs opacity-60 animate-bounce"
          style={{ animationDuration: '4s' }}
        />
        <div
          className="absolute bottom-16 right-20 w-6 h-6 bg-brand-yellow rounded-full blur-xs opacity-60 animate-bounce"
          style={{ animationDuration: '6s' }}
        />
        <div
          className="absolute top-20 right-1/4 w-3 h-3 bg-brand-teal rounded-full blur-xs opacity-60 animate-bounce"
          style={{ animationDuration: '5s' }}
        />

        <div className="max-w-3xl z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-purple-300/20 text-brand-purple-300 border border-brand-purple-300/30">
            <TreePine className="w-3.5 h-3.5 text-brand-purple-300" />
            <span>Empowering Indian Families to Reduce Carbon</span>
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white max-w-2xl">
            Grow your family forest,{' '}
            <span className="text-brand-purple-300">cut your footprint.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            ZeroRoute makes carbon tracking a collaborative game tailored for India. Log home energy
            (like LPG cylinders or summer AC usage) and transport (CNG autos, local trains),
            discover personalized weekly action plans, and compete in local city leaderboards. Get
            tailored recommendations like upgrading to BEE 5-star ACs to beat the Indian summer heat
            efficiently.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <button
              onClick={handleLogin}
              className="notion-btn-primary text-base font-semibold px-8 py-3 bg-primary hover:bg-primary-pressed shadow-md"
            >
              Get Started
            </button>
            <a
              href="#learn-more"
              className="notion-btn-secondary-on-dark text-base font-semibold px-8 py-3"
            >
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* Feature section */}
      <main id="learn-more" className="max-w-6xl mx-auto py-16 px-6 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-ink-deep">
            Three pillars of carbon reduction
          </h2>
          <p className="text-slate text-sm">
            Tackling climate change begins at home. We support your family with custom tools
            tailored for the Indian household context.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="p-6 border border-hairline rounded-xl bg-card-tint-peach flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink-deep">Family-Level Tracking</h3>
              <p className="text-sm text-slate leading-relaxed">
                One account, multiple profiles. Let everyone from kids to grandparents participate
                by logging commutes, school bus rides, and AC usage.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-6 border border-hairline rounded-xl bg-card-tint-mint flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-brand-green/10 text-brand-green flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink-deep">India-Specific Calculations</h3>
              <p className="text-sm text-slate leading-relaxed">
                Calibrated for the Indian context, using exact emission factors for India's
                coal-heavy grid, CNG autos, metro train transits, and LPG cylinders.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-6 border border-hairline rounded-xl bg-card-tint-lavender flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-ink-deep">Smart Decision Engine</h3>
              <p className="text-sm text-slate leading-relaxed">
                Automatically analyzes last week's data to flag emission hotspots. Generates
                personalized weekly micro-actions and offers actionable, real-time nudges.
              </p>
            </div>
          </div>
        </div>

        {/* Visual Showcase (Mockup) */}
        <div className="border border-hairline bg-card-tint-sky rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-xs">
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold text-ink-deep">Grows a Living Forest</h3>
            <p className="text-sm text-slate leading-relaxed">
              Your dashboard features an interactive virtual forest. As your family meets
              carbon-saving targets, the central tree grows. Earning badges unlocks unique new tree
              species to expand your forest canopy.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs bg-emerald-100 text-emerald-800 font-semibold px-3 py-1 rounded-full">
                <Sprout className="w-3.5 h-3.5" />
                <span>12 Unlockable Badges</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-sky-100 text-sky-800 font-semibold px-3 py-1 rounded-full">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Electric Blue EV Trees</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-100 text-amber-800 font-semibold px-3 py-1 rounded-full">
                <Trophy className="w-3.5 h-3.5 fill-current" />
                <span>Golden Leaderboard Trees</span>
              </span>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md h-64 bg-white border border-hairline rounded-xl shadow-md overflow-hidden flex items-center justify-center relative">
            {/* Simple representation of the forest */}
            <div className="absolute inset-0 bg-linear-to-b from-sky-50 to-green-50 opacity-80" />
            <div className="hover:scale-110 transition-transform duration-300 cursor-pointer">
              <TreePine className="w-16 h-16 text-brand-green filter drop-shadow-sm" />
            </div>
            <div className="absolute bottom-4 left-4 text-xs font-mono text-slate-400">
              Preview: Forest Level 4
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
