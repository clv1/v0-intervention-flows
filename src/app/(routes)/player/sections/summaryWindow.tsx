'use client'

import { useDateRangePeriod } from '@/hooks/useDateRangePeriod';
import { IAthlete, IRecoveryData, IWorkloadData, RecoverySquadAvailability } from '@/lib/types';
import { usePeriodStats } from '@/store/usePeriodStats';
import { useParams } from 'next/navigation';
import SummaryIndicator from '@/components/summaryIndicator';
import './summaryWindow.css';
import { useAllTimeDataAverages } from '@/hooks/useAllTimeDataAverages';
import { useFetchFromAllTimeMetrics } from '@/hooks/useFetchFromAllTimeMetrics';

interface SummaryWindowProps {
  recovery: IRecoveryData[];
  workload: IWorkloadData[];
  athletes: IAthlete[];
  recoverySquadAvailability: RecoverySquadAvailability[]
}

export default function SummaryWindow({ recovery, workload, athletes, recoverySquadAvailability }: SummaryWindowProps) {
  const { id } = useParams();
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const { getPeriodFromDateRange } = useDateRangePeriod();
  const periodString = getPeriodFromDateRange(selectedPeriod);

  const { metricsData, previousMetricsData } = useFetchFromAllTimeMetrics(athletes);
  const teamAverages = useAllTimeDataAverages(metricsData.filter(item => item.athlete_id === Number(id)));
  const previousTeamAverages = useAllTimeDataAverages(previousMetricsData.filter(item => item.athlete_id === Number(id)));

  const calculatePeriodAverage = (data: IRecoveryData[] | IWorkloadData[], period: string): number | undefined => {
    const periodData = data.filter(item => item.athlete_id === Number(id) && item.period === period);
    if (periodData.length === 0) return undefined;

    const validValues = periodData.filter(item => item.value !== null).map(item => item.value as number);
    if (validValues.length === 0) return undefined;

    return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
  };

  let periodRecoveryAvg: number | undefined;
  let recoveryAvgDiff: number | undefined;
  let periodStrainAvg: number | undefined;
  let strainAvgDiff: number | undefined;

  let squadAvailabilityValue = 0, previousSquadAvailabilityValue = 0;
  let squadAvailabilityTotal: number | undefined;

  let squadRecoveryPercent: number, previousSquadRecoveryPercent: number;

  if (Array.isArray(periodString)) {
    periodRecoveryAvg = teamAverages.recoveryAvg;
    recoveryAvgDiff = teamAverages.recoveryAvg - previousTeamAverages.recoveryAvg;
    periodStrainAvg = teamAverages.strainAvg;
    strainAvgDiff = teamAverages.strainAvg - previousTeamAverages.strainAvg;

    squadAvailabilityValue = metricsData.filter(item => item.recovery_score !== null && item.recovery_score > 66 && item.athlete_id === Number(id)).length;
    squadAvailabilityTotal = metricsData.filter(item => item.athlete_id === Number(id)).length;

    previousSquadAvailabilityValue = previousMetricsData.filter(item => item.recovery_score !== null && item.recovery_score > 66 && item.athlete_id === Number(id)).length;
  }
  else {
    periodRecoveryAvg = calculatePeriodAverage(recovery, periodString);
    recoveryAvgDiff = calculatePeriodAverage(recovery, `${periodString}Difference`);
    periodStrainAvg = calculatePeriodAverage(workload, periodString);
    strainAvgDiff = calculatePeriodAverage(workload, `${periodString}Difference`);

    //* Calculating the valid recovery scores
    const previousPeriodString: { [key: string]: string } = {
      'today': 'previousDay',
      'last7Days': 'previous7Days',
      'last30Days': 'previous30Days'
    };
    squadAvailabilityValue = recoverySquadAvailability
      .filter(item => item.period === periodString && item.athlete_id === Number(id))
      .reduce((sum, item) => sum + item.value, 0);

    previousSquadAvailabilityValue = recoverySquadAvailability
      .filter(item =>
        item.period === previousPeriodString[periodString as keyof typeof previousPeriodString] &&
        item.athlete_id === Number(id)
      )
      .reduce((sum, item) => sum + item.value, 0);

    //* Calculating the total recovery scores
    const selectedAthleteId = 5; // Replace with the desired athlete ID

    if (periodString === 'today')
      squadAvailabilityTotal = recoverySquadAvailability
        .filter(item => item.period === periodString && item.athlete_id === Number(id)).length;

    if (periodString === 'last7Days')
      squadAvailabilityTotal = recoverySquadAvailability
        .filter(item => item.period === periodString && item.athlete_id === Number(id)).length * 7;

    if (periodString === 'last30Days')
      squadAvailabilityTotal = recoverySquadAvailability
        .filter(item => item.period === periodString && item.athlete_id === Number(id)).length * 30;

  }

  squadRecoveryPercent = squadAvailabilityTotal ? Math.round((squadAvailabilityValue / squadAvailabilityTotal) * 100) : 0;
  previousSquadRecoveryPercent = squadAvailabilityTotal ? Math.round((previousSquadAvailabilityValue / squadAvailabilityTotal) * 100) : 0;
  const squadRecoveryDifferencePercent = squadRecoveryPercent - previousSquadRecoveryPercent;

  return (
    <div id="summary-window-player-page" className='d-flex gap-2 flex-column justify-content-center align-items-center'>
      <SummaryIndicator
        title='Recovery Score'
        metric={periodRecoveryAvg}
        metricDifference={recoveryAvgDiff}
        squadRecoveryPercent={0} squadRecoveryDifferencePercent={0}
      />
      <SummaryIndicator
        title='Strain'
        metric={periodStrainAvg}
        metricDifference={strainAvgDiff}
        squadRecoveryPercent={0} squadRecoveryDifferencePercent={0}
      />
      <SummaryIndicator
        title='Squad Availability'
        metric={periodRecoveryAvg}
        metricDifference={recoveryAvgDiff}
        squadRecoveryPercent={squadRecoveryPercent} squadRecoveryDifferencePercent={squadRecoveryDifferencePercent}
        playerPagePeriod={periodString}
      />
    </div>
  );
}