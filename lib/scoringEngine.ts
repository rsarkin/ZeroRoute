import { EmissionLog, FamilyMember, Vehicle, WeeklyPlan, MemberAction, Suggestion, EmissionCategory } from '../types';
import { ACTION_LIBRARY, ActionTemplate } from '../data/actionLibrary';

/**
 * Generates a weekly plan based on the past 7 days of emission logs and the family profile.
 */
export function generateWeeklyPlan(
  familyId: string,
  weekStart: string,
  logs: EmissionLog[],
  members: FamilyMember[],
  vehicles: Vehicle[]
): WeeklyPlan {
  // 1. Calculate totals per category
  let totalEnergyCo2 = 0;
  let totalTransportCo2 = 0;
  
  // Also track specific stats for trigger rules
  let totalAcHours = 0;
  let totalElectricityCost = 0;
  let totalElectricityKwh = 0;
  let carKmByNonEv = 0;
  let schoolRunsByCar = 0;

  logs.forEach(log => {
    if (log.category === 'energy') {
      totalEnergyCo2 += log.co2Kg;
      if (log.subType === 'ac') {
        totalAcHours += log.value;
      } else if (log.subType === 'electricity_cost') {
        totalElectricityCost += log.value;
      } else if (log.subType === 'electricity_kwh') {
        totalElectricityKwh += log.value;
      }
    } else if (log.category === 'transport') {
      totalTransportCo2 += log.co2Kg;
      if (['car_petrol', 'car_diesel', 'car_cng'].includes(log.subType)) {
        carKmByNonEv += log.value;
      }
      if (log.subType.startsWith('car_') && log.memberId && members.find(m => m.id === log.memberId)?.ageGroup !== 'adult') {
        // School run done via non-active or school age members in car
        schoolRunsByCar += 1;
      }
    }
  });

  const totalCo2 = totalEnergyCo2 + totalTransportCo2;
  
  // 2. Identify Hotspot
  let hotspotCategory: EmissionCategory = 'energy';
  let hotspotPercent = 0;
  
  if (totalCo2 > 0) {
    if (totalTransportCo2 > totalEnergyCo2) {
      hotspotCategory = 'transport';
      hotspotPercent = Math.round((totalTransportCo2 / totalCo2) * 100);
    } else {
      hotspotCategory = 'energy';
      hotspotPercent = Math.round((totalEnergyCo2 / totalCo2) * 100);
    }
  }

  // 3. Generate Reasoning Text (Fallback/Deterministic for Phase 1)
  let reasoningText = '';
  let sharedGoal = '';
  
  if (totalCo2 === 0) {
    sharedGoal = 'Establish a baseline by logging your household energy and travel!';
    reasoningText = 'Welcome to your first week on ZeroRoute! We don\'t have enough logs yet to calculate a carbon footprint. Your shared goal this week is to start logging every car ride, AC hour, and energy bill to establish a baseline.';
  } else if (hotspotCategory === 'transport') {
    sharedGoal = 'Reduce transport-related carbon emissions by 15% this week.';
    reasoningText = `Transport was your largest emission source last week, accounting for ${hotspotPercent}% (${totalTransportCo2.toFixed(1)} kg) of your total ${totalCo2.toFixed(1)} kg CO₂ footprint. Private car travel in India is carbon-intensive; focus on carpooling, walking, or using public transport like the metro for short trips.`;
  } else {
    sharedGoal = 'Reduce household energy consumption by 10% this week.';
    reasoningText = `Household energy was your largest emission source last week, accounting for ${hotspotPercent}% (${totalEnergyCo2.toFixed(1)} kg) of your total ${totalCo2.toFixed(1)} kg CO₂ footprint. India's electrical grid is highly carbon-intensive (0.82 kg CO₂/kWh). Small adjustments in AC use, lightbulbs, and standby power will make a huge difference.`;
  }

  // 4. Select a micro-action for each member
  const memberActions: MemberAction[] = [];
  const hasCars = vehicles.some(v => v.type !== 'ev');
  const hasEv = vehicles.some(v => v.type === 'ev');

  members.forEach(member => {
    // Filter actions suitable for the member's age group
    let possibleActions = ACTION_LIBRARY.filter(act => {
      // Check age compatibility
      if (act.targetRole !== 'any' && act.targetRole !== member.ageGroup) {
        return false;
      }
      
      // Filter out carpooling if family has no non-EV cars
      if (act.key === 'carpool_wednesday' && !hasCars) {
        return false;
      }

      // Filter out school bus/walk if member is not a child/teen
      if (act.key === 'school_bus_3d' && member.ageGroup === 'adult') {
        return false;
      }

      return true;
    });

    // Score actions: baseScore = impact * feasibility
    // Give 1.5x weight to actions aligned with the hotspot category
    const scoredActions = possibleActions.map(act => {
      let multiplier = 1.0;
      if (act.category === hotspotCategory) {
        multiplier = 1.5;
      }
      return {
        action: act,
        score: act.impactScore * act.feasibilityScore * multiplier
      };
    });

    // Sort by score descending
    scoredActions.sort((a, b) => b.score - a.score);

    // Pick an action (or a default if none found, though there will be matching actions)
    const chosenAction = scoredActions.length > 0 
      ? scoredActions[Math.floor(Math.random() * Math.min(3, scoredActions.length))].action.text // Pick top 3 randomly to avoid everyone getting the exact same action
      : 'Switch off room lights when leaving.';

    memberActions.push({
      memberId: member.id,
      memberName: member.name,
      action: chosenAction,
      completed: false
    });
  });

  // 5. Evaluate Trigger Rules for general Suggestions
  const suggestions: Suggestion[] = [];
  
  // Rule A: Switch to LED - triggered if electricity bill > 2000 INR or > 250 kWh
  if (totalElectricityCost > 2000 || totalElectricityKwh > 250 || (totalCo2 === 0)) {
    const ledAction = ACTION_LIBRARY.find(a => a.key === 'switch_led');
    if (ledAction) {
      suggestions.push({
        id: 'sug_led_' + Date.now(),
        key: ledAction.key,
        text: ledAction.text,
        completed: false,
        points: ledAction.points
      });
    }
  }

  // Rule B: AC at 24°C - triggered if AC hours > 6/day average (approx 42 hours/week)
  if (totalAcHours >= 42) {
    const acAction = ACTION_LIBRARY.find(a => a.key === 'ac_24');
    if (acAction) {
      suggestions.push({
        id: 'sug_ac_' + Date.now(),
        key: acAction.key,
        text: acAction.text,
        completed: false,
        points: acAction.points
      });
    }
  }

  // Rule C: School bus - triggered if school run by car logged
  if (schoolRunsByCar > 0 && members.some(m => m.ageGroup === 'child' || m.ageGroup === 'teen')) {
    const schoolBusAction = ACTION_LIBRARY.find(a => a.key === 'school_bus_3d');
    if (schoolBusAction) {
      suggestions.push({
        id: 'sug_bus_' + Date.now(),
        key: schoolBusAction.key,
        text: schoolBusAction.text,
        completed: false,
        points: schoolBusAction.points
      });
    }
  }

  // Rule D: Carpool Wednesday - triggered if significant non-EV car driving (> 150 km)
  if (carKmByNonEv > 150 && hasCars) {
    const carpoolAction = ACTION_LIBRARY.find(a => a.key === 'carpool_wednesday');
    if (carpoolAction) {
      suggestions.push({
        id: 'sug_carpool_' + Date.now(),
        key: carpoolAction.key,
        text: carpoolAction.text,
        completed: false,
        points: carpoolAction.points
      });
    }
  }

  // Rule E: Indoor Plants & Standby Devices - triggered if energy is a hotspot and we need more ideas
  if (hotspotCategory === 'energy' && totalEnergyCo2 > 0) {
    const plantAction = ACTION_LIBRARY.find(a => a.key === 'indoor_plants');
    const standbyAction = ACTION_LIBRARY.find(a => a.key === 'unplug_standby');
    
    if (plantAction && suggestions.length < 3) {
      suggestions.push({
        id: 'sug_plant_' + Date.now(),
        key: plantAction.key,
        text: plantAction.text,
        completed: false,
        points: plantAction.points
      });
    }
    if (standbyAction && suggestions.length < 3) {
      suggestions.push({
        id: 'sug_standby_' + Date.now(),
        key: standbyAction.key,
        text: standbyAction.text,
        completed: false,
        points: standbyAction.points
      });
    }
  }

  // Ensure we always have at least one or two suggestions, even with no logs
  if (suggestions.length === 0) {
    const fallbackKeys = ['unplug_standby', 'ac_24'];
    fallbackKeys.forEach(k => {
      const act = ACTION_LIBRARY.find(a => a.key === k);
      if (act) {
        suggestions.push({
          id: `sug_${k}_` + Date.now(),
          key: act.key,
          text: act.text,
          completed: false,
          points: act.points
        });
      }
    });
  }

  return {
    id: `plan_${weekStart}_${familyId}`,
    familyId,
    weekStart,
    sharedGoal,
    memberActions,
    hotspotCategory,
    reasoningText,
    suggestions: suggestions.slice(0, 3) // Limit to max 3 suggestions per week
  };
}
