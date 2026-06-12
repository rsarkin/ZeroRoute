'use client';

import React from 'react';
import { useWeeklyPlan } from '../../hooks/useWeeklyPlan';
import { useFamily } from '../../providers/FamilyProvider';
import { CheckSquare, Square, RefreshCcw, HelpCircle, Award, Target, MessageSquare } from 'lucide-react';

export default function WeeklyPlanPage() {
  const { currentPlan, markActionCompleted, markSuggestionCompleted, regeneratePlan } = useWeeklyPlan();
  const { members } = useFamily();

  if (!currentPlan) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500 mb-4">No active plan. Create your family profile first!</p>
      </div>
    );
  }

  // Group members for easy role lookups
  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || 'Member';
  const getMemberRole = (id: string) => members.find(m => m.id === id)?.role || '';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-hairline pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-deep">Weekly Carbon Action Plan</h1>
          <p className="text-sm text-slate mt-1">Week of {currentPlan.weekStart}</p>
        </div>
        <button
          onClick={regeneratePlan}
          className="notion-btn-secondary text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Re-evaluate Plan
        </button>
      </div>

      {/* Shared Goal Section */}
      <div className="p-6 bg-card-tint-lavender border border-brand-purple/20 rounded-xl flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-brand-purple/10 text-brand-purple flex items-center justify-center shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <span className="text-xxs font-bold uppercase tracking-wider text-brand-purple-800 bg-brand-purple-300/30 px-2 py-0.5 rounded">Shared Family Goal</span>
          <h2 className="text-xl font-bold text-brand-purple-800 mt-2">{currentPlan.sharedGoal}</h2>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">
            Cooperate as a household to meet this target by the end of the week.
          </p>
        </div>
      </div>

      {/* Main Content Grid: Member Tasks and Reasoning */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column (Span 2): Member Tasks */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-base font-bold text-ink-deep border-b border-hairline-soft pb-2">Individual Micro-Actions</h3>
          <div className="space-y-4">
            {currentPlan.memberActions.map((action) => (
              <div 
                key={action.memberId}
                onClick={() => markActionCompleted(action.memberId)}
                className={`p-4 border rounded-xl flex items-start justify-between cursor-pointer transition-all ${
                  action.completed 
                    ? 'bg-slate-50/70 border-slate-200 opacity-75' 
                    : 'bg-white border-hairline hover:border-slate-400'
                }`}
              >
                <div className="flex gap-3 items-start">
                  <div className="text-primary mt-0.5">
                    {action.completed ? (
                      <CheckSquare className="w-5 h-5 fill-primary/10" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">{action.memberName} ({getMemberRole(action.memberId)})</span>
                    <p className={`text-sm mt-1 font-medium ${action.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {action.action}
                    </p>
                  </div>
                </div>
                {action.completed && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Done</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (Span 1): Scoring Engine Reasoning */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-ink-deep border-b border-hairline-soft pb-2 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-slate" />
            <span>AI Reasoning</span>
          </h3>
          <div className="p-4 bg-white border border-hairline rounded-xl space-y-3 shadow-2xs">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Analysis Snapshot</div>
            <div className="space-y-2">
              <div>
                <span className="text-xs font-medium text-slate-500">Emission Hotspot:</span>
                <span className="text-xs font-bold uppercase ml-2 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-full">
                  {currentPlan.hotspotCategory === 'energy' ? '🔌 Home Energy' : '🚗 Transport'}
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
              {currentPlan.reasoningText}
            </p>
          </div>
        </div>

      </div>

      {/* Suggested Improvements Section */}
      <div className="space-y-4 pt-4 border-t border-hairline">
        <div>
          <h3 className="text-base font-bold text-ink-deep">Suggested Home Upgrades</h3>
          <p className="text-xs text-slate-500 mt-1">Complete these special tasks to unlock achievement badges and plant trees in your forest!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentPlan.suggestions.map((sug) => (
            <div 
              key={sug.id} 
              className={`p-5 border rounded-xl flex flex-col justify-between space-y-4 transition-all ${
                sug.completed 
                  ? 'bg-slate-50/70 border-slate-200 opacity-60' 
                  : 'bg-white border-hairline shadow-2xs'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                    +{sug.points} pts
                  </span>
                  {sug.completed && <span className="text-xs font-bold text-emerald-600">✓ Completed</span>}
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{sug.text}</p>
              </div>

              {!sug.completed ? (
                <button
                  onClick={() => markSuggestionCompleted(sug.id)}
                  className="notion-btn-primary py-1.5 text-xs font-bold w-full"
                >
                  Mark as Completed
                </button>
              ) : (
                <div className="text-xs text-slate-400 italic text-center py-1.5 border border-dashed border-slate-200 rounded">
                  Added to Forest!
                </div>
              )}
            </div>
          ))}
          {currentPlan.suggestions.length === 0 && (
            <div className="col-span-3 text-center py-8 text-slate-500">
              No suggestions triggered this week. Keep logging!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
