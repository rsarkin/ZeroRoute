import { useFamily } from '../providers/FamilyProvider';

export function useWeeklyPlan() {
  const { 
    weeklyPlans, 
    markActionCompleted, 
    markSuggestionCompleted, 
    regeneratePlan 
  } = useFamily();

  const currentPlan = weeklyPlans.length > 0 ? weeklyPlans[0] : null;

  return {
    currentPlan,
    allPlans: weeklyPlans,
    markActionCompleted,
    markSuggestionCompleted,
    regeneratePlan
  };
}
