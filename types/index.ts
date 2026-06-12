export type AgeGroup = 'child' | 'teen' | 'adult';
export type VehicleType = 'petrol' | 'diesel' | 'cng' | 'ev';
export type EmissionCategory = 'energy' | 'transport';

export interface FamilyProfile {
  id: string;
  name: string;
  creatorUid: string;
  neighbourhoodId: string;
  cityId: string;
  goalPercent: number; // e.g., 10, 20, 30
  createdAt: string; // ISO string
}

export interface FamilyMember {
  id: string;
  familyId: string;
  name: string;
  ageGroup: AgeGroup;
  role: string; // e.g., "Father", "Mother", "Son", "Daughter"
}

export interface Vehicle {
  id: string;
  familyId: string;
  type: VehicleType;
  label: string; // e.g., "Dad's Car", "Family EV"
  hasEvBadge: boolean;
}

export interface EmissionLog {
  id: string;
  familyId: string;
  memberId: string;
  category: EmissionCategory;
  subType: string; // e.g., "car", "bus", "electricity", "ac", "lpg"
  value: number; // raw value e.g. km driven, kWh, hours
  unit: string; // e.g., "km", "kWh", "hrs", "cylinder"
  co2Kg: number; // calculated CO2 in kg
  date: string; // YYYY-MM-DD
}

export interface MemberAction {
  memberId: string;
  memberName: string;
  action: string;
  completed: boolean;
}

export interface Suggestion {
  id: string;
  key: string; // e.g., 'switch_led', 'ac_24', etc.
  text: string;
  completed: boolean;
  points: number;
}

export interface WeeklyPlan {
  id: string;
  familyId: string;
  weekStart: string; // YYYY-MM-DD
  sharedGoal: string;
  memberActions: MemberAction[];
  hotspotCategory: EmissionCategory;
  reasoningText: string;
  suggestions: Suggestion[];
}

export interface NudgeAlert {
  id: string;
  familyId: string;
  type: 'billSpike' | 'acOveruse' | 'goalAtRisk' | 'streakBroken';
  message: string;
  triggeredAt: string; // ISO string
  dismissed: boolean;
}

export interface Badge {
  id: string;
  familyId: string;
  badgeKey: string; // e.g. 'first_log', 'goal_getter', etc.
  earnedAt: string; // ISO string
  treeUnlocked: boolean;
}

export interface LeaderboardEntry {
  familyId: string;
  familyName: string;
  neighbourhoodId: string;
  reductionPercent: number; // e.g. 15.5 meaning 15.5% reduction
  co2Saved: number; // kg of CO2 saved compared to baseline
  badges: string[]; // array of badgeKeys
  hasEvBadge: boolean;
  weekRank?: number;
}

export interface MilestoneTree {
  id: string;
  stage: 'seed' | 'sapling' | 'tree' | 'forest';
  plantedAt: string; // ISO string
}

export interface ForestState {
  familyId: string;
  trees: MilestoneTree[];
  totalCarbonSaved: number;
  lastUpdated: string;
}
