import {
  DateRange,
  IAllTimeMetricsAverages,
  IPerformanceLineChartData,
} from '@/lib/types';

/**
 * Calculates the average of a specific metric from an array of data points
 */
function calculateAverage(
  data: IPerformanceLineChartData[],
  metricKey: 'recovery_score' | 'strain'
): number {
  if (!data || data.length === 0) return 0;

  const validValues = data
    .map((item) => item[metricKey])
    .filter((value): value is number => value !== null && value !== undefined);

  if (validValues.length === 0) return 0;

  const sum = validValues.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / validValues.length).toFixed(2));
}

export function formatAthleteCalendarData(
  athleteName: string,
  athleteId: number,
  metricsData: IPerformanceLineChartData[],
  previousMetricsData: IPerformanceLineChartData[],
  allTimeAverages: IAllTimeMetricsAverages[],
  periodString: string | string[] = [],
  previousPeriodString: string | string[] = []
): string {
  // Calculate averages for current period
  const recoveryAvg = calculateAverage(metricsData, 'recovery_score');
  const strainAvg = calculateAverage(metricsData, 'strain');

  const athleteAllTimeAvg = allTimeAverages.find(
    (avg) => avg.athlete_id === athleteId
  );

  // Calculate averages for previous period
  const prevRecoveryAvg = calculateAverage(
    previousMetricsData,
    'recovery_score'
  );
  const prevStrainAvg = calculateAverage(previousMetricsData, 'strain');

  return `
    Athlete: ${athleteName}
      - ${periodString[0]} to ${periodString[periodString.length - 1]}:
        - Recovery: ${recoveryAvg}
        - Workload: ${strainAvg}
      - ${previousPeriodString[0]} to ${
    previousPeriodString[previousPeriodString.length - 1]
  }:
        - Recovery: ${prevRecoveryAvg}
        - Workload: ${prevStrainAvg}
      - All-time:
        - Recovery: ${Math.round((athleteAllTimeAvg?.recovery_score_avg ?? 0) / 100 * 21)}
        - Workload: ${Math.round((athleteAllTimeAvg?.strain_avg ?? 0) / 100 * 21)}
  `;
}
