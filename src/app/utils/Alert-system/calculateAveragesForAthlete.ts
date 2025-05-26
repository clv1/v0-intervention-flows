import { IAllTimeMetrics } from '@/lib/types';
// Define interface for player metrics
interface IPlayerMetrics {
  recovery_score_avg: number | null;
  strain_avg: number | null;
  rhr_avg: number | null;
  hrv_avg: number | null;
  sleep_performance_avg: number | null;
  sleep_consistency_avg: number | null;
  sleep_efficiency_avg: number | null;
  sleep_duration_avg: number | null;
  restorative_sleep_duration_avg: number | null;
  restorative_sleep_avg: number | null;
}

/**
 * Calculate the average for each metric for an athlete
 * @param data - The data to calculate the average for
 * @returns The average for each metric
 */
const calculateAveragesForAthlete = (
  data: IAllTimeMetrics[]
): IPlayerMetrics => {
  // Calculate average for each metric, ignoring null values
  const calcAvg = (
    metric: keyof Omit<
      IAllTimeMetrics,
      'athlete_id' | 'label' | 'sleep_start' | 'sleep_end'
    >
  ) => {
    const validValues = data
      .filter((item) => item[metric] !== null && item[metric] !== undefined)
      .map((item) => item[metric] as number);

    if (validValues.length === 0) return null;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  };

  return {
    recovery_score_avg: calcAvg('recovery_score'),
    strain_avg: calcAvg('strain'),
    rhr_avg: calcAvg('rhr'),
    hrv_avg: calcAvg('hrv'),
    sleep_performance_avg: calcAvg('sleep_performance'),
    sleep_consistency_avg: calcAvg('sleep_consistency'),
    sleep_efficiency_avg: calcAvg('sleep_efficiency'),
    sleep_duration_avg: calcAvg('sleep_duration'),
    restorative_sleep_duration_avg: calcAvg('restorative_sleep_duration'),
    restorative_sleep_avg: calcAvg('restorative_sleep'),
  };
};

export default calculateAveragesForAthlete;
