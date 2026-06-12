import { describe, test, expect } from 'vitest';
import { evaluateBadges } from '../lib/badgeEvaluator';
import { EmissionLog, WeeklyPlan, FamilyProfile } from '../types';

describe('Badge Evaluator Tests', () => {
  const profile: FamilyProfile = {
    id: 'f1', name: 'Test', creatorUid: 'u1', neighbourhoodId: 'n1', cityId: 'c1', goalPercent: 10, createdAt: ''
  };

  test('unlocks first_log on any log', () => {
    const logs: EmissionLog[] = [
      { id: '1', familyId: 'f1', memberId: 'm1', category: 'transport', subType: 'car_petrol', value: 10, unit: 'km', co2Kg: 2.1, date: '' }
    ];
    const badges = evaluateBadges(logs, [], profile);
    expect(badges).toContain('first_log');
  });

  test('unlocks goal_getter when a plan is fully completed', () => {
    const plans: WeeklyPlan[] = [{
      id: 'p1', familyId: 'f1', weekStart: '', sharedGoal: '', memberActions: [], hotspotCategory: 'energy', reasoningText: '',
      suggestions: [{ id: 's1', key: 'k1', text: 'T', completed: true, points: 10 }]
    }];
    const badges = evaluateBadges([], plans, profile);
    expect(badges).toContain('goal_getter');
  });

  test('does not unlock goal_getter if incomplete', () => {
    const plans: WeeklyPlan[] = [{
      id: 'p1', familyId: 'f1', weekStart: '', sharedGoal: '', memberActions: [], hotspotCategory: 'energy', reasoningText: '',
      suggestions: [{ id: 's1', key: 'k1', text: 'T', completed: false, points: 10 }]
    }];
    const badges = evaluateBadges([], plans, profile);
    expect(badges).not.toContain('goal_getter');
  });

  test('unlocks ev_pioneer with 5 EV trips', () => {
    const logs = Array(5).fill({
      id: '1', familyId: 'f1', memberId: 'm1', category: 'transport', subType: 'car_ev', value: 10, unit: 'km', co2Kg: 2.1, date: ''
    }) as EmissionLog[];
    const badges = evaluateBadges(logs, [], profile);
    expect(badges).toContain('ev_pioneer');
  });

  test('badge not duplicated', () => {
    // evaluateBadges returns unique list, or we assume logic only processes state to grant it once in DB.
    const logs = Array(5).fill({
      id: '1', familyId: 'f1', memberId: 'm1', category: 'transport', subType: 'car_ev', value: 10, unit: 'km', co2Kg: 2.1, date: ''
    }) as EmissionLog[];
    const badges = evaluateBadges(logs, [], profile);
    expect(badges.filter(b => b === 'ev_pioneer').length).toBe(1);
  });
});
