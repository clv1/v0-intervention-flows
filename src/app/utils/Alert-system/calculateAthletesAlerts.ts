import { IAllTimeMetricsAverages } from '@/lib/types';
import { IAlertSystem } from '@/lib/types';
import calculateDeviation from './calculateDeviation';
import { IPeriodAlerts, IPlayerMetrics, IPeriodData, IDeviatingMetric } from './interfaces';

/**
 * Calculate athletes alerts based on deviation from allTimeAverages
 * @param playerPeriodAverages - The player period averages
 * @param allTimeAverages - The all time averages
 * @param alertSystemValues - The alert system values
 * @returns The athletes alerts
 */

const calculateAthletesAlerts = (
  playerPeriodAverages: IPeriodData,
  allTimeAverages: IAllTimeMetricsAverages[],
  alertSystemValues: IAlertSystem[]
): IPeriodAlerts => {
  const periods: ('Today' | 'last7Days' | 'last30Days')[] = ['Today', 'last7Days', 'last30Days'];
  const result: IPeriodAlerts = {
    Today: [],
    last7Days: [],
    last30Days: [],
  };

  // List of metrics to check for deviations
  const metricsToCheck: (keyof IPlayerMetrics)[] = [
    'recovery_score_avg',
    'strain_avg',
    'rhr_avg',
    'hrv_avg',
    'sleep_performance_avg',
    'sleep_consistency_avg',
    'sleep_efficiency_avg',
    'sleep_duration_avg',
    'restorative_sleep_duration_avg',
    'restorative_sleep_avg',
  ];
  // Process each period
  periods.forEach((period) => {
    // Process each athlete with data for this period
    Object.keys(playerPeriodAverages[period]).forEach((athleteIdStr) => {
      const athleteId = parseInt(athleteIdStr);
      const periodData = playerPeriodAverages[period][athleteId];
      const allTimeData = allTimeAverages.find((avg) => avg.athlete_id === athleteId);

      if (!allTimeData) return;

      let maxAlertLevel = 0;
      const deviatingMetrics: IDeviatingMetric[] = [];

      // Check each metric for deviations
      metricsToCheck.forEach((metric) => {
        const currentValue = periodData[metric];
        const avgValue = allTimeData[metric as keyof typeof allTimeData] as number;

        if (currentValue === null || avgValue === undefined) return;
        const athleteAlertSystemValues = alertSystemValues.find((alert) => alert.athlete_id === athleteId);
        // console.log(period, athleteId, metric, currentValue);
        const deviationLevel = calculateDeviation(currentValue, metric, athleteAlertSystemValues, period);

        // If metric is deviating (alert level 1 or 2), add to the list
        if (deviationLevel >= 1) {
          deviatingMetrics.push({
            metric: metric as string,
            value: currentValue,
            avgValue,
            deviation: deviationLevel,
          });

          // Update max alert level if this metric has a higher deviation
          maxAlertLevel = Math.max(maxAlertLevel, deviationLevel);
        }
      });

      // Add athlete with alert level and deviating metrics to results
      result[period].push({
        athlete_id: athleteId,
        alert: maxAlertLevel,
        deviatingMetrics,
      });
    });
  });

  return result;
};

export default calculateAthletesAlerts;
