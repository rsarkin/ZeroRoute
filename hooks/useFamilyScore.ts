import { useFamily } from '../providers/FamilyProvider';

export interface Equivalents {
  carKms: number;
  phoneCharges: number;
  treeWeeks: number;
}

export interface FamilyScoreResult {
  thisWeekCo2: number;
  lastWeekCo2: number;
  baselineCo2: number;
  targetCo2: number;
  budgetSpentPercent: number;
  co2Saved: number;
  actualReductionPercent: number;
  equivalents: Equivalents;
}

export const useFamilyScore = (): FamilyScoreResult => {
  const { emissionLogs, familyProfile } = useFamily();

  // Establish a baseline (average of older weeks, or 180 kg if empty)
  const BASELINE_DEFAULT = 180;

  const now = new Date();

  const thisWeekLogs = emissionLogs.filter((log) => {
    const diffDays = (now.getTime() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  });

  const lastWeekLogs = emissionLogs.filter((log) => {
    const diffDays = (now.getTime() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 7 && diffDays <= 14;
  });

  const olderLogs = emissionLogs.filter((log) => {
    const diffDays = (now.getTime() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 14;
  });

  const thisWeekCo2 = thisWeekLogs.reduce((sum, l) => sum + l.co2Kg, 0);
  const lastWeekCo2 = lastWeekLogs.reduce((sum, l) => sum + l.co2Kg, 0);

  // Calculate baseline
  let baselineCo2 = BASELINE_DEFAULT;
  if (olderLogs.length > 0) {
    // Group older logs by week to find average weekly emissions
    const oldestDate = new Date(olderLogs[olderLogs.length - 1].date);
    const diffTime = Math.abs(now.getTime() - oldestDate.getTime());
    const diffWeeks = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)) - 2); // subtract this week and last week
    const totalOlderCo2 = olderLogs.reduce((sum, l) => sum + l.co2Kg, 0);
    baselineCo2 = totalOlderCo2 / diffWeeks;
  } else if (lastWeekCo2 > 0) {
    baselineCo2 = lastWeekCo2;
  }

  const goalPercent = familyProfile?.goalPercent || 20;
  const targetCo2 = baselineCo2 * (1 - goalPercent / 100);

  // Progress towards budget
  // e.g., if target is 100kg and we used 60kg, we used 66% of our budget
  const budgetSpentPercent = targetCo2 > 0 ? (thisWeekCo2 / targetCo2) * 100 : 0;

  // Realized savings
  const co2Saved = Math.max(0, baselineCo2 - thisWeekCo2);
  const actualReductionPercent =
    baselineCo2 > 0 ? ((baselineCo2 - thisWeekCo2) / baselineCo2) * 100 : 0;

  // Ecological equivalents
  // 1 kg CO2 = ~4.7 km driven by a petrol car (0.21 kg/km)
  // 1 kg CO2 = ~120 smartphone charges
  // 1 tree absorbs ~22 kg CO2 per year, so ~0.42 kg/week
  const equivalents = {
    carKms: co2Saved / 0.21,
    phoneCharges: co2Saved * 120,
    treeWeeks: co2Saved / 0.42,
  };

  return {
    thisWeekCo2: Number(thisWeekCo2.toFixed(1)),
    lastWeekCo2: Number(lastWeekCo2.toFixed(1)),
    baselineCo2: Number(baselineCo2.toFixed(1)),
    targetCo2: Number(targetCo2.toFixed(1)),
    budgetSpentPercent: Math.min(100, Math.max(0, Math.round(budgetSpentPercent))),
    co2Saved: Number(co2Saved.toFixed(1)),
    actualReductionPercent: Number(actualReductionPercent.toFixed(1)),
    equivalents: {
      carKms: Math.round(equivalents.carKms),
      phoneCharges: Math.round(equivalents.phoneCharges),
      treeWeeks: Math.round(equivalents.treeWeeks),
    },
  };
};
