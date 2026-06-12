import { describe, test, expect } from 'vitest';
import { getImpactEquivalents } from '../lib/impactEquivalents';

describe('Impact Equivalents Tests', () => {
  test('Correct equivalent returned for known CO2 value', () => {
    const eq = getImpactEquivalents(10);
    expect(eq.smartphones).toBe(1220);
    expect(eq.trees).toBeCloseTo(0.48);
    expect(eq.kmsDriven).toBe(40);
  });

  test('Zero CO2 — returns zero equivalent', () => {
    const eq = getImpactEquivalents(0);
    expect(eq.smartphones).toBe(0);
    expect(eq.trees).toBe(0);
    expect(eq.kmsDriven).toBe(0);
  });

  test('Large CO2 value — returns correct scale', () => {
    const eq = getImpactEquivalents(1000);
    expect(eq.smartphones).toBe(122000);
    expect(eq.trees).toBeCloseTo(47.62);
    expect(eq.kmsDriven).toBe(4000);
  });
});
