import { describe, test, expect } from 'vitest';
import { calculateEmissions, getUnitForSubType } from '../lib/emissionCalculator';

describe('Emission Calculator Tests', () => {
  test('converts units to correct CO2 in kg for various vehicle types', () => {
    expect(calculateEmissions('car_petrol', 100)).toBe(21); // 100 * 0.21
    expect(calculateEmissions('car_diesel', 100)).toBe(17); // 100 * 0.17
    expect(calculateEmissions('car_cng', 100)).toBe(11); // 100 * 0.11
    expect(calculateEmissions('car_ev', 100)).toBe(2.5); // 100 * 0.025
    expect(calculateEmissions('walk', 100)).toBe(0);
  });

  test('calculates LPG cylinder correct CO2', () => {
    expect(calculateEmissions('lpg', 2)).toBe(23); // 2 * 11.5
  });

  test('calculates Grid electricity with India factor', () => {
    expect(calculateEmissions('electricity_kwh', 100)).toBe(82); // 100 * 0.82
    expect(calculateEmissions('electricity_cost', 800)).toBe(82); // (800 / 8) * 0.82
    expect(calculateEmissions('ac', 10)).toBeCloseTo(12.3); // 10 * 1.5 * 0.82
  });

  test('returns 0 for zero distance trip', () => {
    expect(calculateEmissions('car_petrol', 0)).toBe(0);
  });

  test('returns 0 with error flag for negative input', () => {
    // Our implementation should return 0 if value < 0
    expect(calculateEmissions('car_petrol', -50)).toBe(0);
  });

  test('returns correct units for subtypes', () => {
    expect(getUnitForSubType('electricity_kwh')).toBe('kWh');
    expect(getUnitForSubType('car_petrol')).toBe('km');
    expect(getUnitForSubType('lpg')).toBe('cylinders');
  });
});
