'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="hidden md:block mt-auto border-t border-emerald-950 bg-forest-green py-12 px-6 text-emerald-100/90 w-full">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
        {/* Logo & Vision */}
        <div className="space-y-3">
          <span className="font-chido text-xl tracking-wide uppercase text-[#ebdcb9] font-extrabold">
            ZeroRoute
          </span>
          <p className="text-xs text-emerald-200/70 leading-relaxed">
            Empowering families across India to track, compete, and collaboratively reduce carbon
            footprints through local leaderboards and intelligent weekly plans.
          </p>
        </div>

        {/* Product links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#ebdcb9]">Platform</h4>
          <ul className="space-y-1.5 text-xs text-emerald-200/70">
            <li>
              <Link href="/dashboard" className="hover:text-white transition-colors">
                Family Dashboard
              </Link>
            </li>
            <li>
              <Link href="/weekly-plan" className="hover:text-white transition-colors">
                Personalized Weekly Plan
              </Link>
            </li>
            <li>
              <Link href="/leaderboard" className="hover:text-white transition-colors">
                Community Leaderboard
              </Link>
            </li>
            <li>
              <Link href="/badges" className="hover:text-white transition-colors">
                Unlockable Species Badges
              </Link>
            </li>
          </ul>
        </div>

        {/* Resources links */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#ebdcb9]">Resources</h4>
          <ul className="space-y-1.5 text-xs text-emerald-200/70">
            <li>
              <span className="cursor-default">India Grid Emission Factors</span>
            </li>
            <li>
              <span className="cursor-default">Carbon Calculator Methods</span>
            </li>
            <li>
              <span className="cursor-default">Weekly Action Library</span>
            </li>
            <li>
              <span className="cursor-default">Hackathon Documentation</span>
            </li>
          </ul>
        </div>

        {/* Contact & Legals */}
        <div className="space-y-2.5">
          <h4 className="font-bold text-xs uppercase tracking-wider text-[#ebdcb9]">
            Hackathon Info
          </h4>
          <ul className="space-y-1.5 text-xs text-emerald-200/70">
            <li>
              <span>ZeroRoute Project</span>
            </li>
            <li>
              <span>Built with Next.js & Tailwind</span>
            </li>
            <li>
              <span>For the Sustainability Hackathon 2026</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-6xl mx-auto pt-6 border-t border-white/10 text-center text-xs text-emerald-200/40">
        <p>
          © 2026 ZeroRoute. All rights reserved. Supporting clean energy and sustainable lifestyles.
        </p>
      </div>
    </footer>
  );
};
