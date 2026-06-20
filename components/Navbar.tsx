'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';

import { RefreshCw, LogOut, LayoutDashboard, Calendar, Trophy, Award } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { logout } = useAuth();

  const resetAllData = () => {
    if (
      confirm(
        'Are you sure you want to reset all data? This will clear all logs, badges, and profile info.'
      )
    ) {
      localStorage.clear();
      window.location.href = '/onboarding';
    }
  };

  const isActive = (path: string) => pathname === path;

  // Render nothing if we are in onboarding or login
  if (pathname === '/' || pathname === '/onboarding') {
    return null;
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-hairline bg-canvas justify-between py-6 px-4 shrink-0 self-start">
        <div className="space-y-8">
          {/* Logo & Brand */}
          <div className="px-3">
            <Link href="/dashboard" className="flex items-center tracking-tight">
              <span className="font-chido text-2xl md:text-3xl tracking-wide uppercase text-brand-olive font-extrabold">
                ZeroRoute
              </span>
            </Link>
          </div>

          {/* Main Navigation */}
          <nav className="flex flex-col space-y-1">
            <Link
              href="/dashboard"
              className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2.5 ${
                isActive('/dashboard')
                  ? 'bg-surface text-ink font-semibold border-l-2 border-brand-olive'
                  : 'text-steel hover:text-ink hover:bg-surface/50'
              }`}
            >
              <LayoutDashboard
                className={`w-4 h-4 ${isActive('/dashboard') ? 'text-brand-olive' : ''}`}
              />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/weekly-plan"
              className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2.5 ${
                isActive('/weekly-plan')
                  ? 'bg-surface text-ink font-semibold border-l-2 border-brand-olive'
                  : 'text-steel hover:text-ink hover:bg-surface/50'
              }`}
            >
              <Calendar
                className={`w-4 h-4 ${isActive('/weekly-plan') ? 'text-brand-olive' : ''}`}
              />
              <span>Weekly Plan</span>
            </Link>
            <Link
              href="/leaderboard"
              className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2.5 ${
                isActive('/leaderboard')
                  ? 'bg-surface text-ink font-semibold border-l-2 border-brand-olive'
                  : 'text-steel hover:text-ink hover:bg-surface/50'
              }`}
            >
              <Trophy className={`w-4 h-4 ${isActive('/leaderboard') ? 'text-brand-olive' : ''}`} />
              <span>Leaderboard</span>
            </Link>
            <Link
              href="/badges"
              className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors flex items-center gap-2.5 ${
                isActive('/badges')
                  ? 'bg-surface text-ink font-semibold border-l-2 border-brand-olive'
                  : 'text-steel hover:text-ink hover:bg-surface/50'
              }`}
            >
              <Award className={`w-4 h-4 ${isActive('/badges') ? 'text-brand-olive' : ''}`} />
              <span>Badges</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Control & Simulation Panel */}
        <div className="space-y-4 pt-4 border-t border-hairline">
          <div className="flex gap-2">
            <button
              aria-label="Reset all user data"
              onClick={resetAllData}
              title="Reset Database to Default"
              className="flex-1 flex items-center justify-center gap-1.5 p-2 text-xs text-slate hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-hairline font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <Link href="/" className="flex-1">
              <button
                aria-label="Sign out of account"
                onClick={logout}
                title="Sign Out"
                className="w-full flex items-center justify-center gap-1.5 p-2 text-xs text-slate hover:text-ink hover:bg-surface rounded-lg transition-colors border border-hairline font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="flex md:hidden w-full h-16 sticky top-0 border-b border-hairline bg-canvas items-center justify-between px-4 z-40">
        <Link href="/dashboard" className="flex items-center tracking-tight">
          <span className="font-chido text-xl tracking-wide uppercase text-brand-olive font-extrabold">
            ZeroRoute
          </span>
        </Link>

        {/* Small log out button for mobile */}
        <Link href="/">
          <button
            aria-label="Sign out mobile"
            onClick={logout}
            className="p-1.5 text-slate hover:text-ink rounded-lg border border-hairline"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </Link>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-canvas border-t border-hairline z-50 flex items-center justify-around px-2 pb-safe">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/dashboard') ? 'text-brand-olive font-semibold' : 'text-steel hover:text-ink'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px]">Dash</span>
        </Link>
        <Link
          href="/weekly-plan"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/weekly-plan') ? 'text-brand-olive font-semibold' : 'text-steel hover:text-ink'}`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Plan</span>
        </Link>
        <Link
          href="/leaderboard"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/leaderboard') ? 'text-brand-olive font-semibold' : 'text-steel hover:text-ink'}`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px]">Rank</span>
        </Link>
        <Link
          href="/badges"
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive('/badges') ? 'text-brand-olive font-semibold' : 'text-steel hover:text-ink'}`}
        >
          <Award className="w-5 h-5" />
          <span className="text-[10px]">Badges</span>
        </Link>
      </nav>
    </>
  );
};
