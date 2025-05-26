import { IAlertSystem } from '@/lib/types';
import { IFilteredAlertSystem } from './interfaces';

const threeMonthMapping: Record<string, { avg: string; stdDev: string }> = {
  recovery_score_avg: {
    avg: 'recovery_score_three_month_avg',
    stdDev: 'recovery_score_three_month_std_dev',
  },
  strain_avg: {
    avg: 'strain_three_month_avg',
    stdDev: 'strain_three_month_std_dev',
  },
  rhr_avg: {
    avg: 'rhr_three_month_avg',
    stdDev: 'rhr_three_month_std_dev',
  },
  hrv_avg: {
    avg: 'hrv_three_month_avg',
    stdDev: 'hrv_three_month_std_dev',
  },
  sleep_performance_avg: {
    avg: 'sleep_performance_three_month_avg',
    stdDev: 'sleep_performance_three_month_std_dev',
  },
  sleep_consistency_avg: {
    avg: 'sleep_consistency_three_month_avg',
    stdDev: 'sleep_consistency_three_month_std_dev',
  },
  sleep_efficiency_avg: {
    avg: 'sleep_efficiency_three_month_avg',
    stdDev: 'sleep_efficiency_three_month_std_dev',
  },
  sleep_duration_avg: {
    avg: 'sleep_duration_three_month_avg',
    stdDev: 'sleep_duration_three_month_std_dev',
  },
  restorative_sleep_duration_avg: {
    avg: 'restorative_sleep_duration_three_month_avg',
    stdDev: 'restorative_sleep_duration_three_month_std_dev',
  },
  restorative_sleep_avg: {
    avg: 'restorative_sleep_three_month_avg',
    stdDev: 'restorative_sleep_three_month_std_dev',
  },
};

// Mapping for all-time metric properties
const allTimeMapping: Record<string, { avg: string; stdDev: string }> = {
  recovery_score_avg: {
    avg: 'recovery_score_all_time_avg',
    stdDev: 'recovery_score_all_time_std_dev',
  },
  strain_avg: {
    avg: 'strain_all_time_avg',
    stdDev: 'strain_all_time_std_dev',
  },
  rhr_avg: {
    avg: 'rhr_all_time_avg',
    stdDev: 'rhr_all_time_std_dev',
  },
  hrv_avg: {
    avg: 'hrv_all_time_avg',
    stdDev: 'hrv_all_time_std_dev',
  },
  sleep_performance_avg: {
    avg: 'sleep_performance_all_time_avg',
    stdDev: 'sleep_performance_all_time_std_dev',
  },
  sleep_consistency_avg: {
    avg: 'sleep_consistency_all_time_avg',
    stdDev: 'sleep_consistency_all_time_std_dev',
  },
  sleep_efficiency_avg: {
    avg: 'sleep_efficiency_all_time_avg',
    stdDev: 'sleep_efficiency_all_time_std_dev',
  },
  sleep_duration_avg: {
    avg: 'sleep_duration_all_time_avg',
    stdDev: 'sleep_duration_all_time_std_dev',
  },
  restorative_sleep_duration_avg: {
    avg: 'restorative_sleep_duration_all_time_avg',
    stdDev: 'restorative_sleep_duration_all_time_std_dev',
  },
  restorative_sleep_avg: {
    avg: 'restorative_sleep_all_time_avg',
    stdDev: 'restorative_sleep_all_time_std_dev',
  },
};

/**
 * Calculate the deviation level for an athlete
 * @param currentValue - The current value of the metric
 * @param metricName - The name of the metric
 * @param athleteAlertSystemValues - The alert system values for the athlete
 * @param period - The period of the data
 * @returns The deviation level
 */
const calculateDeviation = (
  currentValue: number | null,
  metricName: string,
  athleteAlertSystemValues: IAlertSystem | undefined,
  period: 'Today' | 'last7Days' | 'last30Days'
): number => {
  if (!athleteAlertSystemValues || currentValue === 0) return 0;
  let periodMetricName;
  if (period === 'last30Days') {
    periodMetricName = allTimeMapping[metricName];
  } else {
    periodMetricName = threeMonthMapping[metricName];
  }
  const averageValue = athleteAlertSystemValues[periodMetricName.avg as keyof IAlertSystem];
  if (currentValue === null) {
    console.log('Value is null', metricName);
    return 0;
  }
  if (metricName === 'strain_avg') return 0;
  if (
    currentValue > averageValue &&
    (metricName === 'recovery_score_avg' ||
      metricName === 'hrv_avg' ||
      metricName === 'sleep_performance_avg' ||
      metricName === 'sleep_consistency_avg' ||
      metricName === 'sleep_efficiency_avg' ||
      metricName === 'sleep_duration_avg' ||
      metricName === 'restorative_sleep_duration_avg' ||
      metricName === 'restorative_sleep_avg')
  ) {
    return 0;
  }
  if (currentValue < averageValue && metricName === 'rhr_avg') return 0;
  const stdDev =
    athleteAlertSystemValues[`${periodMetricName.stdDev.replace('_avg', '_std_dev')}` as keyof IAlertSystem];

  // Calculate how many standard deviations away
  const deviationAmount = Math.abs(currentValue - averageValue) / stdDev;
  // Return alert level: 0 for < 1 std dev, 1 for 1-2 std dev, 2 for > 2 std dev
  if (deviationAmount >= 2) return 2;
  if (deviationAmount >= 1) return 1;
  return 0;
};

