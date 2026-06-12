import { EmissionLog, NudgeAlert } from '../types';

/**
 * Evaluates the current week's logs against historical data to trigger at most one active nudge alert.
 * 
 * @param familyId Unique ID of the family
 * @param currentLogs Logs for the current week (starting Monday)
 * @param historicalLogs Logs for previous weeks
 * @param goalPercent Target reduction percentage (e.g. 10 for 10% reduction)
 * @param baselineWeeklyCo2 The baseline weekly emissions in kg CO2
 */
export function evaluateNudges(
  familyId: string,
  currentLogs: EmissionLog[],
  historicalLogs: EmissionLog[],
  goalPercent: number,
  baselineWeeklyCo2: number
): NudgeAlert | null {
  const now = new Date();
  const todayDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  
  // Convert day of week so Monday = 1, Sunday = 7
  const dayIndex = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;

  // 1. Calculate current week total emissions so far
  const currentWeekCo2 = currentLogs.reduce((sum, log) => sum + log.co2Kg, 0);

  // 2. Check Rule: Bill Spike (current month electricity cost/kwh is > 20% higher than last month)
  // Let's filter for electricity logs (both cost and kwh)
  const currentElec = currentLogs
    .filter(log => log.subType === 'electricity_kwh' || log.subType === 'electricity_cost')
    .reduce((sum, log) => sum + log.value, 0);

  const prevMonthStart = new Date();
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  
  const pastElecLogs = historicalLogs.filter(log => {
    const logDate = new Date(log.date);
    return log.category === 'energy' && 
           (log.subType === 'electricity_kwh' || log.subType === 'electricity_cost') &&
           logDate >= prevMonthStart;
  });
  
  const pastElecTotal = pastElecLogs.reduce((sum, log) => sum + log.value, 0);
  
  // If we have some comparison base, and current is already spikes 20% more
  if (pastElecTotal > 0 && currentElec > pastElecTotal * 1.2) {
    return {
      id: `nudge_bill_${Date.now()}`,
      familyId,
      type: 'billSpike',
      message: `Noticeable spike in electricity usage! Your current logging is 20%+ higher than last month's baseline. Consider switching to LED bulbs.`,
      triggeredAt: now.toISOString(),
      dismissed: false
    };
  }

  // 3. Check Rule: AC Overuse (AC hours logged > 6 hours/day average this week)
  const acLogs = currentLogs.filter(log => log.subType === 'ac');
  const totalAcHours = acLogs.reduce((sum, log) => sum + log.value, 0);
  const averageAcHoursPerDay = dayIndex > 0 ? totalAcHours / dayIndex : 0;

  if (averageAcHoursPerDay > 6) {
    return {
      id: `nudge_ac_${Date.now()}`,
      familyId,
      type: 'acOveruse',
      message: `Your AC usage is high! Averaging ${averageAcHoursPerDay.toFixed(1)} hours/day this week. Try setting a timer or raising the temperature to 24°C.`,
      triggeredAt: now.toISOString(),
      dismissed: false
    };
  }

  // 4. Check Rule: Goal at Risk (By Wednesday (day 3), progress is below 40% of weekly target)
  // To rephrase in terms of emissions: We have a weekly carbon budget.
  // Weekly budget = baselineWeeklyCo2 * (1 - goalPercent/100).
  // If we have already consumed more than 60% of our budget by midweek (Wednesday is day 3 of 7, 43% of the week), we are at risk of failing the goal.
  const targetWeeklyCo2 = baselineWeeklyCo2 * (1 - goalPercent / 100);
  if (dayIndex >= 3 && baselineWeeklyCo2 > 0) {
    const expectedBudgetRatioForDay = dayIndex / 7;
    // If we've blown past 115% of our expected pro-rata budget for this day
    if (currentWeekCo2 > targetWeeklyCo2 * expectedBudgetRatioForDay * 1.15) {
      const excessPercent = Math.round(((currentWeekCo2 / (targetWeeklyCo2 * expectedBudgetRatioForDay)) - 1) * 100);
      return {
        id: `nudge_risk_${Date.now()}`,
        familyId,
        type: 'goalAtRisk',
        message: `Your weekly carbon budget is at risk! You are ${excessPercent}% over your target allowance for mid-week. Let's try to walk or carpool tomorrow.`,
        triggeredAt: now.toISOString(),
        dismissed: false
      };
    }
  }

  // 5. Check Rule: Streak Broken
  // If in the previous week they achieved their goal (emissions <= target), 
  // but this week they are projected to miss it (e.g. currentWeekCo2 > targetWeeklyCo2).
  // This is a simpler version: if they had a streak, and currently they are over target,
  // we trigger a streak warning.
  if (currentWeekCo2 > targetWeeklyCo2 && targetWeeklyCo2 > 0) {
    return {
      id: `nudge_streak_${Date.now()}`,
      familyId,
      type: 'streakBroken',
      message: `Your reduction streak is in danger! Your emissions have exceeded this week's target of ${targetWeeklyCo2.toFixed(1)} kg. Let's make an effort today to conserve.`,
      triggeredAt: now.toISOString(),
      dismissed: false
    };
  }

  return null;
}
