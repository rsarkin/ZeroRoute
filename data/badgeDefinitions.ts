export interface BadgeDefinition {
  key: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji representation
  color: string; // Tailwind color class or hex
  condition: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    key: 'first_log',
    title: 'First Log',
    description: 'Logged first carbon footprint activity.',
    icon: '🌱',
    color: 'emerald',
    condition: 'Log your first activity in any category.'
  },
  {
    key: 'goal_getter',
    title: 'Goal Getter',
    description: 'Hit the weekly carbon reduction goal for the first time.',
    icon: '🎯',
    color: 'purple',
    condition: 'Achieve the targeted weekly percentage carbon reduction.'
  },
  {
    key: 'on_a_roll',
    title: 'On a Roll',
    description: 'Hit the weekly carbon reduction goal for 3 consecutive weeks.',
    icon: '🔥',
    color: 'amber',
    condition: 'Maintain a 3-week streak of meeting your carbon reduction goal.'
  },
  {
    key: 'bus_champion',
    title: 'Bus Champion',
    description: 'School bus or public transit used 3 times in one week.',
    icon: '🚌',
    color: 'indigo',
    condition: 'Log 3 or more school bus or public transit trips in a week.'
  },
  {
    key: 'ev_pioneer',
    title: 'EV Pioneer',
    description: 'Logged 5 EV trips.',
    icon: '⚡',
    color: 'sky',
    condition: 'Register at least one EV and log 5 trips.'
  },
  {
    key: 'cool_it',
    title: 'Cool It',
    description: 'Kept AC usage under 4 hours/day for a full week.',
    icon: '❄️',
    color: 'blue',
    condition: 'Average AC run-time of less than 4 hours per day for a week.'
  },
  {
    key: 'green_home',
    title: 'Green Home',
    description: 'Energy emissions remained below target for 4 consecutive weeks.',
    icon: '🌿',
    color: 'green',
    condition: 'Keep energy-based emissions below target for 4 consecutive weeks.'
  },
  {
    key: 'society_topper',
    title: 'Society Topper',
    description: 'Ranked #1 on your neighbourhood leaderboard.',
    icon: '🏆',
    color: 'yellow',
    condition: 'Reach the top position on your community leaderboard.'
  },
  {
    key: 'forest_keeper',
    title: 'Forest Keeper',
    description: 'Grew 5 new trees in your family forest.',
    icon: '🌳',
    color: 'teal',
    condition: 'Earn any 5 badges (each badge plants a tree).'
  },
  {
    key: 'bright_idea',
    title: 'Bright Idea',
    description: 'Completed the LED light switch suggestion.',
    icon: '💡',
    color: 'orange',
    condition: 'Mark the "Switch to LED" action as done in your weekly plan.'
  },
  {
    key: 'plant_parent',
    title: 'Plant Parent',
    description: 'Added indoor plants to the home.',
    icon: '🪴',
    color: 'emerald',
    condition: 'Mark the "Place 3 air-purifying indoor plants" action as done.'
  },
  {
    key: 'full_team',
    title: 'Full Team',
    description: 'All family members logged at least one activity in the same week.',
    icon: '👨‍👩‍👧‍👦',
    color: 'rose',
    condition: 'Have every registered family member log an activity during the week.'
  }
];