/**
 * Filter alert system values based on period
 * @param alertSystemValuesForAthlete - The alert system values for the athlete
 * @param period - The period to filter for
 * @returns The filtered alert system values
 */
export const filterAlertSystemValues = (
  alertSystemValuesForAthlete: IAlertSystem | undefined,
  period: 'last7Days' | 'last30Days'
): IFilteredAlertSystem | undefined => {
  if (!alertSystemValuesForAthlete) return undefined;

  return {
    athlete_id: alertSystemValuesForAthlete.athlete_id,
    team_id: alertSystemValuesForAthlete.team_id,
    ...(period === 'last7Days'
      ? {
          hrv_three_month_avg: alertSystemValuesForAthlete.hrv_three_month_avg,
          hrv_three_month_std_dev: alertSystemValuesForAthlete.hrv_three_month_std_dev,
          recovery_score_three_month_avg: alertSystemValuesForAthlete.recovery_score_three_month_avg,
          recovery_score_three_month_std_dev: alertSystemValuesForAthlete.recovery_score_three_month_std_dev,
          restorative_sleep_three_month_avg: alertSystemValuesForAthlete.restorative_sleep_three_month_avg,
          restorative_sleep_three_month_std_dev: alertSystemValuesForAthlete.restorative_sleep_three_month_std_dev,
          restorative_sleep_duration_three_month_avg:
            alertSystemValuesForAthlete.restorative_sleep_duration_three_month_avg,
          restorative_sleep_duration_three_month_std_dev:
            alertSystemValuesForAthlete.restorative_sleep_duration_three_month_std_dev,
          rhr_three_month_avg: alertSystemValuesForAthlete.rhr_three_month_avg,
          rhr_three_month_std_dev: alertSystemValuesForAthlete.rhr_three_month_std_dev,
          sleep_consistency_three_month_avg: alertSystemValuesForAthlete.sleep_consistency_three_month_avg,
          sleep_consistency_three_month_std_dev: alertSystemValuesForAthlete.sleep_consistency_three_month_std_dev,
          sleep_duration_three_month_avg: alertSystemValuesForAthlete.sleep_duration_three_month_avg,
          sleep_duration_three_month_std_dev: alertSystemValuesForAthlete.sleep_duration_three_month_std_dev,
          sleep_efficiency_three_month_avg: alertSystemValuesForAthlete.sleep_efficiency_three_month_avg,
          sleep_efficiency_three_month_std_dev: alertSystemValuesForAthlete.sleep_efficiency_three_month_std_dev,
          sleep_performance_three_month_avg: alertSystemValuesForAthlete.sleep_performance_three_month_avg,
          sleep_performance_three_month_std_dev: alertSystemValuesForAthlete.sleep_performance_three_month_std_dev,
          strain_three_month_avg: alertSystemValuesForAthlete.strain_three_month_avg,
          strain_three_month_std_dev: alertSystemValuesForAthlete.strain_three_month_std_dev,
        }
      : {
          hrv_all_time_avg: alertSystemValuesForAthlete.hrv_all_time_avg,
          hrv_all_time_std_dev: alertSystemValuesForAthlete.hrv_all_time_std_dev,
          recovery_score_all_time_avg: alertSystemValuesForAthlete.recovery_score_all_time_avg,
          recovery_score_all_time_std_dev: alertSystemValuesForAthlete.recovery_score_all_time_std_dev,
          restorative_sleep_all_time_avg: alertSystemValuesForAthlete.restorative_sleep_all_time_avg,
          restorative_sleep_all_time_std_dev: alertSystemValuesForAthlete.restorative_sleep_all_time_std_dev,
          restorative_sleep_duration_all_time_avg: alertSystemValuesForAthlete.restorative_sleep_duration_all_time_avg,
          restorative_sleep_duration_all_time_std_dev:
            alertSystemValuesForAthlete.restorative_sleep_duration_all_time_std_dev,
          rhr_all_time_avg: alertSystemValuesForAthlete.rhr_all_time_avg,
          rhr_all_time_std_dev: alertSystemValuesForAthlete.rhr_all_time_std_dev,
          sleep_consistency_all_time_avg: alertSystemValuesForAthlete.sleep_consistency_all_time_avg,
          sleep_consistency_all_time_std_dev: alertSystemValuesForAthlete.sleep_consistency_all_time_std_dev,
          sleep_duration_all_time_avg: alertSystemValuesForAthlete.sleep_duration_all_time_avg,
          sleep_duration_all_time_std_dev: alertSystemValuesForAthlete.sleep_duration_all_time_std_dev,
          sleep_efficiency_all_time_avg: alertSystemValuesForAthlete.sleep_efficiency_all_time_avg,
          sleep_efficiency_all_time_std_dev: alertSystemValuesForAthlete.sleep_efficiency_all_time_std_dev,
          sleep_performance_all_time_avg: alertSystemValuesForAthlete.sleep_performance_all_time_avg,
          sleep_performance_all_time_std_dev: alertSystemValuesForAthlete.sleep_performance_all_time_std_dev,
          strain_all_time_avg: alertSystemValuesForAthlete.strain_all_time_avg,
          strain_all_time_std_dev: alertSystemValuesForAthlete.strain_all_time_std_dev,
        }),
  };
};

export default calculateDeviation;
