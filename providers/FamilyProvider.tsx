'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { FamilyProfile, FamilyMember, Vehicle, EmissionLog, WeeklyPlan, NudgeAlert, Badge, LeaderboardEntry } from '../types';
import { calculateEmissions } from '../lib/emissionCalculator';
import { generateWeeklyPlan } from '../lib/scoringEngine';
import { evaluateNudges } from '../lib/nudgeEngine';
import { BADGE_DEFINITIONS } from '../data/badgeDefinitions';
import { 
  X, 
  Sprout, 
  Target, 
  Flame, 
  Zap, 
  Bus, 
  Snowflake, 
  Leaf, 
  Trophy, 
  Trees, 
  Lightbulb, 
  Users, 
  Award 
} from 'lucide-react';

interface FamilyContextType {
  familyProfile: FamilyProfile | null;
  members: FamilyMember[];
  vehicles: Vehicle[];
  emissionLogs: EmissionLog[];
  weeklyPlans: WeeklyPlan[];
  badges: Badge[];
  nudgeAlert: NudgeAlert | null;
  leaderboard: LeaderboardEntry[];
  setupFamily: (name: string, cityId: string, neighbourhoodId: string, goalPercent: number, memberList: { name: string; ageGroup: 'child' | 'teen' | 'adult'; role: string }[], vehicleList: { type: 'petrol' | 'diesel' | 'cng' | 'ev'; label: string }[]) => void;
  addLog: (log: Omit<EmissionLog, 'id' | 'co2Kg' | 'familyId'>) => void;
  markSuggestionCompleted: (suggestionId: string) => void;
  markActionCompleted: (memberId: string) => void;
  dismissNudge: () => void;
  regeneratePlan: () => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// Initial/default mockup data to instantly populate the app
const DEFAULT_FAMILY_ID = 'fam_green_123';

const defaultProfile: FamilyProfile = {
  id: DEFAULT_FAMILY_ID,
  name: 'Green Family',
  creatorUid: 'mem_father_123',
  cityId: 'mumbai',
  neighbourhoodId: 'mum_bandra',
  goalPercent: 20,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
};

const defaultMembers: FamilyMember[] = [
  { id: 'mem_father_123', familyId: DEFAULT_FAMILY_ID, name: 'Hrushikesh', ageGroup: 'adult', role: 'Father' },
  { id: 'mem_mother_123', familyId: DEFAULT_FAMILY_ID, name: 'Nakshatra', ageGroup: 'adult', role: 'Mother' },
  { id: 'mem_son_123', familyId: DEFAULT_FAMILY_ID, name: 'Shreyas', ageGroup: 'teen', role: 'Son' },
  { id: 'mem_daughter_123', familyId: DEFAULT_FAMILY_ID, name: 'Anika', ageGroup: 'child', role: 'Daughter' },
];

const defaultVehicles: Vehicle[] = [
  { id: 'veh_1', familyId: DEFAULT_FAMILY_ID, type: 'petrol', label: 'SUV (Creta)', hasEvBadge: false },
  { id: 'veh_2', familyId: DEFAULT_FAMILY_ID, type: 'ev', label: 'Ather 450X', hasEvBadge: true },
];

// Generate 4 weeks of historical logs (so charts show nice trends) for any set of profiles/vehicles
const generateMockLogsForMembers = (
  familyId: string,
  membersList: FamilyMember[],
  vehiclesList: Vehicle[]
): EmissionLog[] => {
  const logs: EmissionLog[] = [];
  const startOffset = 28; // 4 weeks ago
  
  const adults = membersList.filter(m => m.ageGroup === 'adult');
  const teens = membersList.filter(m => m.ageGroup === 'teen');
  const children = membersList.filter(m => m.ageGroup === 'child');

  const primaryVehicle = vehiclesList.length > 0 ? vehiclesList[0].type : 'petrol';
  const secondaryVehicle = vehiclesList.length > 1 ? vehiclesList[1].type : 'walk';

  for (let i = startOffset; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 1. AC Usage (Assigned to Mother / first adult)
    if (membersList.length > 0) {
      const acMember = adults[0] || membersList[0];
      logs.push({
        id: `log_ac_${i}_${familyId}`,
        familyId,
        memberId: acMember.id,
        category: 'energy',
        subType: 'ac',
        value: Math.round((5 + Math.random() * 2 - 1) * 2) / 2, // Rounds to nearest 0.5 hours (e.g. 4.5, 5.0)
        unit: 'hours',
        co2Kg: 0,
        date: dateStr,
      });
    }

    // 2. Car Commutes (Father / adults on weekdays)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      adults.forEach((adult, index) => {
        const vType = index === 0 ? `car_${primaryVehicle}` : (secondaryVehicle === 'walk' ? 'metro_train' : `car_${secondaryVehicle}`);
        logs.push({
          id: `log_car_${i}_${adult.id}`,
          familyId,
          memberId: adult.id,
          category: 'transport',
          subType: vType,
          value: 15 + Math.floor(Math.random() * 10),
          unit: 'km',
          co2Kg: 0,
          date: dateStr,
        });
      });
    }

    // 3. School runs (Teens and children on weekdays)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      teens.forEach(teen => {
        logs.push({
          id: `log_bus_${i}_${teen.id}`,
          familyId,
          memberId: teen.id,
          category: 'transport',
          subType: 'school_bus',
          value: 10,
          unit: 'km',
          co2Kg: 0,
          date: dateStr,
        });
      });

      children.forEach(child => {
        logs.push({
          id: `log_run_${i}_${child.id}`,
          familyId,
          memberId: child.id,
          category: 'transport',
          subType: Math.random() > 0.5 ? 'school_bus' : 'walk',
          value: Math.random() > 0.5 ? 8 : 2,
          unit: 'km',
          co2Kg: 0,
          date: dateStr,
        });
      });
    }
  }

  // Add a shared log common to all profiles on yesterday's date (a family outing / metro transit)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  membersList.forEach(member => {
    logs.push({
      id: `log_shared_outing_${yesterdayStr}_${member.id}`,
      familyId,
      memberId: member.id,
      category: 'transport',
      subType: 'metro_train',
      value: 12, // 12 km shared metro ride
      unit: 'km',
      co2Kg: 0,
      date: yesterdayStr,
    });
  });

  // Monthly electricity bill logs (30 days ago)
  if (adults.length > 0) {
    logs.push({
      id: `log_elec_prev_${familyId}`,
      familyId,
      memberId: adults[0].id,
      category: 'energy',
      subType: 'electricity_kwh',
      value: 320,
      unit: 'kWh',
      co2Kg: 0,
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
  }

  return logs.map(l => ({
    ...l,
    co2Kg: calculateEmissions(l.subType, l.value)
  }));
};

const defaultLeaderboard: LeaderboardEntry[] = [
  { familyId: 'fam_sharma', familyName: 'Sharma Family', neighbourhoodId: 'mum_bandra', reductionPercent: 12.5, co2Saved: 18.2, badges: ['first_log', 'cool_it'], hasEvBadge: false },
  { familyId: 'fam_iyer', familyName: 'Iyer Family', neighbourhoodId: 'mum_bandra', reductionPercent: 16.8, co2Saved: 25.5, badges: ['first_log', 'goal_getter', 'bright_idea'], hasEvBadge: true },
  { familyId: 'fam_patel', familyName: 'Patel Family', neighbourhoodId: 'mum_bandra', reductionPercent: 6.2, co2Saved: 8.0, badges: ['first_log'], hasEvBadge: false },
];

const renderBadgeToastIcon = (badgeKey: string, className = "w-6 h-6") => {
  switch (badgeKey) {
    case 'first_log':
      return <Sprout className={className} />;
    case 'goal_getter':
      return <Target className={className} />;
    case 'on_a_roll':
      return <Flame className={className} />;
    case 'ev_pioneer':
      return <Zap className={className} />;
    case 'bus_champion':
      return <Bus className={className} />;
    case 'cool_it':
      return <Snowflake className={className} />;
    case 'green_home':
      return <Leaf className={className} />;
    case 'society_topper':
      return <Trophy className={className} />;
    case 'forest_keeper':
      return <Trees className={className} />;
    case 'bright_idea':
      return <Lightbulb className={className} />;
    case 'plant_parent':
      return <Sprout className={className} />;
    case 'full_team':
      return <Users className={className} />;
    default:
      return <Award className={className} />;
  }
};

interface BadgeToastProps {
  toast: { badgeKey: string; title: string; description: string };
  onClose: () => void;
}

const BadgeToast: React.FC<BadgeToastProps> = ({ toast, onClose }) => {
  const badgeDef = BADGE_DEFINITIONS.find(b => b.key === toast.badgeKey);
  const color = badgeDef?.color || 'emerald';

  const colorAccentClass = (() => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'purple': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'amber': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'sky': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'indigo': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'blue': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'green': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'yellow': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'teal': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'orange': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'rose': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  })();

  const progressBarColorClass = (() => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500';
      case 'purple': return 'bg-purple-500';
      case 'amber': return 'bg-amber-400';
      case 'sky': return 'bg-sky-400';
      case 'indigo': return 'bg-indigo-500';
      case 'blue': return 'bg-blue-500';
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-400';
      case 'teal': return 'bg-teal-500';
      case 'orange': return 'bg-orange-500';
      case 'rose': return 'bg-rose-500';
      default: return 'bg-emerald-500';
    }
  })();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-[calc(100vw-3rem)] md:w-96 bg-forest-green border border-emerald-800 rounded-xl shadow-2xl overflow-hidden animate-slide-in-right pointer-events-auto">
      <div className="p-4 flex items-start gap-4">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center border ${colorAccentClass}`}>
          {renderBadgeToastIcon(toast.badgeKey, "w-6 h-6")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">New Achievement unlocked!</p>
          <h4 className="text-sm md:text-base font-bold text-yellow-100 mt-0.5">{toast.title}</h4>
          <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{toast.description}</p>
        </div>
        <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1" aria-label="Close notification">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className={`h-1 ${progressBarColorClass} animate-progress-shrink origin-left`} />
    </div>
  );
};

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [familyProfile, setFamilyProfile] = useState<FamilyProfile | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [emissionLogs, setEmissionLogs] = useState<EmissionLog[]>([]);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [nudgeAlert, setNudgeAlert] = useState<NudgeAlert | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeToast, setActiveToast] = useState<{ badgeKey: string; title: string; description: string } | null>(null);

  const triggerBadgeNotification = (badgeKey: string, familyIdToUse?: string) => {
    if (typeof window === 'undefined') return;

    const badgeDef = BADGE_DEFINITIONS.find(b => b.key === badgeKey);
    const title = badgeDef ? badgeDef.title : 'New Badge';
    const description = badgeDef ? badgeDef.description : 'You earned a new achievement!';

    // 1. HTML5 Web Push Notification API
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('🏆 Achievement Unlocked!', {
          body: `Congratulations! Your family unlocked the "${title}" badge: ${description}`,
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('🏆 Achievement Unlocked!', {
              body: `Congratulations! Your family unlocked the "${title}" badge: ${description}`,
            });
          }
        });
      }
    }

    // 2. Premium In-App Toast Alert
    setActiveToast({
      badgeKey,
      title,
      description
    });
  };

  const updateAndSaveBadges = (currentBadgesList: Badge[], familyIdToUse?: string): Badge[] => {
    let finalBadges = [...currentBadgesList];
    const fid = familyIdToUse || familyProfile?.id || '';

    // Check Forest Keeper Badge (earned 5 or more badges)
    if (finalBadges.length >= 5 && !finalBadges.some(b => b.badgeKey === 'forest_keeper')) {
      const forestKeeperBadge: Badge = {
        id: `badge_forest_${Date.now()}`,
        familyId: fid,
        badgeKey: 'forest_keeper',
        earnedAt: new Date().toISOString(),
        treeUnlocked: true
      };
      finalBadges.push(forestKeeperBadge);
      triggerBadgeNotification('forest_keeper', fid);
    }

    setBadges(finalBadges);
    localStorage.setItem('zr_badges', JSON.stringify(finalBadges));
    return finalBadges;
  };

  // Auto-dismiss the active toast after 6 seconds
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  useEffect(() => {
    // Request permission for push notifications
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Load or initialize all states
    const localProfile = localStorage.getItem('zr_profile');
    if (localProfile) {
      setFamilyProfile(JSON.parse(localProfile));
      setMembers(JSON.parse(localStorage.getItem('zr_members') || '[]'));
      setVehicles(JSON.parse(localStorage.getItem('zr_vehicles') || '[]'));
      
      // Auto-sanitize existing logs from localStorage to round float values (e.g. AC hours)
      const rawLogs = JSON.parse(localStorage.getItem('zr_logs') || '[]');
      const sanitizedLogs = rawLogs.map((log: any) => ({
        ...log,
        value: typeof log.value === 'number' ? Math.round(log.value * 10) / 10 : log.value
      }));
      setEmissionLogs(sanitizedLogs);
      localStorage.setItem('zr_logs', JSON.stringify(sanitizedLogs));
      
      // Auto-sanitize existing badges to make sure ev_pioneer is unlocked for the active family profile
      const parsedBadges = JSON.parse(localStorage.getItem('zr_badges') || '[]');
      const activeFamilyId = JSON.parse(localProfile).id;
      if (activeFamilyId && !parsedBadges.some((b: any) => b.badgeKey === 'ev_pioneer')) {
        parsedBadges.push({
          id: `badge_ev_migrated_${Date.now()}`,
          familyId: activeFamilyId,
          badgeKey: 'ev_pioneer',
          earnedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          treeUnlocked: true
        });
        localStorage.setItem('zr_badges', JSON.stringify(parsedBadges));
      }
      setBadges(parsedBadges);
      
      setWeeklyPlans(JSON.parse(localStorage.getItem('zr_weekly_plans') || '[]'));
      setNudgeAlert(JSON.parse(localStorage.getItem('zr_nudge') || 'null'));
      setLeaderboard(JSON.parse(localStorage.getItem('zr_leaderboard') || '[]'));
    } else {
      // Setup default mock data
      localStorage.setItem('zr_profile', JSON.stringify(defaultProfile));
      localStorage.setItem('zr_members', JSON.stringify(defaultMembers));
      localStorage.setItem('zr_vehicles', JSON.stringify(defaultVehicles));
      
      const logs = generateMockLogsForMembers(DEFAULT_FAMILY_ID, defaultMembers, defaultVehicles);
      localStorage.setItem('zr_logs', JSON.stringify(logs));
      
      // Seed first badges (First Log and EV Pioneer)
      const firstBadge: Badge = {
        id: 'badge_1',
        familyId: DEFAULT_FAMILY_ID,
        badgeKey: 'first_log',
        earnedAt: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(),
        treeUnlocked: true,
      };
      const evBadge: Badge = {
        id: 'badge_2',
        familyId: DEFAULT_FAMILY_ID,
        badgeKey: 'ev_pioneer',
        earnedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        treeUnlocked: true,
      };
      const initialBadges = [firstBadge, evBadge];
      localStorage.setItem('zr_badges', JSON.stringify(initialBadges));

      // Build initial weekly plan
      const MondayOfThisWeek = new Date();
      MondayOfThisWeek.setDate(MondayOfThisWeek.getDate() - ((MondayOfThisWeek.getDay() + 6) % 7)); // get current week Monday
      const weekStartStr = MondayOfThisWeek.toISOString().split('T')[0];
      
      const lastWeekLogs = logs.filter(log => {
        const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > 7 && diffDays <= 14;
      });

      const initialPlan = generateWeeklyPlan(DEFAULT_FAMILY_ID, weekStartStr, lastWeekLogs, defaultMembers, defaultVehicles);
      const initialPlans = [initialPlan];
      localStorage.setItem('zr_weekly_plans', JSON.stringify(initialPlans));

      // Calculate initial nudges
      const initialNudge = evaluateNudges(DEFAULT_FAMILY_ID, logs.filter(log => {
        const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }), logs.filter(log => {
        const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > 7;
      }), defaultProfile.goalPercent, 200);

      localStorage.setItem('zr_nudge', JSON.stringify(initialNudge));

      // Initialize State
      setFamilyProfile(defaultProfile);
      setMembers(defaultMembers);
      setVehicles(defaultVehicles);
      setEmissionLogs(logs);
      setWeeklyPlans(initialPlans);
      setBadges(initialBadges);
      setNudgeAlert(initialNudge);
      
      // Set leaderboard
      const updatedLeaderboard = updateLeaderboardScore(DEFAULT_FAMILY_ID, defaultProfile.name, defaultProfile.neighbourhoodId, logs, initialBadges, defaultVehicles);
      setLeaderboard(updatedLeaderboard);
      localStorage.setItem('zr_leaderboard', JSON.stringify(updatedLeaderboard));
    }
  }, []);

  const updateLeaderboardScore = (
    famId: string,
    famName: string,
    neighId: string,
    logs: EmissionLog[],
    currBadges: Badge[],
    currVehicles: Vehicle[]
  ): LeaderboardEntry[] => {
    // Calculate current week reduction vs. last week
    const thisWeekLogs = logs.filter(log => {
      const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    const lastWeekLogs = logs.filter(log => {
      const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && diffDays <= 14;
    });

    const thisWeekCo2 = thisWeekLogs.reduce((sum, l) => sum + l.co2Kg, 0);
    const lastWeekCo2 = lastWeekLogs.reduce((sum, l) => sum + l.co2Kg, 0);
    
    let reductionPercent = 0;
    let co2Saved = 0;

    if (lastWeekCo2 > 0) {
      co2Saved = lastWeekCo2 - thisWeekCo2;
      reductionPercent = (co2Saved / lastWeekCo2) * 100;
    }

    // EV Bonus multiplier (extra 3% for EV owners as per PRD)
    const hasEv = currVehicles.some(v => v.type === 'ev');
    if (hasEv && reductionPercent > 0) {
      reductionPercent += 3.0;
    }

    const myEntry: LeaderboardEntry = {
      familyId: famId,
      familyName: famName,
      neighbourhoodId: neighId,
      reductionPercent: Number(reductionPercent.toFixed(1)),
      co2Saved: Number(co2Saved.toFixed(1)),
      badges: currBadges.map(b => b.badgeKey),
      hasEvBadge: hasEv
    };

    // Merge and sort
    const cleanList = defaultLeaderboard.filter(e => e.familyId !== famId);
    const fullList = [...cleanList, myEntry].sort((a, b) => b.reductionPercent - a.reductionPercent);
    
    // Add rank
    return fullList.map((entry, index) => ({
      ...entry,
      weekRank: index + 1
    }));
  };

  const setupFamily = (
    name: string,
    cityId: string,
    neighbourhoodId: string,
    goalPercent: number,
    memberList: { name: string; ageGroup: 'child' | 'teen' | 'adult'; role: string }[],
    vehicleList: { type: 'petrol' | 'diesel' | 'cng' | 'ev'; label: string }[]
  ) => {
    const fId = `fam_${Date.now()}`;
    const newProfile: FamilyProfile = {
      id: fId,
      name,
      creatorUid: 'mem_primary_123',
      cityId,
      neighbourhoodId,
      goalPercent,
      createdAt: new Date().toISOString()
    };

    const newMembers: FamilyMember[] = memberList.map((m, idx) => ({
      id: `mem_${idx}_${Date.now()}`,
      familyId: fId,
      name: m.name,
      ageGroup: m.ageGroup,
      role: m.role
    }));

    const newVehicles: Vehicle[] = vehicleList.map((v, idx) => ({
      id: `veh_${idx}_${Date.now()}`,
      familyId: fId,
      type: v.type,
      label: v.label,
      hasEvBadge: v.type === 'ev'
    }));

    // Generate mock logs for custom family
    const logs = generateMockLogsForMembers(fId, newMembers, newVehicles);
    
    // Seed first badges (First Log and EV Pioneer)
    const firstBadge: Badge = {
      id: `badge_first_${Date.now()}`,
      familyId: fId,
      badgeKey: 'first_log',
      earnedAt: new Date().toISOString(),
      treeUnlocked: true
    };
    const evBadge: Badge = {
      id: `badge_ev_onboard_${Date.now()}`,
      familyId: fId,
      badgeKey: 'ev_pioneer',
      earnedAt: new Date().toISOString(),
      treeUnlocked: true
    };
    const initialBadges = [firstBadge, evBadge];

    // Build initial weekly plan based on generated historical data
    const MondayOfThisWeek = new Date();
    MondayOfThisWeek.setDate(MondayOfThisWeek.getDate() - ((MondayOfThisWeek.getDay() + 6) % 7));
    const weekStartStr = MondayOfThisWeek.toISOString().split('T')[0];
    
    const lastWeekLogs = logs.filter(log => {
      const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7 && diffDays <= 14;
    });
    const initialPlan = generateWeeklyPlan(fId, weekStartStr, lastWeekLogs, newMembers, newVehicles);
    const initialPlans = [initialPlan];

    // Calculate initial nudges
    const initialNudge = evaluateNudges(fId, logs.filter(log => {
      const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }), logs.filter(log => {
      const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7;
    }), goalPercent, 180);

    localStorage.setItem('zr_profile', JSON.stringify(newProfile));
    localStorage.setItem('zr_members', JSON.stringify(newMembers));
    localStorage.setItem('zr_vehicles', JSON.stringify(newVehicles));
    localStorage.setItem('zr_logs', JSON.stringify(logs));
    localStorage.setItem('zr_badges', JSON.stringify(initialBadges));
    localStorage.setItem('zr_weekly_plans', JSON.stringify(initialPlans));
    localStorage.setItem('zr_nudge', JSON.stringify(initialNudge));

    setFamilyProfile(newProfile);
    setMembers(newMembers);
    setVehicles(newVehicles);
    setEmissionLogs(logs);
    setWeeklyPlans(initialPlans);
    setBadges(initialBadges);
    setNudgeAlert(initialNudge);

    // Initialise leaderboard for new neighborhood using generated scores
    const initialLeaderboard = updateLeaderboardScore(fId, name, neighbourhoodId, logs, initialBadges, newVehicles);
    setLeaderboard(initialLeaderboard);
    localStorage.setItem('zr_leaderboard', JSON.stringify(initialLeaderboard));
  };

  const addLog = (log: Omit<EmissionLog, 'id' | 'co2Kg' | 'familyId'>) => {
    if (!familyProfile) return;

    const roundedValue = Math.round(log.value * 10) / 10;
    const computedCo2 = calculateEmissions(log.subType, roundedValue);
    const newLog: EmissionLog = {
      ...log,
      value: roundedValue,
      id: `log_${Date.now()}`,
      familyId: familyProfile.id,
      co2Kg: computedCo2
    };

    const updatedLogs = [newLog, ...emissionLogs];
    setEmissionLogs(updatedLogs);
    localStorage.setItem('zr_logs', JSON.stringify(updatedLogs));

    // Check & Unlock First Log Badge
    let updatedBadges = [...badges];
    if (!updatedBadges.some(b => b.badgeKey === 'first_log')) {
      const firstLogBadge: Badge = {
        id: `badge_first_${Date.now()}`,
        familyId: familyProfile.id,
        badgeKey: 'first_log',
        earnedAt: new Date().toISOString(),
        treeUnlocked: true
      };
      updatedBadges = [firstLogBadge, ...updatedBadges];
      triggerBadgeNotification('first_log', familyProfile.id);
    }

    // Check EV Pioneer Badge (5 EV trips)
    if (log.subType === 'car_ev') {
      const evTripsCount = updatedLogs.filter(l => l.subType === 'car_ev').length;
      if (evTripsCount >= 5 && !updatedBadges.some(b => b.badgeKey === 'ev_pioneer')) {
        const evBadge: Badge = {
          id: `badge_ev_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'ev_pioneer',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        };
        updatedBadges = [...updatedBadges, evBadge];
        triggerBadgeNotification('ev_pioneer', familyProfile.id);
      }
    }

    // Check Bus Champion (School bus/Public transit >= 3 times in a week)
    const transitSubtypes = ['school_bus', 'metro_train', 'auto_rickshaw'];
    if (transitSubtypes.includes(log.subType)) {
      const thisWeekTransitCount = updatedLogs.filter(l => {
        const diffDays = (Date.now() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 7 && transitSubtypes.includes(l.subType);
      }).length;

      if (thisWeekTransitCount >= 3 && !updatedBadges.some(b => b.badgeKey === 'bus_champion')) {
        const busBadge: Badge = {
          id: `badge_bus_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'bus_champion',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        };
        updatedBadges = [...updatedBadges, busBadge];
        triggerBadgeNotification('bus_champion', familyProfile.id);
      }
    }

    // Check Full Team Badge (All members log something in the week)
    const activeMembersLogged = new Set(
      updatedLogs
        .filter(l => {
          const diffDays = (Date.now() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
          return diffDays <= 7;
        })
        .map(l => l.memberId)
    );
    if (activeMembersLogged.size === members.length && !updatedBadges.some(b => b.badgeKey === 'full_team')) {
      const fullTeamBadge: Badge = {
        id: `badge_team_${Date.now()}`,
        familyId: familyProfile.id,
        badgeKey: 'full_team',
        earnedAt: new Date().toISOString(),
        treeUnlocked: true
      };
      updatedBadges = [...updatedBadges, fullTeamBadge];
      triggerBadgeNotification('full_team', familyProfile.id);
    }

    // Check Cool It Badge (AC average < 4 hours per day in the last 7 days)
    const acLogs = updatedLogs.filter(l => {
      const diffDays = (Date.now() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7 && l.subType === 'ac';
    });
    if (acLogs.length > 0) {
      const totalAcHours = acLogs.reduce((sum, l) => sum + l.value, 0);
      const avgAcHours = totalAcHours / 7;
      if (avgAcHours < 4 && !updatedBadges.some(b => b.badgeKey === 'cool_it')) {
        const coolBadge: Badge = {
          id: `badge_cool_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'cool_it',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        };
        updatedBadges = [...updatedBadges, coolBadge];
        triggerBadgeNotification('cool_it', familyProfile.id);
      }
    }

    // Check On a Roll (Goal hit for 3 consecutive weeks)
    const getWeekLogs = (weekIdx: number) => {
      const nowMs = Date.now();
      const minDays = weekIdx * 7;
      const maxDays = (weekIdx + 1) * 7;
      return updatedLogs.filter(l => {
        const diffDays = (nowMs - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > minDays && diffDays <= maxDays;
      });
    };

    const getOlderLogs = (weekIdx: number) => {
      const nowMs = Date.now();
      const minDays = (weekIdx + 1) * 7;
      return updatedLogs.filter(l => {
        const diffDays = (nowMs - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
        return diffDays > minDays;
      });
    };

    const calculateWeekReduction = (w: number) => {
      const wLogs = getWeekLogs(w);
      const wCo2 = wLogs.reduce((sum, l) => sum + l.co2Kg, 0);

      const oldLogs = getOlderLogs(w);
      let baseCo2 = 180;
      if (oldLogs.length > 0) {
        const totalOldCo2 = oldLogs.reduce((sum, l) => sum + l.co2Kg, 0);
        const oldestLogDate = new Date(oldLogs[oldLogs.length - 1].date);
        const diffDays = (Date.now() - oldestLogDate.getTime()) / (1000 * 60 * 60 * 24);
        const olderWeeks = Math.max(1, Math.ceil((diffDays - (w + 1) * 7) / 7));
        baseCo2 = totalOldCo2 / olderWeeks;
      }

      if (baseCo2 <= 0) return false;
      const reduction = ((baseCo2 - wCo2) / baseCo2) * 100;
      return wLogs.length > 0 && reduction >= familyProfile.goalPercent;
    };

    const week0Hit = calculateWeekReduction(0);
    const week1Hit = calculateWeekReduction(1);
    const week2Hit = calculateWeekReduction(2);
    if (week0Hit && week1Hit && week2Hit && !updatedBadges.some(b => b.badgeKey === 'on_a_roll')) {
      const streakBadge: Badge = {
        id: `badge_streak_${Date.now()}`,
        familyId: familyProfile.id,
        badgeKey: 'on_a_roll',
        earnedAt: new Date().toISOString(),
        treeUnlocked: true
      };
      updatedBadges = [...updatedBadges, streakBadge];
      triggerBadgeNotification('on_a_roll', familyProfile.id);
    }

    // Check Green Home (Energy emissions below target for 4 consecutive weeks)
    const getWeekEnergyCo2 = (weekIdx: number) => {
      return getWeekLogs(weekIdx)
        .filter(l => l.category === 'energy')
        .reduce((sum, l) => sum + l.co2Kg, 0);
    };

    const getBaselineEnergyCo2 = (weekIdx: number) => {
      const oldEnergyLogs = getOlderLogs(weekIdx).filter(l => l.category === 'energy');
      let baseEnergy = 90;
      if (oldEnergyLogs.length > 0) {
        const totalOldEnergy = oldEnergyLogs.reduce((sum, l) => sum + l.co2Kg, 0);
        const oldestLogDate = new Date(oldEnergyLogs[oldEnergyLogs.length - 1].date);
        const diffDays = (Date.now() - oldestLogDate.getTime()) / (1000 * 60 * 60 * 24);
        const olderWeeks = Math.max(1, Math.ceil((diffDays - (weekIdx + 1) * 7) / 7));
        baseEnergy = totalOldEnergy / olderWeeks;
      }
      return baseEnergy;
    };

    const isWeekEnergyBelowTarget = (weekIdx: number) => {
      const wEnergy = getWeekEnergyCo2(weekIdx);
      const baseEnergy = getBaselineEnergyCo2(weekIdx);
      const targetEnergy = baseEnergy * (1 - familyProfile.goalPercent / 100);
      const hasEnergyLogs = getWeekLogs(weekIdx).some(l => l.category === 'energy');
      return hasEnergyLogs && wEnergy <= targetEnergy;
    };

    const energy0Below = isWeekEnergyBelowTarget(0);
    const energy1Below = isWeekEnergyBelowTarget(1);
    const energy2Below = isWeekEnergyBelowTarget(2);
    const energy3Below = isWeekEnergyBelowTarget(3);
    if (energy0Below && energy1Below && energy2Below && energy3Below && !updatedBadges.some(b => b.badgeKey === 'green_home')) {
      const greenHomeBadge: Badge = {
        id: `badge_gh_${Date.now()}`,
        familyId: familyProfile.id,
        badgeKey: 'green_home',
        earnedAt: new Date().toISOString(),
        treeUnlocked: true
      };
      updatedBadges = [...updatedBadges, greenHomeBadge];
      triggerBadgeNotification('green_home', familyProfile.id);
    }

    // Save badges using helper which also checks forest_keeper
    updatedBadges = updateAndSaveBadges(updatedBadges, familyProfile.id);

    // Recalculate Nudges
    const currentWeekLogs = updatedLogs.filter(l => {
      const diffDays = (Date.now() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
    const historicalLogs = updatedLogs.filter(l => {
      const diffDays = (Date.now() - new Date(l.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays > 7;
    });

    // Assume 180 kg as a placeholder baseline
    const newNudge = evaluateNudges(familyProfile.id, currentWeekLogs, historicalLogs, familyProfile.goalPercent, 180);
    setNudgeAlert(newNudge);
    localStorage.setItem('zr_nudge', JSON.stringify(newNudge));

    // Recalculate leaderboard
    let finalLeaderboard = updateLeaderboardScore(familyProfile.id, familyProfile.name, familyProfile.neighbourhoodId, updatedLogs, updatedBadges, vehicles);

    // Check Society Topper Badge (Ranked #1 on neighbourhood leaderboard)
    const myRank = finalLeaderboard.find(e => e.familyId === familyProfile.id)?.weekRank;
    if (myRank === 1 && !updatedBadges.some(b => b.badgeKey === 'society_topper')) {
      const topperBadge: Badge = {
        id: `badge_topper_${Date.now()}`,
        familyId: familyProfile.id,
        badgeKey: 'society_topper',
        earnedAt: new Date().toISOString(),
        treeUnlocked: true
      };
      updatedBadges = [...updatedBadges, topperBadge];
      updatedBadges = updateAndSaveBadges(updatedBadges, familyProfile.id);

      // Recalculate leaderboard with new badge list
      finalLeaderboard = updateLeaderboardScore(familyProfile.id, familyProfile.name, familyProfile.neighbourhoodId, updatedLogs, updatedBadges, vehicles);
    }

    setLeaderboard(finalLeaderboard);
    localStorage.setItem('zr_leaderboard', JSON.stringify(finalLeaderboard));
  };

  const markSuggestionCompleted = (suggestionId: string) => {
    if (!familyProfile || weeklyPlans.length === 0) return;

    const activePlan = { ...weeklyPlans[0] };
    const suggestionIndex = activePlan.suggestions.findIndex(s => s.id === suggestionId);

    if (suggestionIndex > -1) {
      activePlan.suggestions[suggestionIndex].completed = true;
      const key = activePlan.suggestions[suggestionIndex].key;

      // Update state
      const newPlans = [activePlan, ...weeklyPlans.slice(1)];
      setWeeklyPlans(newPlans);
      localStorage.setItem('zr_weekly_plans', JSON.stringify(newPlans));

      // Handle specific suggestion badges (e.g. LED, plants)
      let updatedBadges = [...badges];
      if (key === 'switch_led' && !updatedBadges.some(b => b.badgeKey === 'bright_idea')) {
        updatedBadges.push({
          id: `badge_led_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'bright_idea',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        });
        triggerBadgeNotification('bright_idea', familyProfile.id);
      } else if (key === 'indoor_plants' && !updatedBadges.some(b => b.badgeKey === 'plant_parent')) {
        updatedBadges.push({
          id: `badge_plant_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'plant_parent',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        });
        triggerBadgeNotification('plant_parent', familyProfile.id);
      }

      // Save badges using helper which also checks forest_keeper
      updatedBadges = updateAndSaveBadges(updatedBadges, familyProfile.id);

      // Recalculate Leaderboard
      let updatedLeaderboard = updateLeaderboardScore(familyProfile.id, familyProfile.name, familyProfile.neighbourhoodId, emissionLogs, updatedBadges, vehicles);

      // Check Society Topper Badge (Ranked #1 on neighbourhood leaderboard)
      const myRank = updatedLeaderboard.find(e => e.familyId === familyProfile.id)?.weekRank;
      if (myRank === 1 && !updatedBadges.some(b => b.badgeKey === 'society_topper')) {
        const topperBadge: Badge = {
          id: `badge_topper_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'society_topper',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        };
        updatedBadges = [...updatedBadges, topperBadge];
        updatedBadges = updateAndSaveBadges(updatedBadges, familyProfile.id);

        // Recalculate leaderboard with new badge list
        updatedLeaderboard = updateLeaderboardScore(familyProfile.id, familyProfile.name, familyProfile.neighbourhoodId, emissionLogs, updatedBadges, vehicles);
      }

      setLeaderboard(updatedLeaderboard);
      localStorage.setItem('zr_leaderboard', JSON.stringify(updatedLeaderboard));
    }
  };

  const markActionCompleted = (memberId: string) => {
    if (!familyProfile || weeklyPlans.length === 0) return;

    const activePlan = { ...weeklyPlans[0] };
    const actionIndex = activePlan.memberActions.findIndex(a => a.memberId === memberId);

    if (actionIndex > -1) {
      activePlan.memberActions[actionIndex].completed = !activePlan.memberActions[actionIndex].completed;

      // Check if all actions are completed -> Goal Getter
      const allDone = activePlan.memberActions.every(a => a.completed);
      let updatedBadges = [...badges];
      
      if (allDone && !updatedBadges.some(b => b.badgeKey === 'goal_getter')) {
        updatedBadges.push({
          id: `badge_goal_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'goal_getter',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        });
        triggerBadgeNotification('goal_getter', familyProfile.id);
      }

      // Update State
      const newPlans = [activePlan, ...weeklyPlans.slice(1)];
      setWeeklyPlans(newPlans);
      localStorage.setItem('zr_weekly_plans', JSON.stringify(newPlans));

      // Save badges using helper which also checks forest_keeper
      updatedBadges = updateAndSaveBadges(updatedBadges, familyProfile.id);

      // Recalculate Leaderboard
      let updatedLeaderboard = updateLeaderboardScore(familyProfile.id, familyProfile.name, familyProfile.neighbourhoodId, emissionLogs, updatedBadges, vehicles);

      // Check Society Topper Badge (Ranked #1 on neighbourhood leaderboard)
      const myRank = updatedLeaderboard.find(e => e.familyId === familyProfile.id)?.weekRank;
      if (myRank === 1 && !updatedBadges.some(b => b.badgeKey === 'society_topper')) {
        const topperBadge: Badge = {
          id: `badge_topper_${Date.now()}`,
          familyId: familyProfile.id,
          badgeKey: 'society_topper',
          earnedAt: new Date().toISOString(),
          treeUnlocked: true
        };
        updatedBadges = [...updatedBadges, topperBadge];
        updatedBadges = updateAndSaveBadges(updatedBadges, familyProfile.id);

        // Recalculate leaderboard with new badge list
        updatedLeaderboard = updateLeaderboardScore(familyProfile.id, familyProfile.name, familyProfile.neighbourhoodId, emissionLogs, updatedBadges, vehicles);
      }

      setLeaderboard(updatedLeaderboard);
      localStorage.setItem('zr_leaderboard', JSON.stringify(updatedLeaderboard));
    }
  };

  const dismissNudge = () => {
    if (nudgeAlert) {
      const updated = { ...nudgeAlert, dismissed: true };
      setNudgeAlert(updated);
      localStorage.setItem('zr_nudge', JSON.stringify(updated));
    }
  };

  const regeneratePlan = () => {
    if (!familyProfile) return;

    // Filter logs for what would represent "last week"
    const lastWeekLogs = emissionLogs.filter(log => {
      const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });

    const startStr = new Date().toISOString().split('T')[0];
    const newPlan = generateWeeklyPlan(familyProfile.id, startStr, lastWeekLogs, members, vehicles);
    const updatedPlans = [newPlan, ...weeklyPlans];
    
    setWeeklyPlans(updatedPlans);
    localStorage.setItem('zr_weekly_plans', JSON.stringify(updatedPlans));
  };

  return (
    <FamilyContext.Provider value={{
      familyProfile,
      members,
      vehicles,
      emissionLogs,
      weeklyPlans,
      badges,
      nudgeAlert,
      leaderboard,
      setupFamily,
      addLog,
      markSuggestionCompleted,
      markActionCompleted,
      dismissNudge,
      regeneratePlan
    }}>
      {children}
      {activeToast && (
        <BadgeToast toast={activeToast} onClose={() => setActiveToast(null)} />
      )}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
