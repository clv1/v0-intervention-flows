'use client'

import SummaryIndicator from '@/components/summaryIndicator';
import { useAllTimeDataAverages } from '@/hooks/useAllTimeDataAverages';
import { useDateRangePeriod } from '@/hooks/useDateRangePeriod';
import { useFetchFromAllTimeMetrics } from '@/hooks/useFetchFromAllTimeMetrics';
import { IAthlete, IRecoveryAverageData, IWorkloadAverageData, RecoverySquadAvailability } from '@/lib/types';
import { usePeriodStats } from '@/store/usePeriodStats';
import './summaryWindow.css';
import DBRT from '@/components/DBRT';

// Define the SummaryWindow component
export default function SummaryWindow(
  { recovery,
    workload,
    athletes,
    recoverySquadAvailability,
    DBRTValues
  }:
    {
      recovery:
      IRecoveryAverageData[],
      workload: IWorkloadAverageData[],
      athletes: IAthlete[],
      recoverySquadAvailability:
      RecoverySquadAvailability[],
      DBRTValues: {
        downtime_days: number,
        total_days: number
      }
    }
) {
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const { getPeriodFromDateRange } = useDateRangePeriod();
  const periodString = getPeriodFromDateRange(selectedPeriod);

  const { metricsData, previousMetricsData } = useFetchFromAllTimeMetrics(athletes);
  const teamAverages = useAllTimeDataAverages(metricsData);
  const previousTeamAverages = useAllTimeDataAverages(previousMetricsData);

  let periodRecoveryAvg: number | undefined;
  let recoveryAvgDiff: number | undefined;
  let periodWorkloadAvg: number | undefined;
  let workloadAvgDiff: number | undefined;

  let squadAvailabilityValue = 0, previousSquadAvailabilityValue = 0;
  let squadAvailabilityTotal: number | undefined;

  let squadRecoveryPercent: number, previousSquadRecoveryPercent: number;

  if (Array.isArray(periodString)) {
    periodRecoveryAvg = teamAverages.recoveryAvg;
    recoveryAvgDiff = teamAverages.recoveryAvg - previousTeamAverages.recoveryAvg;
    periodWorkloadAvg = teamAverages.strainAvg;
    workloadAvgDiff = teamAverages.strainAvg - previousTeamAverages.strainAvg;

    squadAvailabilityValue = metricsData.filter(item => item.recovery_score !== null && item.recovery_score > 66).length;
    squadAvailabilityTotal = metricsData.length;

    previousSquadAvailabilityValue = previousMetricsData.filter(item => item.recovery_score !== null && item.recovery_score > 66).length;


    // Count how many have recovery_score > 66
  }
  else {
    periodRecoveryAvg = recovery?.find(item => item.period === periodString)?.average ?? undefined;
    recoveryAvgDiff = recovery?.find(item => item.period === `${periodString}Difference`)?.average ?? undefined;
    periodWorkloadAvg = workload?.find(item => item.period === periodString)?.average ?? undefined;
    workloadAvgDiff = workload?.find(item => item.period === `${periodString}Difference`)?.average ?? undefined;


    //* Calculating the valid recovery scores
    const previousPeriodString: { [key: string]: string } = {
      'today': 'previousDay',
      'last7Days': 'previous7Days',
      'last30Days': 'previous30Days'
    };
    squadAvailabilityValue = recoverySquadAvailability
      .filter(item => item.period === periodString &&
        athletes.some(athlete => athlete.athlete_id === item.athlete_id))
      .reduce((sum, item) => sum + item.value, 0);

    previousSquadAvailabilityValue = recoverySquadAvailability
      .filter(item => item.period === previousPeriodString[periodString as keyof typeof previousPeriodString] &&
        athletes.some(athlete => athlete.athlete_id === item.athlete_id))
      .reduce((sum, item) => sum + item.value, 0);

    //* Calculating the total recovery scores
    if (periodString === 'today') squadAvailabilityTotal = recoverySquadAvailability
      .filter(item => item.period === periodString &&
        athletes.some(athlete => athlete.athlete_id === item.athlete_id)).length;

    if (periodString === 'last7Days') squadAvailabilityTotal = recoverySquadAvailability
      .filter(item => item.period === periodString &&
        athletes.some(athlete => athlete.athlete_id === item.athlete_id)).length * 7;


    if (periodString === 'last30Days') squadAvailabilityTotal = recoverySquadAvailability
      .filter(item => item.period === periodString &&
        athletes.some(athlete => athlete.athlete_id === item.athlete_id)).length * 30;
  }
  squadRecoveryPercent = squadAvailabilityTotal ? Math.round((squadAvailabilityValue / squadAvailabilityTotal) * 100) : 0;
  previousSquadRecoveryPercent = squadAvailabilityTotal ? Math.round((previousSquadAvailabilityValue / squadAvailabilityTotal) * 100) : 0;
  const squadRecoveryDifferencePercent = squadRecoveryPercent - previousSquadRecoveryPercent;
  return (
    <div id="summary-window" className='d-flex flex-column justify-content-center align-items-center'>
      <div id='indicators' className='d-flex justify-content-center align-items-center'>
        <SummaryIndicator title='Recovery Score' metric={periodRecoveryAvg} metricDifference={recoveryAvgDiff} squadRecoveryPercent={0} squadRecoveryDifferencePercent={0} />
        <SummaryIndicator title='Strain' metric={periodWorkloadAvg} metricDifference={workloadAvgDiff} squadRecoveryPercent={0} squadRecoveryDifferencePercent={0} />
        <SummaryIndicator title='Squad Availability' metric={undefined} metricDifference={undefined} squadRecoveryPercent={squadRecoveryPercent} squadRecoveryDifferencePercent={squadRecoveryDifferencePercent} />
        <DBRT downtime_days={DBRTValues.downtime_days} total_days={DBRTValues.total_days} />
      </div>
    </div>
  );
}