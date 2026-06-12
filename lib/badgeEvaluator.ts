import { EmissionLog, WeeklyPlan, FamilyProfile } from '../types';

export const BADGES = [
  'first_log',
  'goal_getter',
  'ev_pioneer',
  'streak_3',
  'streak_5',
  'streak_10',
  'public_transit',
  'energy_saver',
  'zero_waste',
  'top_10_percent',
  'tree_planter',
  'early_bird'
] as const;

export function evaluateBadges(
  logs: EmissionLog[],
  pastPlans: WeeklyPlan[],
  profile: FamilyProfile
): string[] {
  const earned: string[] = [];
  
  if (logs.length > 0) earned.push('first_log');
  
  // goal_getter: at least one plan fully completed
  if (pastPlans.some(p => p.suggestions.every(s => s.completed) && p.suggestions.length > 0)) {
    earned.push('goal_getter');
  }
  
  // ev_pioneer: at least 5 EV trips
  const evTrips = logs.filter(l => l.subType === 'car_ev');
  if (evTrips.length >= 5) earned.push('ev_pioneer');

  // public_transit: at least 5 public transit logs
  const transitLogs = logs.filter(l => l.subType === 'bus' || l.subType === 'metro_train' || l.subType === 'train');
  if (transitLogs.length >= 5) earned.push('public_transit');

  // energy_saver: 5 consecutive days of low energy... we mock logic for 5 energy logs
  const energyLogs = logs.filter(l => l.category === 'energy');
  if (energyLogs.length >= 5) earned.push('energy_saver');
  
  // streak logic
  if (logs.length >= 3) earned.push('streak_3');
  if (logs.length >= 5) earned.push('streak_5');
  if (logs.length >= 10) earned.push('streak_10');

  // tree_planter: >= 20 logs
  if (logs.length >= 20) earned.push('tree_planter');

  // early_bird: early morning log (mock: a log before 8am, we just look for 'early' string or assume if more than 2 logs)
  if (logs.length >= 2) earned.push('early_bird');

  // zero_waste: mock
  if (logs.length >= 4) earned.push('zero_waste');

  // top_10_percent: mock
  if (logs.length >= 6) earned.push('top_10_percent');

  return earned;
}
