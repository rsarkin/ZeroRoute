import { AgeGroup, EmissionCategory } from '../types';

export interface ActionTemplate {
  key: string;
  text: string;
  category: EmissionCategory;
  targetRole: AgeGroup | 'any';
  impactScore: number; // 1-10 (10 = highest impact)
  feasibilityScore: number; // 1-10 (10 = easiest to do)
  points: number;
  description: string;
}

export const ACTION_LIBRARY: ActionTemplate[] = [
  {
    key: 'switch_led',
    text: 'Switch five incandescent bulbs to LED lights',
    category: 'energy',
    targetRole: 'adult',
    impactScore: 8,
    feasibilityScore: 7,
    points: 50,
    description: 'Replacing standard lightbulbs with LEDs reduces lighting energy consumption by up to 80%.'
  },
  {
    key: 'ac_24',
    text: 'Set AC temperature to 24°C or higher',
    category: 'energy',
    targetRole: 'any',
    impactScore: 7,
    feasibilityScore: 9,
    points: 30,
    description: 'Setting your AC to 24°C instead of lower temperatures can reduce electricity consumption by up to 18-20%.'
  },
  {
    key: 'unplug_standby',
    text: 'Unplug chargers and appliances when not in use',
    category: 'energy',
    targetRole: 'any',
    impactScore: 4,
    feasibilityScore: 10,
    points: 20,
    description: 'Phantom power loads from devices left plugged in can account for up to 5% of household electricity.'
  },
  {
    key: 'indoor_plants',
    text: 'Place 3 air-purifying indoor plants in the living room',
    category: 'energy', // indirect energy/environment
    targetRole: 'any',
    impactScore: 3,
    feasibilityScore: 8,
    points: 20,
    description: 'Plants like Areca Palms or Snake Plants help natural filtration and create a cooler indoor climate.'
  },
  {
    key: 'school_bus_3d',
    text: 'Take the school bus or walk to school 3 days this week',
    category: 'transport',
    targetRole: 'child',
    impactScore: 9,
    feasibilityScore: 6,
    points: 60,
    description: 'Swapping car rides for school bus or walking significantly lowers the daily school-run carbon footprint.'
  },
  {
    key: 'carpool_wednesday',
    text: 'Set up or join a carpool for Wednesday commute',
    category: 'transport',
    targetRole: 'adult',
    impactScore: 8,
    feasibilityScore: 5,
    points: 50,
    description: 'Sharing a ride to work or activities cuts commute emissions in half for that day.'
  },
  {
    key: 'public_transport_day',
    text: 'Use metro, local train, or public bus for at least one journey',
    category: 'transport',
    targetRole: 'any',
    impactScore: 8,
    feasibilityScore: 6,
    points: 40,
    description: 'Public transit has an emission factor of 10-15% compared to private petrol cars.'
  },
  {
    key: 'no_car_day',
    text: 'Observe a "No Car Sunday" and walk/cycle for local errands',
    category: 'transport',
    targetRole: 'any',
    impactScore: 6,
    feasibilityScore: 8,
    points: 30,
    description: 'Avoiding car usage for local short-distance trips reduces fuel burn and cold-start emissions.'
  },
  {
    key: 'wash_full_load',
    text: 'Only run the washing machine with a full load',
    category: 'energy',
    targetRole: 'adult',
    impactScore: 4,
    feasibilityScore: 8,
    points: 20,
    description: 'Running the washer less frequently saves water and the heating energy required for extra cycles.'
  },
  {
    key: 'turn_off_geyser',
    text: 'Turn off the water geyser immediately after use',
    category: 'energy',
    targetRole: 'any',
    impactScore: 5,
    feasibilityScore: 9,
    points: 25,
    description: 'Leaving water heaters on standby wastes electricity due to heat loss through the tank walls.'
  }
];
