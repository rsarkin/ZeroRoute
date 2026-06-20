import { useFamily } from '../providers/FamilyProvider';
import { EmissionLog } from '../types';

interface UseEmissionLoggerReturn {
  addLog: (log: Omit<EmissionLog, 'id' | 'familyId' | 'co2Kg'>) => void;
  allLogs: EmissionLog[];
  currentWeekLogs: EmissionLog[];
  getLogsByCategory: (logsToGroup?: EmissionLog[]) => Record<string, number>;
}

export function useEmissionLogger(): UseEmissionLoggerReturn {
  const { addLog, emissionLogs } = useFamily();

  // Helper to get logs for the current week (last 7 days)
  const getCurrentWeekLogs = (): EmissionLog[] => {
    return emissionLogs.filter((log) => {
      const diffDays = (Date.now() - new Date(log.date).getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    });
  };

  // Helper to get logs grouped by category for charting
  const getLogsByCategory = (logsToGroup: EmissionLog[] = emissionLogs): Record<string, number> => {
    const categories: Record<string, number> = { energy: 0, transport: 0 };
    logsToGroup.forEach((l) => {
      if (categories[l.category] !== undefined) {
        categories[l.category] += l.co2Kg;
      }
    });
    return categories;
  };

  return {
    addLog,
    allLogs: emissionLogs,
    currentWeekLogs: getCurrentWeekLogs(),
    getLogsByCategory,
  };
}
