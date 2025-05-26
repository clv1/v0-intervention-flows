import {
  IRecoveryData,
  IWorkloadData,
  IAllTimeMetricsAverages,
  DateRange,
} from '@/lib/types';

// interface DateRanges {
//   today: DateRange;
//   yesterday: DateRange;
//   last7Days: DateRange;
//   previousLast7Days: DateRange;
//   last30Days: DateRange;
//   previousLast30Days: DateRange;
// }

/**
 * Formats athlete data into a readable string for AI summary
 *
 * @param recoveryMetrics - Array of recovery metrics data
 * @param workloadMetrics - Array of workload metrics data
 * @param allTimeAverages - Array of all-time average metrics
 * @param athleteId - ID of the athlete to format data for
 * @param athleteName - Name of the athlete
 * @returns Formatted string with athlete data
 */
export function formatAthleteData(
  recoveryMetrics: IRecoveryData[],
  workloadMetrics: IWorkloadData[],
  allTimeAverages: IAllTimeMetricsAverages[],
  athleteName: string,
  athleteId: number,
  selectedPeriod: string | string[],
  previousPeriod: string | string[]
  // dateRanges: DateRanges
): string {
  // Filter data for the specific athlete
  const athleteRecoveryMetrics = recoveryMetrics.filter(
    (metric) => metric.athlete_id === athleteId
  );
  const athleteWorkloadMetrics = workloadMetrics.filter(
    (metric) => metric.athlete_id === athleteId
  );
  const athleteAllTimeAvg = allTimeAverages.find(
    (avg) => avg.athlete_id === athleteId
  );

  // Helper function to get metric value by period
  const getMetricValue = (
    metrics: IRecoveryData[] | IWorkloadData[],
    period: string
  ): number => {
    const metric = metrics.find((m) => m.period === period);
    return metric && metric.value !== null ? metric.value : 0;
  };

  // Get recovery and workload values for different periods
  const recovery = getMetricValue(
    athleteRecoveryMetrics,
    selectedPeriod as string
  );
  const previousRecovery = getMetricValue(
    athleteRecoveryMetrics,
    previousPeriod as string
  );
  const workload = getMetricValue(
    athleteWorkloadMetrics,
    selectedPeriod as string
  );
  const previousWorkload = getMetricValue(
    athleteWorkloadMetrics,
    previousPeriod as string
  );

  // const todayRecovery = getMetricValue(athleteRecoveryMetrics, 'today');
  // const prevDayRecovery = getMetricValue(athleteRecoveryMetrics, 'previousDay');

  // const todayWorkload = getMetricValue(athleteWorkloadMetrics, 'today');
  // const prevDayWorkload = getMetricValue(athleteWorkloadMetrics, 'previousDay');

  // const last7DaysRecovery = getMetricValue(athleteRecoveryMetrics, 'last7Days');
  // const prev7DaysRecovery = getMetricValue(
  //   athleteRecoveryMetrics,
  //   'previous7Days'
  // );

  // const last7DaysWorkload = getMetricValue(athleteWorkloadMetrics, 'last7Days');
  // const prev7DaysWorkload = getMetricValue(
  //   athleteWorkloadMetrics,
  //   'previous7Days'
  // );

  // const last30DaysRecovery = getMetricValue(
  //   athleteRecoveryMetrics,
  //   'last30Days'
  // );
  // const prev30DaysRecovery = getMetricValue(
  //   athleteRecoveryMetrics,
  //   'previous30Days'
  // );

  // const last30DaysWorkload = getMetricValue(
  //   athleteWorkloadMetrics,
  //   'last30Days'
  // );
  // const prev30DaysWorkload = getMetricValue(
  //   athleteWorkloadMetrics,
  //   'previous30Days'
  // );

  // Build the formatted string
  return `
    Athlete: ${athleteName}
      - Recovery for ${selectedPeriod}: ${recovery}
      - Recovery for ${previousPeriod}: ${previousRecovery}
      - Workload for ${selectedPeriod}: ${workload}
      - Workload for ${previousPeriod}: ${previousWorkload}
      - All-time Recovery Average: ${
        Math.round((athleteAllTimeAvg?.recovery_score_avg ?? 0) / 100 * 21)
      }
      - All-time Workload Average: ${
        Math.round((athleteAllTimeAvg?.strain_avg ?? 0) / 100 * 21)
      }
  `;
}

// dateRanges.yesterday.end
// }: ${prevDayRecovery}
//     - Recovery for ${dateRanges.last7Days.start} to ${
//   dateRanges.last7Days.end
// }: ${last7DaysRecovery}
//     - Recovery for ${dateRanges.previousLast7Days.start} to ${
//   dateRanges.previousLast7Days.end
// }: ${prev7DaysRecovery}
//     - Recovery for ${dateRanges.last30Days.start} to ${
//   dateRanges.last30Days.end
// }: ${last30DaysRecovery}
//     - Recovery for ${dateRanges.previousLast30Days.start} to ${
//   dateRanges.previousLast30Days.end
// }: ${prev30DaysRecovery}

//     - Workload for ${dateRanges.yesterday.start} to ${
//   dateRanges.yesterday.end
// }: ${prevDayWorkload}
//     - Workload for ${dateRanges.last7Days.start} to ${
//   dateRanges.last7Days.end
// }: ${last7DaysWorkload}
//     - Workload for ${dateRanges.previousLast7Days.start} to ${
//   dateRanges.previousLast7Days.end
// }: ${prev7DaysWorkload}
//     - Workload for ${dateRanges.last30Days.start} to ${
//   dateRanges.last30Days.end
// }: ${last30DaysWorkload}
//     - Workload for ${dateRanges.previousLast30Days.start} to ${
//   dateRanges.previousLast30Days.end
// }: ${prev30DaysWorkload}
