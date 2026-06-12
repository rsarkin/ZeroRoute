'use client';

import React from 'react';
import { useFamily } from '../../providers/FamilyProvider';
import { getNeighborhoodName } from '../../data/constants';
import { Trophy, HelpCircle, Users, Zap, Award } from 'lucide-react';

export default function LeaderboardPage() {
  const { leaderboard, familyProfile } = useFamily();

  const neighborhoodName = familyProfile 
    ? getNeighborhoodName(familyProfile.neighbourhoodId) 
    : 'Bandra, Mumbai';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Header */}
      <div className="border-b border-hairline pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-deep flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Society Leaderboard</span>
          </h1>
          <p className="text-sm text-slate mt-1">Cohort: {neighborhoodName}</p>
        </div>
        <span className="mt-2 md:mt-0 text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-medium">
          Resets every Monday
        </span>
      </div>

      {/* Intro info box */}
      <div className="p-4 bg-slate-50 border border-hairline rounded-lg flex gap-3 text-xs text-slate-600">
        <HelpCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">How is this calculated?</span>
          <p className="mt-1 leading-relaxed">
            Rankings are determined by the percentage of carbon emissions reduced compared to your family's own baseline. 
            This makes it fair for families of all sizes! Families owning Electric Vehicles receive a 3% bonus. 
            Only the family name is displayed to maintain privacy.
          </p>
        </div>
      </div>

      {/* Top 3 Podium (Visual) */}
      <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 pb-2">
        {leaderboard.slice(0, 3).map((entry, index) => {
          // Determine place styling
          let podiumClass = 'bg-white border-hairline';
          let medalIcon = '🥉';
          let heightClass = 'h-32';
          let textClass = 'text-slate-700';

          if (index === 0) {
            podiumClass = 'bg-amber-50 border-amber-300 ring-2 ring-amber-200';
            medalIcon = '🥇';
            heightClass = 'h-40';
            textClass = 'text-amber-800';
          } else if (index === 1) {
            podiumClass = 'bg-slate-50 border-slate-300';
            medalIcon = '🥈';
            heightClass = 'h-36';
            textClass = 'text-slate-800';
          }

          const isCurrentFamily = familyProfile && entry.familyId === familyProfile.id;

          return (
            <div 
              key={entry.familyId}
              className={`flex flex-col justify-end items-center rounded-xl p-4 border text-center transition-all ${podiumClass} ${heightClass} ${
                isCurrentFamily ? 'border-primary ring-2 ring-primary/20' : ''
              }`}
            >
              <div className="text-2xl mb-1">{medalIcon}</div>
              <div className="font-bold text-sm truncate max-w-full text-slate-900">
                {entry.familyName}
              </div>
              <div className={`text-xs font-bold ${textClass} mt-1`}>
                -{entry.reductionPercent}%
              </div>
              <div className="text-xxs text-slate-400 mt-0.5">
                {entry.co2Saved} kg saved
              </div>
              {entry.hasEvBadge && (
                <span className="text-xxs bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded mt-1.5 font-bold flex items-center gap-0.5">
                  <Zap className="w-3 h-3" /> EV
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <div className="notion-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-hairline text-slate text-xs font-semibold uppercase">
                <th className="py-3 pl-4">Rank</th>
                <th className="py-3">Family</th>
                <th className="py-3 text-center">EV Owner</th>
                <th className="py-3 text-right">CO₂ Saved</th>
                <th className="py-3 text-right">Weekly Reduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline-soft">
              {leaderboard.map((entry, idx) => {
                const isCurrentFamily = familyProfile && entry.familyId === familyProfile.id;
                const rank = idx + 1;

                return (
                  <tr 
                    key={entry.familyId} 
                    className={`hover:bg-slate-50/50 ${
                      isCurrentFamily ? 'bg-primary/5 font-semibold text-primary-deep' : ''
                    }`}
                  >
                    <td className="py-4 pl-4 font-bold text-slate-600">
                      #{rank}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span>{entry.familyName}</span>
                        {isCurrentFamily && (
                          <span className="text-xxs bg-primary text-white px-2 py-0.5 rounded-full font-bold">You</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      {entry.hasEvBadge ? (
                        <span className="inline-flex justify-center">
                          <Zap className="w-4 h-4 text-sky-500 fill-sky-500" />
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="py-4 text-right text-slate-600">
                      {entry.co2Saved} kg
                    </td>
                    <td className="py-4 text-right font-bold text-emerald-600">
                      -{entry.reductionPercent}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
