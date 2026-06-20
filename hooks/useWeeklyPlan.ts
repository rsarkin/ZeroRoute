import { useFamily } from '../providers/FamilyProvider';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useWeeklyPlan = (): any => {
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
