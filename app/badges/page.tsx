'use client';

import React from 'react';
import { useFamily } from '../../providers/FamilyProvider';
import { BADGE_DEFINITIONS, BadgeDefinition } from '../../data/badgeDefinitions';
import { 
  Award, 
  Trees, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2,
  Sprout,
  Target,
  Flame,
  Zap,
  Bus,
  Snowflake,
  Leaf,
  Trophy,
  Lightbulb,
  Users
} from 'lucide-react';

const renderBadgeIcon = (badgeKey: string, className = "w-6 h-6") => {
  switch (badgeKey) {
    case 'first_log':
      return <Sprout className={className} />;
    case 'goal_getter':
      return <Target className={className} />;
    case 'on_a_roll':
      return <Flame className={className} />;
    case 'ev_pioneer':
      return <Zap className={className} />;
    case 'bus_champion':
      return <Bus className={className} />;
    case 'cool_it':
      return <Snowflake className={className} />;
    case 'green_home':
      return <Leaf className={className} />;
    case 'society_topper':
      return <Trophy className={className} />;
    case 'forest_keeper':
      return <Trees className={className} />;
    case 'bright_idea':
      return <Lightbulb className={className} />;
    case 'plant_parent':
      return <Sprout className={className} />;
    case 'full_team':
      return <Users className={className} />;
    default:
      return <Award className={className} />;
  }
};

export default function BadgesPage() {
  const { badges, familyProfile } = useFamily();

  // Helper to check if a badge is earned and return its details
  const getEarnedData = (badgeKey: string) => {
    return badges.find(b => b.badgeKey === badgeKey);
  };

  // Calculate next milestone progress
  const earnedCount = badges.length;
  let nextMilestoneTitle = 'Forest Keeper';
  let nextMilestoneDesc = 'Earn 5 achievement badges to grow your forest canopy.';
  let currentProgress = earnedCount;
  let targetProgress = 5;
  
  if (earnedCount >= 5) {
    nextMilestoneTitle = 'Forest Master';
    nextMilestoneDesc = 'Earn 10 achievement badges to expand your forest into a sustainable sanctuary.';
    targetProgress = 10;
  }
  
  const progressPercent = Math.min(100, Math.round((currentProgress / targetProgress) * 100));

  const colorsMap: Record<string, { bg: string, text: string, border: string }> = {
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800/50' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/20', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/50' },
    amber: { bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50' },
    sky: { bg: 'bg-sky-50 dark:bg-sky-950/20', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800/50' },
    indigo: { bg: 'bg-indigo-50 dark:bg-indigo-950/20', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800/50' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/20', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50' },
    green: { bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800/50' },
    yellow: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800/50' },
    teal: { bg: 'bg-teal-50 dark:bg-teal-950/20', text: 'text-teal-700 dark:text-teal-400', border: 'border-teal-200 dark:border-teal-800/50' },
    orange: { bg: 'bg-orange-50 dark:bg-orange-950/20', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800/50' },
    rose: { bg: 'bg-rose-50 dark:bg-rose-950/20', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800/50' },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Header */}
      <div className="border-b border-hairline pb-4 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-deep flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            <span>Achievement Badges</span>
          </h1>
          <p className="text-sm text-slate mt-1">Unlock badges to grow more trees in your forest</p>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-100 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Trees className="w-4 h-4 text-emerald-600" />
          <span>{badges.length} Extra Trees Planted</span>
        </div>
      </div>

      {/* Next Milestone Card */}
      <div className="bg-forest-green text-[#ebdcb9] border border-emerald-950 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <span className="text-xxs font-bold uppercase tracking-widest text-emerald-300">Next Milestone</span>
          <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
            <Trees className="w-5 h-5 text-[#ebdcb9]" />
            <span>{nextMilestoneTitle}</span>
          </h2>
          <p className="text-xs text-emerald-200/80 max-w-md">
            {nextMilestoneDesc} (Currently: <span className="font-semibold text-white">{currentProgress} / {targetProgress}</span>)
          </p>
        </div>
        
        {/* Progress Bar & Percentage */}
        <div className="w-full md:w-48 shrink-0 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-300">Progress</span>
            <span className="text-white">{progressPercent}%</span>
          </div>
          <div className="w-full bg-emerald-950 h-2.5 rounded-full overflow-hidden border border-emerald-900">
            <div 
              className="bg-[#ebdcb9] h-full rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {BADGE_DEFINITIONS.map((badge: BadgeDefinition) => {
          const earned = getEarnedData(badge.key);
          const colorClasses = colorsMap[badge.color] || colorsMap.emerald;

          return (
            <div 
              key={badge.key}
              className={`p-6 border rounded-xl flex flex-col justify-between space-y-4 transition-all ${
                earned 
                  ? `${colorClasses.bg} ${colorClasses.border}` 
                  : 'bg-white border-hairline opacity-50 grayscale shadow-none'
              }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-lg border ${colorClasses.border} ${colorClasses.text} bg-white dark:bg-slate-900 shadow-2xs`}>
                    {renderBadgeIcon(badge.key, "w-6 h-6")}
                  </div>
                  {earned && (
                    <span className="text-xxs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Unlocked
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-snug">{badge.title}</h3>
                  <p className="text-xs text-slate-600 mt-1">{badge.description}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100/50 text-xxs text-slate-500">
                {earned ? (
                  <span>Unlocked on {new Date(earned.earnedAt).toLocaleDateString()}</span>
                ) : (
                  <span>Requirement: {badge.condition}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
