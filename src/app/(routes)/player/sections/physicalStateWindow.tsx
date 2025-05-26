'use client';

import { LineChartComponent } from '@/components/lineChart';
import { useDateRangePeriod } from '@/hooks/useDateRangePeriod';
import { IAthlete, IPlayerLineChartData } from '@/lib/types';
import { usePeriodStats } from '@/store/usePeriodStats';
import { useParams } from 'next/navigation';
import './physicalStateWindow.css';
import { useFetchFromAllTimeMetrics } from '@/hooks/useFetchFromAllTimeMetrics';

export default function PhysicalStateWindow({ metrics, athletes }: { metrics: IPlayerLineChartData[], athletes: IAthlete[] }) {
  const { id } = useParams();
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const { getPeriodFromDateRange } = useDateRangePeriod();
  const periodString = getPeriodFromDateRange(selectedPeriod);

  const { extendedPeriodsData } = useFetchFromAllTimeMetrics(athletes, true);

  // Function to calculate average for a specific metric across all athletes
  const calculateAverage = (data: any[], metricName: string): number | null => {
    if (!data || data.length === 0) return null;

    const validValues = data
      .map(item => {
        const value = item[metricName];
        if (value === null || value === undefined) return null;
        // Scale strain values by 100/21
        return metricName === 'strain' ? value * (100 / 21) : value;
      })
      .filter((value): value is number => value !== null);

    if (validValues.length === 0) return null;

    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return Number(Math.round(sum / validValues.length));
  };

  // Function to format date with month name
  const formatDateWithMonthName = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  };

  // Generate chart data based on current period and previous periods
  const generateChartData = () => {
    // For predefined periods like 'today', 'last7Days', etc.
    if (!Array.isArray(periodString)) {
      const filteredMetrics = metrics?.filter(item => item.time_window === periodString && item.athlete_id === Number(id)) ?? [];

      return filteredMetrics.map(item => ({
        name: item.label,
        recovery: item.recovery || null,
        strain: item.workload || null
      }));
    }

    // For custom date ranges, use the extendedPeriodsData
    if (extendedPeriodsData.length === 0) {
      // If no extended data is available yet, return empty chart data
      return [];
    }

    const chartData = [];

    // Calculate period length in days
    const startDate = new Date(selectedPeriod.start);
    const endDate = new Date(selectedPeriod.end);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const periodLengthMs = endDate.getTime() - startDate.getTime();
    const periodLengthDays = Math.ceil(periodLengthMs / (1000 * 60 * 60 * 24));

    // Generate data for current period and 6 previous periods
    for (let i = 0; i < 7; i++) {
      // Calculate date range for this period
      const periodEndDate = new Date(endDate);
      if (i > 0) {
        // For previous periods, move back by the period length
        periodEndDate.setDate(periodEndDate.getDate() - (i * periodLengthDays));
      }

      const periodStartDate = new Date(periodEndDate);
      periodStartDate.setDate(periodStartDate.getDate() - periodLengthDays + 1);

      // Set time to ensure we capture full days
      periodStartDate.setHours(0, 0, 0, 0);
      periodEndDate.setHours(23, 59, 59, 999);

      // Format period label with month names
      const periodLabel = `${formatDateWithMonthName(periodStartDate)}-${formatDateWithMonthName(periodEndDate)}`;

      // Filter metrics for this period
      const periodMetrics = extendedPeriodsData.filter(item => {
        const itemDate = new Date(item.label);
        return itemDate >= periodStartDate && itemDate <= periodEndDate && item.athlete_id === Number(id);
      });

      // Calculate averages for this period
      const recoveryAvg = calculateAverage(periodMetrics, 'recovery_score');
      const strainAvg = calculateAverage(periodMetrics, 'strain');

      // Add to chart data (in reverse order so current period is first)
      chartData.unshift({
        name: periodLabel,
        recovery: recoveryAvg,
        strain: strainAvg
      });
    }

    return chartData;
  };

  const chartData = generateChartData();

  // const filteredMetrics = metrics?.filter(item =>
  //   item.time_window === periodString &&
  //   item.athlete_id === Number(id)
  // ) ?? [];

  // const chartData = filteredMetrics.map(item => ({
  //   name: item.label,
  //   recovery: item.recovery || null,
  //   strain: item.workload || null
  // }));

  return (
    <div id="physical-state-window-player-page" className='w-100'>
      <div className="container">
        <div className="linechart">
          <LineChartComponent lineNames={['Recovery', 'Strain']} data={chartData} isDays={periodString === 'today'} />
        </div>
      </div>
    </div>
  );
}