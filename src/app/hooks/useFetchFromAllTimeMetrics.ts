import { createClient } from '@/lib/client';
import { IAthlete, IPerformanceLineChartData } from '@/lib/types';
import { usePeriodStats } from '@/store/usePeriodStats';
import { useEffect, useState } from 'react';
import { useDateRangePeriod } from './useDateRangePeriod';

/**
 * Hook to fetch team metrics data from Supabase
 * @param athletes - Array of athletes to fetch data for
 * @param fetchExtendedPeriods - When true, fetches data for the selected period plus 6 consecutive previous periods
 * @returns Object containing metrics data and loading state
 */
export function useFetchFromAllTimeMetrics(
  athletes: IAthlete[],
  fetchExtendedPeriods: boolean = false
) {
  const [metricsData, setMetricsData] = useState<IPerformanceLineChartData[]>(
    []
  );
  const [previousMetricsData, setPreviousMetricsData] = useState<
    IPerformanceLineChartData[]
  >([]);
  const [extendedPeriodsData, setExtendedPeriodsData] = useState<
    IPerformanceLineChartData[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const selectedPeriod = usePeriodStats((state) => state.selectedPeriod);
  const previousSelectedPeriod = usePeriodStats(
    (state) => state.previousSelectedPeriod
  );
  const { getPeriodFromDateRange } = useDateRangePeriod();

  const periodString = getPeriodFromDateRange(selectedPeriod);
  const previousPeriodString = getPeriodFromDateRange(previousSelectedPeriod);

  const fetchMetricsData = async () => {
    // Don't fetch if no athletes
    if (!athletes || athletes.length === 0) {
      console.log('No athletes to fetch data for');
      return;
    }

    // Only fetch for custom date ranges (arrays of dates)
    if (!Array.isArray(periodString) || !Array.isArray(previousPeriodString)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Format the dates to match the label format in the database
      const formattedDates = periodString.map((date) => {
        const [datePart] = date.split(' ');
        const dateWithTime = new Date(`${datePart}T00:00:00.000Z`);
        dateWithTime.setUTCHours(dateWithTime.getUTCHours());
        return dateWithTime.toISOString();
      });

      const previousFormattedDates = previousPeriodString.map((date) => {
        const [datePart] = date.split(' ');
        const dateWithTime = new Date(`${datePart}T00:00:00.000Z`);
        dateWithTime.setUTCHours(dateWithTime.getUTCHours());
        return dateWithTime.toISOString();
      });

      // Check if we have any formatted dates to query
      if (formattedDates.length === 0 || previousFormattedDates.length === 0) {
        setMetricsData([]);
        setPreviousMetricsData([]);
        setExtendedPeriodsData([]);
        setIsLoading(false);
        return;
      }

      // Fetch current period data
      const { data: currentData, error: currentError } = await supabase
        .schema('calculations_schema')
        .from('all_time_metrics')
        .select()
        .in(
          'athlete_id',
          athletes.map((athlete) => athlete.athlete_id)
        )
        .in('label', formattedDates);

      // Fetch previous period data
      const { data: previousData, error: previousError } = await supabase
        .schema('calculations_schema')
        .from('all_time_metrics')
        .select()
        .in(
          'athlete_id',
          athletes.map((athlete) => athlete.athlete_id)
        )
        .in('label', previousFormattedDates);

      if (currentError) {
        throw new Error(`Error fetching metrics data: ${currentError.message}`);
      }

      if (previousError) {
        throw new Error(
          `Error fetching previous metrics data: ${previousError.message}`
        );
      }

      setMetricsData(currentData || []);
      setPreviousMetricsData(previousData || []);

      // If fetchExtendedPeriods is true, fetch data for 6 consecutive previous periods
      if (
        fetchExtendedPeriods &&
        Array.isArray(periodString) &&
        periodString.length > 0
      ) {
        // Calculate the actual period length in days based on the date range
        const startDate = new Date(selectedPeriod.start);
        const endDate = new Date(selectedPeriod.end);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const periodLengthMs = endDate.getTime() - startDate.getTime();
        const periodLengthDays = Math.ceil(
          periodLengthMs / (1000 * 60 * 60 * 24)
        );

        // Calculate the start date of the earliest period we want to fetch
        // (6 periods before the current one)
        const earliestDate = new Date(startDate);
        earliestDate.setDate(earliestDate.getDate() - 6 * periodLengthDays);
        earliestDate.setHours(0, 0, 0, 0);

        // Format the earliest date for the query
        const earliestDateISO = earliestDate.toISOString();

        // Fetch all data from the earliest date to the end of the current period
        const { data: extendedData, error: extendedError } = await supabase
          .schema('calculations_schema')
          .from('all_time_metrics')
          .select()
          .in(
            'athlete_id',
            athletes.map((athlete) => athlete.athlete_id)
          )
          .gte('label', earliestDateISO)
          .lte('label', formattedDates[formattedDates.length - 1]);

        if (extendedError) {
          throw new Error(
            `Error fetching extended periods data: ${extendedError.message}`
          );
        }

        setExtendedPeriodsData(extendedData || []);
      }
    } catch (err) {
      console.error('Error in fetchMetricsData:', err);
      setError(
        err instanceof Error ? err : new Error('Unknown error occurred')
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (athletes.length > 0 && isMounted && Array.isArray(periodString)) {
      fetchMetricsData();
    }

    return () => {
      isMounted = false;
    };
  }, [athletes, selectedPeriod, fetchExtendedPeriods]);

  return {
    metricsData,
    previousMetricsData,
    extendedPeriodsData,
    isLoading,
    error,
    refetch: fetchMetricsData,
  };
}
