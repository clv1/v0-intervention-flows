'use client'

import { useDateRangePeriod } from '@/hooks/useDateRangePeriod';
import { useFetchFromAllTimeMetrics } from '@/hooks/useFetchFromAllTimeMetrics';
import { IAllTimeMetrics, IAllTimeMetricsAverages, IAthlete, IPerformanceLineChartData } from '@/lib/types';
import { usePeriodStats } from '@/store/usePeriodStats';
import { useParams } from 'next/navigation';
import AIAnalysis from '../../../components/AIAnalysis';
import './AISummary.css';

export default function AISummary({
  metrics,
  allTimeMetrics,
  allTimeMetricsAverages,
  athletes
}: {
  metrics: IPerformanceLineChartData[],
  allTimeMetrics: IAllTimeMetrics[],
  allTimeMetricsAverages: IAllTimeMetricsAverages[],
  athletes: IAthlete[]
}) {
  const { id } = useParams();
  const { getPeriodFromDateRange } = useDateRangePeriod();

  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const previousSelectedPeriod = usePeriodStats(state => state.previousSelectedPeriod);
  const periodString = getPeriodFromDateRange(selectedPeriod);
  const previousPeriodString = getPeriodFromDateRange(previousSelectedPeriod);

  const { metricsData, previousMetricsData } = useFetchFromAllTimeMetrics(athletes);

  // Determine which data source to use based on periodString type
  const filteredMetrics = Array.isArray(periodString)
    ? metricsData.filter(item => item.athlete_id === Number(id)).map(item => ({
      ...item,
      strain: item.strain !== null ? item.strain * (100 / 21) : null
    }))
    : metrics?.filter(item =>
      item.time_window === periodString &&
      item.athlete_id === Number(id)
    ) ?? [];

  // Calculate previous period metrics
  let previousPeriodMetrics;

  if (Array.isArray(periodString)) {
    // For custom date ranges, use the previousMetricsData from useFetchFromAllTimeMetrics
    const filteredPreviousData = previousMetricsData.filter(item => item.athlete_id === Number(id));
    previousPeriodMetrics = filteredPreviousData;
  } else {
    // For predefined periods (string), we need to filter allTimeMetrics by the previousPeriodString dates
    // Convert the date strings in previousPeriodString to ISO format for comparison with allTimeMetrics.label
    const previousPeriodDates = Array.isArray(previousPeriodString) ? previousPeriodString.map(dateStr => {
      const [datePart] = dateStr.split(' ');
      return new Date(`${datePart}T00:00:00.000Z`).toISOString();
    }) : [];

    // Filter allTimeMetrics where label matches any of the previousPeriodDates
    const filteredPreviousMetrics = allTimeMetrics.filter(item => {
      // Check if the athlete ID matches
      const athleteMatch = item.athlete_id === Number(id);

      // Check if the label matches any of the previousPeriodDates
      // Need to handle the different date formats
      const dateMatch = previousPeriodDates.some(date => {
        // Convert both to Date objects for comparison
        const itemDate = new Date(item.label).toISOString();
        const periodDate = new Date(date).toISOString();
        return itemDate.split('T')[0] === periodDate.split('T')[0];
      });

      return athleteMatch && dateMatch;
    });

    // Add time_window property to match IPerformanceLineChartData interface
    previousPeriodMetrics = filteredPreviousMetrics.map(item => ({
      ...item,
      time_window: periodString // Add the missing time_window property
    })) as IPerformanceLineChartData[];
  }

  // Get all-time averages for this athlete
  const allTimeAverages = allTimeMetricsAverages
    .filter(item => item.athlete_id === Number(id))[0] || null;

  return (
    <div id="ai-summary-performance-page" className='d-flex gap-2 flex-column align-items-start'>
      <div className='d-flex gap-2 flex-column align-items-center w-100 h-100'>
        <p id="title" style={{ color: 'white' }}>AI Summary</p>
        <div id="content" className='d-flex gap-2 flex-column align-items-start justify-content-left w-100'>
          <AIAnalysis
            metrics={filteredMetrics}
            previousPeriodMetrics={previousPeriodMetrics}
            allTimeAverages={allTimeAverages}
            period={selectedPeriod}
          />
        </div>
      </div>
    </div >
  );
}