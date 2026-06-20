'use client';

import { useFamily } from '../../providers/FamilyProvider';
import { getNeighborhoodName } from '../../data/constants';
import { Trophy, HelpCircle, Zap } from 'lucide-react';

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
            Rankings are determined by the percentage of carbon emissions reduced compared to your
            family's own baseline. This makes it fair for families of all sizes! Families owning
            Electric Vehicles receive a 3% bonus. Only the family name is displayed to maintain
            privacy.
          </p>
        </div>
      </div>

      {/* Top 3 Podium (Visual) */}
      <div className="flex items-end justify-center gap-2 md:gap-4 max-w-2xl mx-auto pt-8 pb-4 px-2 border-b-4 border-slate-200 rounded-b-sm">
        {(() => {
          const top3 = leaderboard.slice(0, 3);
          const podiumOrder = [];
          if (top3[1]) podiumOrder.push({ ...top3[1], originalIndex: 1 }); // 2nd Place
          if (top3[0]) podiumOrder.push({ ...top3[0], originalIndex: 0 }); // 1st Place
          if (top3[2]) podiumOrder.push({ ...top3[2], originalIndex: 2 }); // 3rd Place

          return podiumOrder.map((entry) => {
            const index = entry.originalIndex;
            let podiumClass = 'bg-orange-50/30 border-orange-200 shadow-sm';
            let medalIcon = '🥉';
            let heightClass = 'h-36 md:h-40';
            let textClass = 'text-orange-900';
            let badgeClass = 'bg-orange-100 text-orange-800 border-orange-200';

            if (index === 0) {
              podiumClass =
                'bg-gradient-to-b from-amber-50 to-amber-100/40 border-amber-300 shadow-md z-10 ring-1 ring-amber-200';
              medalIcon = '🥇';
              heightClass = 'h-40 md:h-48';
              textClass = 'text-amber-900';
              badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            } else if (index === 1) {
              podiumClass = 'bg-slate-50 border-slate-300 shadow-sm';
              medalIcon = '🥈';
              heightClass = 'h-36 md:h-40';
              textClass = 'text-slate-800';
              badgeClass = 'bg-slate-200 text-slate-700 border-slate-300';
            }

            const isCurrentFamily = familyProfile && entry.familyId === familyProfile.id;

            return (
              <div
                key={entry.familyId}
                className={`flex-1 flex flex-col justify-end items-center rounded-t-xl p-2 md:p-4 border border-b-0 text-center transition-all ${podiumClass} ${heightClass} ${
                  isCurrentFamily ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : ''
                }`}
              >
                <div className="text-3xl md:text-4xl mb-1 md:mb-2 drop-shadow-sm filter">
                  {medalIcon}
                </div>
                <div className="font-extrabold text-xs md:text-sm truncate w-full text-slate-900 px-1">
                  {entry.familyName}
                </div>
                <div
                  className={`text-xs md:text-sm font-black ${textClass} mt-1 md:mt-1.5 bg-white/70 px-2 py-0.5 rounded-full shadow-xs`}
                >
                  -{entry.reductionPercent}%
                </div>
                <div className="text-[10px] md:text-xs text-slate-500 mt-1 md:mt-1.5 font-medium">
                  {entry.co2Saved} kg saved
                </div>
                {entry.hasEvBadge && (
                  <span
                    className={`text-[10px] md:text-xs px-1.5 py-0.5 rounded-md mt-2 font-bold flex items-center gap-1 border ${badgeClass}`}
                  >
                    <Zap className="w-3 h-3 fill-current" />{' '}
                    <span className="hidden md:inline">EV</span>
                  </span>
                )}
              </div>
            );
          });
        })()}
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
                    <td className="py-4 pl-4 font-bold text-slate-600">#{rank}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span>{entry.familyName}</span>
                        {isCurrentFamily && (
                          <span className="text-xxs bg-primary text-white px-2 py-0.5 rounded-full font-bold">
                            You
                          </span>
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
                    <td className="py-4 text-right text-slate-600">{entry.co2Saved} kg</td>
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
