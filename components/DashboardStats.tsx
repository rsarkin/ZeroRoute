'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useFamily } from '../providers/FamilyProvider';
import { useFamilyScore } from '../hooks/useFamilyScore';
import { AlertCircle, Zap, ShieldAlert, ArrowDown, ArrowUp, Lightbulb } from 'lucide-react';

export const DashboardStats: React.FC = () => {
  const { nudgeAlert, dismissNudge, familyProfile } = useFamily();
  const {
    thisWeekCo2,
    lastWeekCo2,
    baselineCo2,
    targetCo2,
    budgetSpentPercent,
    co2Saved,
    actualReductionPercent,
    equivalents
  } = useFamilyScore();

  const isNudgeActive = nudgeAlert && !nudgeAlert.dismissed;

  // Render a nice progress ring (radius 36 fits strokeWidth 8 inside 80x80 viewport)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(budgetSpentPercent, 100) / 100) * circumference;

  // Determine colour based on budget spent
  let progressColor = 'stroke-emerald-500';
  if (budgetSpentPercent > 100) {
    progressColor = 'stroke-rose-500';
  } else if (budgetSpentPercent > 80) {
    progressColor = 'stroke-amber-500';
  }

  return (
    <div className="space-y-6">
      {/* Active Nudge Alert */}
      {isNudgeActive && (
        <div className="flex items-start justify-between p-4 border rounded-lg bg-card-tint-peach border-brand-orange text-brand-orange-deep animate-pulse">
          <div className="flex gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Action Required</h4>
              <p className="text-xs mt-1">{nudgeAlert.message}</p>
            </div>
          </div>
          <button 
            onClick={dismissNudge} 
            className="text-xs font-bold hover:underline cursor-pointer ml-4 text-brand-orange-deep"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
        {/* Weekly Footprint Card */}
        <div className="notion-card flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-steel uppercase tracking-wider">This Week's Footprint</h3>
            <div className="flex items-baseline mt-2">
              <span className="text-3xl font-bold tracking-tight text-ink-deep">{thisWeekCo2}</span>
              <span className="text-sm text-slate ml-1">kg CO₂e</span>
            </div>
          </div>
          <div className="mt-4 text-xs text-slate">
            {co2Saved > 0 ? (
              <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                <ArrowDown className="w-3.5 h-3.5" />
                Saved {co2Saved} kg vs. normal
              </span>
            ) : (
              <span className="text-slate-500">
                Baseline: {baselineCo2} kg
              </span>
            )}
          </div>
        </div>

        {/* Budget Progress Ring Card */}
        <div className="notion-card flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-steel uppercase tracking-wider">Budget Spent</h3>
            <div className="text-2xl font-bold text-ink-deep">{budgetSpentPercent}%</div>
            <p className="text-xxs text-slate max-w-[140px]">
              Limit: {targetCo2} kg ({familyProfile?.goalPercent}% reduction)
            </p>
          </div>
          
          <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-100 fill-none"
                strokeWidth="8"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                className={`fill-none ${progressColor}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-xs font-semibold">{budgetSpentPercent}%</span>
          </div>
        </div>
      </div>

      {/* Ecological Equivalents Card */}
      {co2Saved > 0 && (
        <div className="p-4 bg-card-tint-mint border border-brand-green/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2 text-brand-green">
            <Zap className="w-4 h-4" />
            <h4 className="font-bold text-xs uppercase tracking-wider">Your Environmental Impact</h4>
          </div>
          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            By saving <span className="font-bold text-brand-green">{co2Saved} kg of CO₂</span> this week, your family has:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700 list-disc list-inside">
            <li>Saved equivalent of driving <span className="font-semibold">{equivalents.carKms} km</span> in a petrol SUV.</li>
            <li>Avoided emissions comparable to charging <span className="font-semibold">{equivalents.phoneCharges.toLocaleString()}</span> smartphones.</li>
            <li>Equal to <span className="font-semibold">{equivalents.treeWeeks} weeks</span> of Carbon absorption by a mature tree.</li>
          </ul>
        </div>
      )}

      {/* Week Over Week comparison */}
      <div className="p-4 bg-surface rounded-lg border border-hairline flex justify-between items-center text-sm">
        <span className="text-slate font-medium">vs Last Week ({lastWeekCo2} kg)</span>
        {thisWeekCo2 < lastWeekCo2 ? (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <ArrowDown className="w-4 h-4" />
            -{(((lastWeekCo2 - thisWeekCo2) / (lastWeekCo2 || 1)) * 100).toFixed(0)}%
          </span>
        ) : thisWeekCo2 > lastWeekCo2 ? (
          <span className="text-rose-600 font-bold flex items-center gap-1">
            <ArrowUp className="w-4 h-4" />
            +{(((thisWeekCo2 - lastWeekCo2) / (lastWeekCo2 || 1)) * 100).toFixed(0)}%
          </span>
        ) : (
          <span className="text-slate font-semibold">No change</span>
        )}
      </div>
    </div>
  );
};
