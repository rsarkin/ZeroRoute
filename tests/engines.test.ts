import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateEmissions, getUnitForSubType } from '../lib/emissionCalculator';
import { generateWeeklyPlan } from '../lib/scoringEngine';
import { evaluateNudges } from '../lib/nudgeEngine';
import { FamilyMember, Vehicle, EmissionLog } from '../types';

describe('Emission Calculator Tests', () => {
  test('converts units to correct CO2 in kg', () => {
    expect(calculateEmissions('electricity_kwh', 100)).toBe(82); // 100 * 0.82
    expect(calculateEmissions('electricity_cost', 800)).toBe(82); // (800 / 8) * 0.82
    expect(calculateEmissions('ac', 10)).toBeCloseTo(12.3); // 10 * 1.5 * 0.82
    expect(calculateEmissions('lpg', 2)).toBe(23); // 2 * 11.5
    expect(calculateEmissions('car_petrol', 100)).toBe(21); // 100 * 0.21
    expect(calculateEmissions('car_ev', 100)).toBe(2.5); // 100 * 0.025
    expect(calculateEmissions('walk', 100)).toBe(0);
  });

  test('returns correct units for subtypes', () => {
    expect(getUnitForSubType('electricity_kwh')).toBe('kWh');
    expect(getUnitForSubType('car_petrol')).toBe('km');
    expect(getUnitForSubType('lpg')).toBe('cylinders');
  });
});

describe('Scoring Engine Tests', () => {
  const mockMembers: FamilyMember[] = [
    { id: 'm1', familyId: 'f1', name: 'Rohan', ageGroup: 'adult', role: 'Father' },
    { id: 'm2', familyId: 'f1', name: 'Pooja', ageGroup: 'adult', role: 'Mother' },
    { id: 'm3', familyId: 'f1', name: 'Aarav', ageGroup: 'child', role: 'Son' }
  ];

  const mockVehicles: Vehicle[] = [
    { id: 'v1', familyId: 'f1', type: 'petrol', label: 'Sedan', hasEvBadge: false }
  ];

  test('handles no logs edge case (baseline formulation)', () => {
    const plan = generateWeeklyPlan('f1', '2026-06-08', [], mockMembers, mockVehicles);
    expect(plan.sharedGoal).toContain('Establish a baseline');
    expect(plan.hotspotCategory).toBe('energy'); // default
    expect(plan.memberActions.length).toBe(3);
    expect(plan.suggestions.length).toBeGreaterThan(0);
  });

  test('identifies transport as a hotspot and weights actions accordingly', () => {
    const logs: EmissionLog[] = [
      {
        id: 'l1',
        familyId: 'f1',
        memberId: 'm1',
        category: 'transport',
        subType: 'car_petrol',
        value: 200,
        unit: 'km',
        co2Kg: 42,
        date: '2026-06-08'
      }
    ];

    const plan = generateWeeklyPlan('f1', '2026-06-08', logs, mockMembers, mockVehicles);
    expect(plan.hotspotCategory).toBe('transport');
    expect(plan.sharedGoal).toContain('transport-related');
    expect(plan.reasoningText).toContain('Transport was your largest emission source');
  });

  test('handles single member family correctly', () => {
    const singleMember = [mockMembers[0]];
    const plan = generateWeeklyPlan('f1', '2026-06-08', [], singleMember, mockVehicles);
    expect(plan.memberActions.length).toBe(1);
    expect(plan.memberActions[0].memberName).toBe('Rohan');
  });

  test('filters actions based on vehicle presence and age categories', () => {
    // Family with NO cars and only children should not get carpooling, and should get child-friendly actions
    const childMemberOnly: FamilyMember[] = [
      { id: 'm3', familyId: 'f1', name: 'Aarav', ageGroup: 'child', role: 'Son' }
    ];
    const noVehicles: Vehicle[] = [];
    const plan = generateWeeklyPlan('f1', '2026-06-08', [], childMemberOnly, noVehicles);
    
    // Check that none of the suggested actions include carpooling (which requires a car)
    const carpoolSelected = plan.memberActions.some(action => action.action.includes('carpool'));
    expect(carpoolSelected).toBe(false);
  });
});

describe('Nudge Engine Tests', () => {
  const familyId = 'f1';
  const goalPercent = 10; // 10% reduction
  const baselineWeeklyCo2 = 100; // 100 kg target budget = 90 kg

  beforeEach(() => {
    vi.useFakeTimers();
    // 2026-06-10 is a Wednesday (dayIndex = 3)
    vi.setSystemTime(new Date('2026-06-10T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('triggers AC overuse nudge when average exceeds 6 hours/day', () => {
    const currentLogs: EmissionLog[] = [
      { id: '1', familyId, memberId: 'm1', category: 'energy', subType: 'ac', value: 16, unit: 'hours', co2Kg: 19.68, date: '2026-06-08' },
      { id: '2', familyId, memberId: 'm1', category: 'energy', subType: 'ac', value: 10, unit: 'hours', co2Kg: 12.30, date: '2026-06-09' }
    ]; // 26 hours in 2 days (average 13 hours/day)
    
    const nudge = evaluateNudges(familyId, currentLogs, [], goalPercent, baselineWeeklyCo2);
    expect(nudge).not.toBeNull();
    expect(nudge?.type).toBe('acOveruse');
    expect(nudge?.message).toContain('AC usage is high');
  });

  test('triggers bill spike when current electricity consumption exceeds 1.2x history', () => {
    const currentLogs: EmissionLog[] = [
      { id: '1', familyId, memberId: 'm1', category: 'energy', subType: 'electricity_kwh', value: 300, unit: 'kWh', co2Kg: 246, date: '2026-06-08' }
    ];
    const historicalLogs: EmissionLog[] = [
      { id: 'h1', familyId, memberId: 'm1', category: 'energy', subType: 'electricity_kwh', value: 200, unit: 'kWh', co2Kg: 164, date: '2026-05-15' }
    ]; // 300 vs 200 is > 1.2x (20% increase)

    const nudge = evaluateNudges(familyId, currentLogs, historicalLogs, goalPercent, baselineWeeklyCo2);
    expect(nudge).not.toBeNull();
    expect(nudge?.type).toBe('billSpike');
  });

  test('triggers goal at risk mid-week if emissions exceed progress budget', () => {
    // Current day is Wednesday or later (mocked by date logic)
    // Assume we've used 95 kg CO2 out of a 90 kg weekly budget by Wednesday
    const currentLogs: EmissionLog[] = [
      { id: '1', familyId, memberId: 'm1', category: 'transport', subType: 'car_petrol', value: 500, unit: 'km', co2Kg: 105, date: '2026-06-08' }
    ];
    
    // Running with high current log relative to the baseline (90 kg budget)
    const nudge = evaluateNudges(familyId, currentLogs, [], 10, 80);
    expect(nudge).not.toBeNull();
    expect(nudge?.type).toBe('goalAtRisk');
  });
});
