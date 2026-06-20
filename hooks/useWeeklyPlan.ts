import { useFamily } from '../providers/FamilyProvider';

import { WeeklyPlan } from '../types';

export interface UseWeeklyPlanResult {
  currentPlan: WeeklyPlan | null;
  allPlans: WeeklyPlan[];
  markActionCompleted: (memberId: string, actionId: string) => void;
  markSuggestionCompleted: (suggestionId: string) => void;
  regeneratePlan: () => void;
}

export const useWeeklyPlan = (): UseWeeklyPlanResult => {
  const { weeklyPlans, markActionCompleted, markSuggestionCompleted, regeneratePlan } = useFamily();

  const currentPlan = weeklyPlans.length > 0 ? weeklyPlans[0] : null;

  return {
    currentPlan,
    allPlans: weeklyPlans,
    markActionCompleted,
    markSuggestionCompleted,
    regeneratePlan,
  };
};
