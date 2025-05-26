'use client';

import { DateRange, IPerformanceLineChartData, IAllTimeMetricsAverages } from '@/lib/types';
import { useEffect, useState } from 'react';

interface MetricsData {
  recoveryAverage: number | null;
  workloadAverage: number | null;
  rhrAverage: number | null;
  hrvAverage: number | null;
  sleepPerformanceAverage: number | null;
  sleepConsistencyAverage: number | null;
  sleepEfficiencyAverage: number | null;
  sleepDurationAverage: number | null;
  restorativeSleepDurationAverage: number | null;
  restorativeSleepAverage: number | null;
  previousRecoveryAverages: number | null;
  previousWorkloadAverages: number | null;
  previousRHRAverages: number | null;
  previousHRVAverages: number | null;
  previousSleepPerformanceAverages: number | null;
  previousSleepConsistencyAverages: number | null;
  previousSleepEfficiencyAverages: number | null;
  previousSleepDurationAverages: number | null;
  previousRestorativeSleepDurationAverages: number | null;
  previousRestorativeSleepAverages: number | null;
  allTimeRecoveryAverage: number | null;
  allTimeWorkloadAverage: number | null;
  allTimeRHRAverage: number | null;
  allTimeHRVAverage: number | null;
  allTimeSleepPerformanceAverage: number | null;
  allTimeSleepConsistencyAverage: number | null;
  allTimeSleepEfficiencyAverage: number | null;
  allTimeSleepDurationAverage: number | null;
  allTimeRestorativeSleepDurationAverage: number | null;
  allTimeRestorativeSleepAverage: number | null;
}

export default function AIAnalysis({
  metrics,
  previousPeriodMetrics,
  allTimeAverages,
  period
}: {
  metrics: IPerformanceLineChartData[],
  previousPeriodMetrics: IPerformanceLineChartData[],
  allTimeAverages: IAllTimeMetricsAverages | null,
  period: DateRange
}) {
  const [analysis, setAnalysis] = useState<string>('Loading analysis...');

  // Calculate period length and previous period
  const periodLengthInDays = Math.floor(
    (new Date(period.end).getTime() - new Date(period.start).getTime()) /
    (1000 * 60 * 60 * 24)
  ) + 1; // Add 1 to include both start and end dates
  // Establish previous period date range
  const previousPeriod = {
    start: new Date(new Date(period.start).getTime() - (periodLengthInDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    end: new Date(new Date(period.end).getTime() - (periodLengthInDays * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
  };

  useEffect(() => {
    const calculateAverage = (arr: (number | null)[]) => {
      const validValues = arr
        .filter((val): val is number => val !== null && !isNaN(val) && val !== 0);

      if (validValues.length === 0) return null;
      return Number((validValues.reduce((a, b) => a + b, 0) / validValues.length).toFixed(2));
    };

    // Calculate current period averages
    const currentPeriodAverages = {
      recoveryAverage: calculateAverage(metrics.map(metric => metric.recovery_score)),
      workloadAverage: calculateAverage(metrics.map(metric => metric.strain)),
      rhrAverage: calculateAverage(metrics.map(metric => metric.rhr)),
      hrvAverage: calculateAverage(metrics.map(metric => metric.hrv)),
      sleepPerformanceAverage: calculateAverage(metrics.map(metric => metric.sleep_performance)),
      sleepConsistencyAverage: calculateAverage(metrics.map(metric => metric.sleep_consistency)),
      sleepEfficiencyAverage: calculateAverage(metrics.map(metric => metric.sleep_efficiency)),
      sleepDurationAverage: calculateAverage(metrics.map(metric => metric.sleep_duration)),
      restorativeSleepDurationAverage: calculateAverage(metrics.map(metric => metric.restorative_sleep_duration)),
      restorativeSleepAverage: calculateAverage(metrics.map(metric => metric.restorative_sleep)),
    };

    // Calculate previous period averages
    const previousPeriodAverages = {
      previousRecoveryAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.recovery_score)),
      previousWorkloadAverages: (() => {
        const avg = calculateAverage(previousPeriodMetrics.map(metric => metric.strain));
        return avg !== null ? avg * (100 / 21) : null;
      })(),
      previousRHRAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.rhr)),
      previousHRVAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.hrv)),
      previousSleepPerformanceAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.sleep_performance)),
      previousSleepConsistencyAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.sleep_consistency)),
      previousSleepEfficiencyAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.sleep_efficiency)),
      previousSleepDurationAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.sleep_duration)),
      previousRestorativeSleepDurationAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.restorative_sleep_duration)),
      previousRestorativeSleepAverages: calculateAverage(previousPeriodMetrics.map(metric => metric.restorative_sleep)),
    };

    // Get all-time averages
    const allTimeMetricsAverages = allTimeAverages ? {
      allTimeRecoveryAverage: allTimeAverages.recovery_score_avg || null,
      allTimeWorkloadAverage: allTimeAverages.strain_avg || null,
      allTimeRHRAverage: allTimeAverages.rhr_avg || null,
      allTimeHRVAverage: allTimeAverages.hrv_avg || null,
      allTimeSleepPerformanceAverage: allTimeAverages.sleep_performance_avg || null,
      allTimeSleepConsistencyAverage: allTimeAverages.sleep_consistency_avg || null,
      allTimeSleepEfficiencyAverage: allTimeAverages.sleep_efficiency_avg || null,
      allTimeSleepDurationAverage: allTimeAverages.sleep_duration_avg ? allTimeAverages.sleep_duration_avg / 3600000 : null,
      allTimeRestorativeSleepDurationAverage: allTimeAverages.restorative_sleep_duration_avg ? allTimeAverages.restorative_sleep_duration_avg / 3600000 : null,
      allTimeRestorativeSleepAverage: allTimeAverages.restorative_sleep_avg || null,
    } : {
      allTimeRecoveryAverage: null,
      allTimeWorkloadAverage: null,
      allTimeRHRAverage: null,
      allTimeHRVAverage: null,
      allTimeSleepPerformanceAverage: null,
      allTimeSleepConsistencyAverage: null,
      allTimeSleepEfficiencyAverage: null,
      allTimeSleepDurationAverage: null,
      allTimeRestorativeSleepDurationAverage: null,
      allTimeRestorativeSleepAverage: null,
    };

    // Combine all metrics data
    const metricsData: MetricsData = {
      ...currentPeriodAverages,
      ...previousPeriodAverages,
      ...allTimeMetricsAverages
    };

    const fetchAnalysis = async () => {
      try {
        const response = await fetch('/api/openAIPerfPage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            metrics: metricsData,
            selectedPeriod: period,
            periodLengthInDays: periodLengthInDays,
            previousPeriod: previousPeriod
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setAnalysis(`Unable to generate analysis: ${data.details || data.error}`);
          return;
        }

        if (data.error) {
          setAnalysis(`Error: ${data.details || data.error}`);
          return;
        }

        setAnalysis(data.analysis);
      } catch (error) {
        console.error('AI Analysis error:', error);
        setAnalysis('Unable to generate analysis at this time. Please try again later.');
      }
    };

    fetchAnalysis();
  }, [metrics, previousPeriodMetrics, allTimeAverages, period]);

  return (
    <div className="text-white w-100">
      {analysis.split('\n').map((line, index) => (
        <p key={index} className="w-100">{line}</p>
      ))}
    </div>
  );
} 