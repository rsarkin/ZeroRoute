import { EMISSION_FACTORS } from '../data/constants';

/**
 * Calculates the CO2 emissions in kilograms for a given activity category, subtype, and value.
 * @param {string} subType The specific type of activity (e.g., 'car_petrol', 'electricity_kwh', 'ac', etc.)
 * @param {number} value The amount/value (e.g., km, kWh, hours, INR)
 * @returns {number} The calculated CO2 emissions in kilograms.
 */
export function calculateEmissions(subType: string, value: number): number {
  if (value < 0) return 0;

  switch (subType) {
    // Energy
    case 'electricity_kwh':
      return value * EMISSION_FACTORS.electricity_kwh;

    case 'electricity_cost': {
      // Convert cost to kWh then calculate emissions
      const kwhFromCost = value / EMISSION_FACTORS.electricity_cost_to_kwh;
      return kwhFromCost * EMISSION_FACTORS.electricity_kwh;
    }

    case 'ac':
      // Value in hours of use
      return value * EMISSION_FACTORS.ac_kwh_per_hour * EMISSION_FACTORS.electricity_kwh;

    case 'lpg':
      // Value in number of cylinders
      return value * EMISSION_FACTORS.lpg_per_cylinder;

    // Transport
    case 'car_petrol':
      return value * EMISSION_FACTORS.car_petrol;

    case 'car_diesel':
      return value * EMISSION_FACTORS.car_diesel;

    case 'car_cng':
      return value * EMISSION_FACTORS.car_cng;

    case 'car_ev':
      return value * EMISSION_FACTORS.car_ev;

    case 'school_bus':
      return value * EMISSION_FACTORS.school_bus;

    case 'auto_rickshaw':
      return value * EMISSION_FACTORS.auto_rickshaw;

    case 'metro_train':
      return value * EMISSION_FACTORS.metro_train;

    case 'walk':
      return 0;

    default:
      return 0;
  }
}

/**
 * Retrieves the unit label associated with a specific subType.
 * @param {string} subType The subtype identifier.
 * @returns {string} The unit label.
 */
export function getUnitForSubType(subType: string): string {
  switch (subType) {
    case 'electricity_kwh':
      return 'kWh';
    case 'electricity_cost':
      return '₹';
    case 'ac':
      return 'hours';
    case 'lpg':
      return 'cylinders';
    case 'car_petrol':
    case 'car_diesel':
    case 'car_cng':
    case 'car_ev':
    case 'school_bus':
    case 'auto_rickshaw':
    case 'metro_train':
    case 'walk':
      return 'km';
    default:
      return '';
  }
}
