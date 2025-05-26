import { IPerformanceLineChartData } from '@/lib/types';

// Define interfaces for the return types
interface BaseAverages {
  recoveryAvg: number;
  strainAvg: number;
}

interface AllAverages extends BaseAverages {
  hrvAvg: number;
  rhrAvg: number;
  sleepPerformanceAvg: number;
  sleepConsistencyAvg: number;
  sleepEfficiencyAvg: number;
  sleepDurationAvg: number;
  restorativeSleepDurationAvg: number;
  restorativeSleepAvg: number;
}

/**
 * Hook to calculate team averages from metrics data
 * @param metricsData - Current period metrics data
 * @param allMetrics - Whether to calculate all metrics or just recovery and strain
 */
export function useAllTimeDataAverages(
  metricsData: IPerformanceLineChartData[],
  allMetrics: boolean = false
): BaseAverages | AllAverages {
  const calculateAllDataAverages = (data: IPerformanceLineChartData[]) => {
    if (!data || data.length === 0) {
      return allMetrics
        ? {
            recoveryAvg: 0,
            strainAvg: 0,
            hrvAvg: 0,
            rhrAvg: 0,
            sleepPerformanceAvg: 0,
            sleepConsistencyAvg: 0,
            sleepEfficiencyAvg: 0,
            sleepDurationAvg: 0,
            restorativeSleepDurationAvg: 0,
            restorativeSleepAvg: 0,
          }
        : {
            recoveryAvg: 0,
            strainAvg: 0,
          };
    }

    const totalRecovery = data.reduce(
      (sum, item) => sum + (item.recovery_score || 0),
      0
    );
    const totalStrain = data.reduce((sum, item) => sum + (item.strain || 0), 0);

    // Base averages that are always calculated
    const baseResult: BaseAverages = {
      recoveryAvg: Math.round(totalRecovery / data.length),
      strainAvg: Math.round(totalStrain / data.length),
    };

    // If allMetrics is false, return only the base metrics
    if (!allMetrics) {
      return baseResult;
    }

    // Calculate additional metrics only when allMetrics is true
    const totalHrv = data.reduce((sum, item) => sum + (item.hrv || 0), 0);
    const totalRhr = data.reduce((sum, item) => sum + (item.rhr || 0), 0);
    const totalSleepPerformance = data.reduce(
      (sum, item) => sum + (item.sleep_performance || 0),
      0
    );
    const totalSleepConsistency = data.reduce(
      (sum, item) => sum + (item.sleep_consistency || 0),
      0
    );
    const totalSleepEfficiency = data.reduce(
      (sum, item) => sum + (item.sleep_efficiency || 0),
      0
    );
    const totalSleepDuration = data.reduce(
      (sum, item) => sum + (item.sleep_duration || 0),
      0
    );
    const totalRestorativeSleepDuration = data.reduce(
      (sum, item) => sum + (item.restorative_sleep_duration || 0),
      0
    );
    const totalRestorativeSleep = data.reduce(
      (sum, item) => sum + (item.restorative_sleep || 0),
      0
    );

    // Return all metrics
    return {
      ...baseResult,
      hrvAvg: Math.round(totalHrv / data.length),
      rhrAvg: Math.round(totalRhr / data.length),
      sleepPerformanceAvg: Math.round(totalSleepPerformance / data.length),
      sleepConsistencyAvg: Math.round(totalSleepConsistency / data.length),
      sleepEfficiencyAvg: Math.round(totalSleepEfficiency / data.length),
      sleepDurationAvg: Math.round(totalSleepDuration / data.length),
      restorativeSleepDurationAvg: Math.round(
        totalRestorativeSleepDuration / data.length
      ),
      restorativeSleepAvg: Math.round(totalRestorativeSleep / data.length),
    };
  };

  return calculateAllDataAverages(metricsData);
}
