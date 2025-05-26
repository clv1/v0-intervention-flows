'use client'

import { useAllTimeDataAverages } from '@/hooks/useAllTimeDataAverages';
import { useDateRangePeriod } from '@/hooks/useDateRangePeriod';
import { useFetchFromAllTimeMetrics } from '@/hooks/useFetchFromAllTimeMetrics';
import { IAlertSystem, IAllTimeMetrics, IAllTimeMetricsAverages, IAthlete, IPerformanceLineChartData } from '@/lib/types';
import { useCheckboxItemsStore } from '@/store/useCheckboxItemsStore';
import { usePeriodStats } from '@/store/usePeriodStats';
import { useSwitchTogglesStore } from '@/store/useSwitchTogglesStore';
import { filterAlertSystemValues } from '@/utils/Alert-system/calculateDeviation';
import { IPeriodAlerts } from '@/utils/Alert-system/interfaces';
import { MatchDayChartIndicator } from '@components/MatchDayChartIndicator';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import EventsTimelineChart from '../components/EventsTimelineChart';
import { PerformanceBarChart } from '../components/performanceBarChart';
import { PerformanceLineChart } from '../components/performanceLineChart';
import TimeInBedChart from '../components/TimeInBedChart';
import { athleteEvents } from '../../../data/data';
import { athleteMatchDays } from '../../../data/data';
import './charts.css';

// Define the interface for all metrics averages
interface AllAverages {
  recoveryAvg: number;
  strainAvg: number;
  hrvAvg: number;
  rhrAvg: number;
  sleepPerformanceAvg: number;
  sleepConsistencyAvg: number;
  sleepEfficiencyAvg: number;
  sleepDurationAvg: number;
  restorativeSleepDurationAvg: number;
  restorativeSleepAvg: number;
}

interface ProcessedData {
  day: string;
  sleep: [number | null, number | null];
}

export default function Charts({ athletes, metrics, allTimeMetrics, allTimeMetricsAverages, mParam, alertSystemValues, athletesAlerts, athleteEvents, athleteMatchDays }: {
  athletes: IAthlete[],
  metrics: IPerformanceLineChartData[],
  allTimeMetrics: IAllTimeMetrics[],
  allTimeMetricsAverages: IAllTimeMetricsAverages[],
  mParam: string | undefined,
  alertSystemValues: IAlertSystem[],
  athletesAlerts: IPeriodAlerts,
  athleteEvents: any[],
  athleteMatchDays: any[]
}) {
  const { id } = useParams();
  const { getPeriodFromDateRange } = useDateRangePeriod();
  const selectedItems = useCheckboxItemsStore(state => state.selectedItems);
  const { setSelectedItems } = useCheckboxItemsStore();

  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const periodString = getPeriodFromDateRange(selectedPeriod);

  // Get events for the current athlete or use default events
  const sampleEvents = athleteEvents;
  const matchDays = athleteMatchDays;


  const alertSystemValuesForAthlete = alertSystemValues.find(item => item.athlete_id === Number(id));
  const filteredAlertSystemValues = filterAlertSystemValues(alertSystemValuesForAthlete, periodString as 'last7Days' | 'last30Days');
  /// Checking on the period string is 'last6Months'
  let athleteAlert: {
    alert: number;
    athlete_id: number;
    deviationMetrics: Array<{
      metric: string;
      value: number;
      avgValue: number;
      deviation: number;
    }>;
  } = {
    alert: 0,
    athlete_id: Number(id),
    deviationMetrics: []
  };
  if (athletesAlerts[periodString as keyof IPeriodAlerts]) {
    const foundAlert = athletesAlerts[periodString as keyof IPeriodAlerts].find(alert => alert.athlete_id === Number(id));
    if (foundAlert) {
      athleteAlert = {
        alert: foundAlert.alert,
        athlete_id: foundAlert.athlete_id,
        deviationMetrics: foundAlert.deviatingMetrics
          .filter(metric => metric.value !== null)
          .map(metric => ({
            metric: metric.metric,
            value: metric.value as number,
            avgValue: metric.avgValue,
            deviation: metric.deviation
          }))
      };
    }
  }

  // Function to create an array of date strings for a given period
  const createDateArray = (period: { start: string; end: string }): string[] => {
    const dates: string[] = [];
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);

    // Set time to midnight UTC for consistent formatting
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    // Create a new date object to iterate through the range
    const currentDate = new Date(startDate);

    // Loop through each day in the range
    while (currentDate <= endDate) {
      // Format the date string in the required format
      const dateString = currentDate.toISOString().replace('T', ' ').replace('Z', '+00');
      dates.push(dateString);

      // Move to the next day
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    return dates;
  };

  const periodDatesString = createDateArray(selectedPeriod);

  // Remove 'Time In Bed' from selectedItems when periodString is 'last6Months'
  useEffect(() => {
    if (periodString === 'last6Months' && selectedItems.includes('Time In Bed')) {
      setSelectedItems(selectedItems.filter(item => item !== 'Time In Bed'));
    }
  }, [periodString, selectedItems, setSelectedItems]);

  // const { metricsData, previousMetricsData } = useFetchFromAllTimeMetrics(athletes);
  const { metricsData } = useFetchFromAllTimeMetrics(athletes);

  // Determine which data source to use based on periodString type
  const filteredMetrics = Array.isArray(periodString)
    ? metricsData.filter(item => item.athlete_id === Number(id))
    : metrics?.filter(item =>
      item.time_window === periodString &&
      item.athlete_id === Number(id)
    ) ?? [];

  // Fill in missing dates with null values when periodString is an array
  let processedMetrics = filteredMetrics;
  if (Array.isArray(periodString) && periodString.length > 0) {
    // Create a map of existing dates
    const existingDatesMap = new Map();
    filteredMetrics.forEach(item => {
      if (item.label) {
        // Normalize the date format to YYYY-MM-DD
        const dateKey = new Date(item.label).toISOString().split('T')[0];
        existingDatesMap.set(dateKey, item);
      }
    });

    // Create a complete array with all dates in the range
    processedMetrics = [];
    const startDate = new Date(selectedPeriod.start);
    const endDate = new Date(selectedPeriod.end);

    // Set time to midnight for consistent formatting
    startDate.setUTCHours(0, 0, 0, 0);
    endDate.setUTCHours(0, 0, 0, 0);

    // Create a new date object to iterate through the range
    const currentDate = new Date(startDate);

    // Loop through each day in the range
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];

      if (existingDatesMap.has(dateKey)) {
        // Use existing data if available
        processedMetrics.push(existingDatesMap.get(dateKey));
      } else {
        // Create a new entry with null values for all metrics
        processedMetrics.push({
          athlete_id: Number(id),
          time_window: 'custom',
          label: new Date(dateKey).toISOString(),
          recovery_score: null,
          strain: null,
          rhr: null,
          hrv: null,
          sleep_performance: null,
          sleep_consistency: null,
          sleep_efficiency: null,
          sleep_duration: null,
          restorative_sleep_duration: null,
          restorative_sleep: null,
          sleep_start: null,
          sleep_end: null
        });
      }

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  // // Calculate previous period metrics based on whether selectedPeriod is a string or array
  // let previousPeriodMetrics: AllAverages;

  // if (Array.isArray(periodString)) {
  //   // For custom date ranges, use the previousMetricsData from useFetchFromAllTimeMetrics
  //   const filteredPreviousData = previousMetricsData.filter(item => item.athlete_id === Number(id));
  //   previousPeriodMetrics = useAllTimeDataAverages(filteredPreviousData, true) as AllAverages;
  // } else {
  //   // For predefined periods (string), we need to filter allTimeMetrics by the previousPeriodString dates
  //   // Convert the date strings in previousPeriodString to ISO format for comparison with allTimeMetrics.label
  //   const previousPeriodDates = Array.isArray(previousPeriodString) ? previousPeriodString.map(dateStr => {
  //     const [datePart] = dateStr.split(' ');
  //     return new Date(`${datePart}T00:00:00.000Z`).toISOString();
  //   }) : [];

  //   // Filter allTimeMetrics where label matches any of the previousPeriodDates
  //   const filteredPreviousMetrics = allTimeMetrics.filter(item => {
  //     // Check if the athlete ID matches
  //     const athleteMatch = item.athlete_id === Number(id);

  //     // Check if the label matches any of the previousPeriodDates
  //     // Need to handle the different date formats
  //     const dateMatch = previousPeriodDates.some(date => {
  //       // Convert both to Date objects for comparison
  //       const itemDate = new Date(item.label).toISOString();
  //       const periodDate = new Date(date).toISOString();
  //       return itemDate.split('T')[0] === periodDate.split('T')[0];
  //     });

  //     return athleteMatch && dateMatch;
  //   });

  //   // Add time_window property to match IPerformanceLineChartData interface
  //   const adaptedMetrics = filteredPreviousMetrics.map(item => ({
  //     ...item,
  //     time_window: periodString // Add the missing time_window property
  //   })) as IPerformanceLineChartData[];

  //   previousPeriodMetrics = useAllTimeDataAverages(adaptedMetrics, true) as AllAverages;
  // }

  // Calculate current period metrics based on whether selectedPeriod is a string or array
  let currentPeriodMetrics: AllAverages;

  if (Array.isArray(periodString)) {
    // For custom date ranges, use the previousMetricsData from useFetchFromAllTimeMetrics
    const filteredCurrentData = metricsData.filter(item => item.athlete_id === Number(id));
    currentPeriodMetrics = useAllTimeDataAverages(filteredCurrentData, true) as AllAverages;
  } else {
    // For predefined periods (string), we need to filter allTimeMetrics by the currentPeriodString dates
    // Convert the date strings in currentPeriodString to ISO format for comparison with allTimeMetrics.label

    const currentPeriodDates = Array.isArray(periodDatesString) ? periodDatesString.map(dateStr => {
      const [datePart] = dateStr.split(' ');
      return new Date(`${datePart}T00:00:00.000Z`).toISOString();
    }) : [];

    // Filter allTimeMetrics where label matches any of the currentPeriodDates
    const filteredCurrentMetrics = allTimeMetrics.filter(item => {
      // Check if the athlete ID matches
      const athleteMatch = item.athlete_id === Number(id);

      // Check if the label matches any of the previousPeriodDates
      // Need to handle the different date formats
      const dateMatch = currentPeriodDates.some(date => {
        // Convert both to Date objects for comparison
        const itemDate = new Date(item.label).toISOString();
        const periodDate = new Date(date).toISOString();
        return itemDate.split('T')[0] === periodDate.split('T')[0];
      });

      return athleteMatch && dateMatch;
    });

    // Add time_window property to match IPerformanceLineChartData interface
    const adaptedMetrics = filteredCurrentMetrics.map(item => ({
      ...item,
      time_window: periodString // Add the missing time_window property
    })) as IPerformanceLineChartData[];

    currentPeriodMetrics = useAllTimeDataAverages(adaptedMetrics, true) as AllAverages;
  }

  // Helper function to properly handle duration rounding
  const normalizeDurationHours = (milliseconds: number): number => {
    // Convert milliseconds to hours
    const hours = milliseconds / 3600000;

    // Check if the fractional part is very close to 1 (e.g., 3.999... hours)
    // This handles the case where 3hrs 60mins should be 4hrs 0mins
    if (Math.abs(Math.round(hours) - hours) < 0.001) {
      return Math.round(hours);
    }

    return hours;
  };

  const chartData = processedMetrics.map(item => {
    const entry: { [key: string]: string | number | null, name: string } = {
      name: item.label || ''
    };

    // Format the date for x-axis if it's an ISO string (from metricsData)
    if (Array.isArray(periodString) && typeof item.label === 'string' && item.label.includes('T')) {
      try {
        const date = new Date(item.label);
        entry.name = date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }

    // Map each metric to its display name
    if (item.recovery_score !== null) entry['Recovery Score'] = item.recovery_score;
    if (Array.isArray(periodString)) {
      if (item.strain !== null) entry['Strain'] = item.strain * (100 / 21);
    } else {
      if (item.strain !== null) entry['Strain'] = item.strain;
    }
    if (item.rhr !== null) entry['RHR'] = item.rhr;
    if (item.hrv !== null) entry['HRV'] = item.hrv;
    if (item.sleep_performance !== null) entry['Sleep Performance %'] = item.sleep_performance;
    if (item.sleep_consistency !== null) entry['Sleep Consistency %'] = item.sleep_consistency;
    if (item.sleep_efficiency !== null) entry['Sleep Efficiency %'] = item.sleep_efficiency;
    if (Array.isArray(periodString)) {
      if (item.sleep_duration !== null) entry['Sleep Duration'] = normalizeDurationHours(item.sleep_duration);
      if (item.restorative_sleep_duration !== null) entry['Restorative Sleep Duration'] = normalizeDurationHours(item.restorative_sleep_duration);
    } else {
      if (item.sleep_duration !== null) entry['Sleep Duration'] = item.sleep_duration;
      if (item.restorative_sleep_duration !== null) entry['Restorative Sleep Duration'] = item.restorative_sleep_duration;
    }
    if (item.restorative_sleep !== null) entry['Restorative Sleep %'] = item.restorative_sleep;
    if (item.sleep_start !== null) entry['Sleep Start'] = item.sleep_start;
    if (item.sleep_end !== null) entry['Sleep End'] = item.sleep_end;

    return entry;
  });

  // Function to transform data for TimeInBedChart
  const transformTimeInBedData = (data: typeof chartData): ProcessedData[] => {
    return data.map(entry => {
      const sleepStart = entry['Sleep Start'];
      const sleepEnd = entry['Sleep End'];

      if (typeof sleepStart === 'string' && typeof sleepEnd === 'string') {
        const startDate = new Date(sleepStart);
        const endDate = new Date(sleepEnd);

        // Convert to decimal hours using UTC methods
        const startDecimal = startDate.getUTCHours() + startDate.getUTCMinutes() / 60;
        let endDecimal = endDate.getUTCHours() + endDate.getUTCMinutes() / 60;

        // Adjust end time if it's before start time (crosses midnight)
        if (endDecimal < startDecimal) {
          endDecimal += 24;
        }

        return {
          day: entry.name,
          sleep: [startDecimal, endDecimal] as [number, number]
        };
      }
      // Instead of returning null, return an object with null values for sleep
      return {
        day: entry.name,
        sleep: [null, null] as [number | null, number | null]
      };
    });
  };

  // // Format previous period averages data for the charts
  // const formattedPreviousPeriodAverages = [{
  //   name: 'Average',
  //   'Recovery Score': previousPeriodMetrics.recoveryAvg,
  //   'Strain': previousPeriodMetrics.strainAvg * (100 / 21),
  //   'RHR': previousPeriodMetrics.rhrAvg,
  //   'HRV': previousPeriodMetrics.hrvAvg,
  //   'Sleep Performance %': previousPeriodMetrics.sleepPerformanceAvg,
  //   'Sleep Consistency %': previousPeriodMetrics.sleepConsistencyAvg,
  //   'Sleep Efficiency %': previousPeriodMetrics.sleepEfficiencyAvg,
  //   'Sleep Duration': normalizeDurationHours(previousPeriodMetrics.sleepDurationAvg), // Using the helper function
  //   'Restorative Sleep Duration': normalizeDurationHours(previousPeriodMetrics.restorativeSleepDurationAvg), // Using the helper function
  //   'Restorative Sleep %': previousPeriodMetrics.restorativeSleepAvg
  // }];

  // Format current period averages data for the charts
  const formattedCurrentPeriodAverages = [{
    name: 'Average',
    'Recovery Score': currentPeriodMetrics.recoveryAvg,
    'Strain': currentPeriodMetrics.strainAvg * (100 / 21),
    'RHR': currentPeriodMetrics.rhrAvg,
    'HRV': currentPeriodMetrics.hrvAvg,
    'Sleep Performance %': currentPeriodMetrics.sleepPerformanceAvg,
    'Sleep Consistency %': currentPeriodMetrics.sleepConsistencyAvg,
    'Sleep Efficiency %': currentPeriodMetrics.sleepEfficiencyAvg,
    'Sleep Duration': normalizeDurationHours(currentPeriodMetrics.sleepDurationAvg), // Using the helper function
    'Restorative Sleep Duration': normalizeDurationHours(currentPeriodMetrics.restorativeSleepDurationAvg), // Using the helper function
    'Restorative Sleep %': currentPeriodMetrics.restorativeSleepAvg
  }];

  // Format all-time averages data for the charts
  const formattedAllTimeAverages = allTimeMetricsAverages
    .filter(item => item.athlete_id === Number(id))
    .map(item => {
      const entry: { [key: string]: string | number | null, name: string } = {
        name: 'Average'
      };

      // Map each average metric to its display name
      if (item.recovery_score_avg !== undefined) entry['Recovery Score'] = item.recovery_score_avg;
      if (item.strain_avg !== undefined) entry['Strain'] = item.strain_avg;
      if (item.rhr_avg !== undefined) entry['RHR'] = item.rhr_avg;
      if (item.hrv_avg !== undefined) entry['HRV'] = item.hrv_avg;
      if (item.sleep_performance_avg !== undefined) entry['Sleep Performance %'] = item.sleep_performance_avg;
      if (item.sleep_consistency_avg !== undefined) entry['Sleep Consistency %'] = item.sleep_consistency_avg;
      if (item.sleep_efficiency_avg !== undefined) entry['Sleep Efficiency %'] = item.sleep_efficiency_avg;

      // Convert milliseconds to hours for duration metrics
      if (item.sleep_duration_avg !== undefined) {
        // Use the helper function to properly handle rounding
        entry['Sleep Duration'] = normalizeDurationHours(item.sleep_duration_avg);
      }

      if (item.restorative_sleep_duration_avg !== undefined) {
        // Use the helper function to properly handle rounding
        entry['Restorative Sleep Duration'] = normalizeDurationHours(item.restorative_sleep_duration_avg);
      }

      if (item.restorative_sleep_avg !== undefined) {
        entry['Restorative Sleep %'] = item.restorative_sleep_avg;
      }

      return entry;
    });

  // In overlay mode, we need to use the display names directly
  const selectedLineNames = selectedItems;

  const overlayMode = useSwitchTogglesStore(state => state.overlayMode);
  const chartMode = useSwitchTogglesStore(state => state.chartMode);
  const timeInBedData = transformTimeInBedData(chartData);

  // Create a custom MatchDayChartIndicator that includes the match days data
  const CustomMatchDayChartIndicator = (props: any) => {
    return <MatchDayChartIndicator {...props} matchDays={matchDays} />;
  };

  if (overlayMode) {
    // Filter out "Time In Bed" from lineNames when in overlay mode
    const filteredLineNames = selectedLineNames.filter(item => item !== 'Time In Bed');
    const hasTimeInBed = selectedLineNames.includes('Time In Bed');

    // If no metrics are selected, don't render any charts
    if (filteredLineNames.length === 0 && !hasTimeInBed) {
      return null;
    }

    return (
      <div id='charts' className="d-flex flex-column justify-content-center align-items-center">
        <div className="container">
          <EventsTimelineChart
            data={sampleEvents}
            overlay={overlayMode}
            periodString={periodString}
            selectedPeriod={selectedPeriod}
            selectedMetrics={selectedItems}
            chartMode={chartMode}
          />
        </div>
        <div className="container">
          {filteredLineNames.length > 0 && (
            <div className="linechart">
              {chartMode ? (
                <PerformanceBarChart
                  lineNames={filteredLineNames}
                  data={chartData}
                  // previousAverageData={formattedPreviousPeriodAverages}
                  currentAverageData={formattedCurrentPeriodAverages}
                  allTimeAverageData={formattedAllTimeAverages}
                  MatchDayChartIndicator={CustomMatchDayChartIndicator}
                  isDays={periodString !== 'last6Months'}
                  athleteAlert={athleteAlert}
                  alertSystemValuesForAthlete={filteredAlertSystemValues}
                />
              ) : (
                <PerformanceLineChart
                  lineNames={filteredLineNames}
                  data={chartData}
                  // previousAverageData={formattedPreviousPeriodAverages}
                  currentAverageData={formattedCurrentPeriodAverages}
                  allTimeAverageData={formattedAllTimeAverages}
                  MatchDayChartIndicator={CustomMatchDayChartIndicator}
                  isDays={periodString !== 'last6Months'}
                  athleteAlert={athleteAlert}
                  alertSystemValuesForAthlete={filteredAlertSystemValues}
                />
              )}
            </div>
          )}
          {hasTimeInBed && (
            <div className="container">
              <div className="linechart">
                <TimeInBedChart data={timeInBedData} renderCustomLabel={CustomMatchDayChartIndicator} isDays={periodString !== 'last6Months'} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Separate charts mode
  // If no metrics are selected, don't render anything
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div id='charts'>
      <EventsTimelineChart
        data={sampleEvents}
        overlay={overlayMode}
        periodString={periodString}
        selectedPeriod={selectedPeriod}
        chartMode={chartMode}
      />
      <div className="container d-flex flex-column gap-3 h-[500px]">
        {selectedItems.map((item) => {
          const singleMetricData = chartData.map(entry => ({
            name: entry.name,
            [item]: entry[item]
          }));

          // Filter all-time averages for this specific metric
          const singleMetricAllTimeAverages = formattedAllTimeAverages.map(entry => ({
            name: entry.name,
            [item]: entry[item]
          }));

          // // Filter previous period averages for this specific metric
          // const singleMetricPreviousPeriodAverages = formattedPreviousPeriodAverages.map(entry => ({
          //   name: entry.name,
          //   [item]: entry[item as keyof typeof entry]
          // }));

          // Filter current period averages for this specific metric
          const singleMetricCurrentPeriodAverages = formattedCurrentPeriodAverages.map(entry => ({
            name: entry.name,
            [item]: entry[item as keyof typeof entry]
          }));

          return (
            <div key={item} className="linechart">
              {!chartMode ? (
                item === 'Time In Bed' ? <TimeInBedChart data={timeInBedData} renderCustomLabel={CustomMatchDayChartIndicator} isDays={periodString !== 'last6Months'} /> : <PerformanceLineChart
                  lineNames={[item]}
                  data={singleMetricData}
                  // previousAverageData={singleMetricPreviousPeriodAverages}
                  currentAverageData={singleMetricCurrentPeriodAverages}
                  allTimeAverageData={singleMetricAllTimeAverages}
                  MatchDayChartIndicator={CustomMatchDayChartIndicator}
                  isDays={periodString !== 'last6Months'}
                  athleteAlert={athleteAlert}
                  alertSystemValuesForAthlete={filteredAlertSystemValues}
                />
              ) : (
                item === 'Time In Bed' ? <TimeInBedChart data={timeInBedData} renderCustomLabel={CustomMatchDayChartIndicator} isDays={periodString !== 'last6Months'} /> : <PerformanceBarChart
                  lineNames={[item]}
                  data={singleMetricData}
                  // previousAverageData={singleMetricPreviousPeriodAverages}
                  currentAverageData={singleMetricCurrentPeriodAverages}
                  allTimeAverageData={singleMetricAllTimeAverages}
                  MatchDayChartIndicator={CustomMatchDayChartIndicator}
                  isDays={periodString !== 'last6Months'}
                  athleteAlert={athleteAlert}
                  alertSystemValuesForAthlete={filteredAlertSystemValues}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 