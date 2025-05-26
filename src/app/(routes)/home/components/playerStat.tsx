import { useAllTimeDataAverages } from '@/hooks/useAllTimeDataAverages';
import { useDateRangePeriod } from '@/hooks/useDateRangePeriod';
import { useFetchFromAllTimeMetrics } from '@/hooks/useFetchFromAllTimeMetrics';
import { IAthlete, IRecoveryData, IWorkloadData } from '@/lib/types';
import { usePeriodStats } from '@/store/usePeriodStats';
import './playerStat.css';

export default function PlayerStat({ athlete, metrics, athletes, stat }: {
  athlete: IAthlete,
  metrics: [IRecoveryData[], IWorkloadData[]],
  athletes: IAthlete[],
  stat: string
}) {
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const { getPeriodFromDateRange } = useDateRangePeriod();
  const periodString = getPeriodFromDateRange(selectedPeriod);

  const { metricsData, previousMetricsData } = useFetchFromAllTimeMetrics(athletes);
  const metricsAverages = useAllTimeDataAverages(metricsData.filter(item => item.athlete_id === athlete.athlete_id));
  const previousMetricsAverages = useAllTimeDataAverages(previousMetricsData.filter(item => item.athlete_id === athlete.athlete_id));

  let periodRecovery: number | undefined;
  let periodRecoveryDifference: number | undefined;
  let periodWorkload: number | undefined;
  let periodWorkloadDifference: number | undefined;

  if (Array.isArray(periodString)) {
    periodRecovery = metricsAverages.recoveryAvg;
    periodRecoveryDifference = metricsAverages.recoveryAvg - previousMetricsAverages.recoveryAvg;
    periodWorkload = metricsAverages.strainAvg;
    periodWorkloadDifference = metricsAverages.strainAvg - previousMetricsAverages.strainAvg;
  }
  else {
    periodRecovery = metrics[0]?.filter(item => item.athlete_id === athlete.athlete_id).find(item => item.period === periodString)?.value ?? undefined;
    periodWorkload = metrics[1]?.filter(item => item.athlete_id === athlete.athlete_id).find(item => item.period === periodString)?.value ?? undefined;

    periodRecoveryDifference = metrics[0]?.filter(item => item.athlete_id === athlete.athlete_id).find(item => item.period === `${periodString}Difference`)?.value ?? undefined;
    periodWorkloadDifference = metrics[1]?.filter(item => item.athlete_id === athlete.athlete_id).find(item => item.period === `${periodString}Difference`)?.value ?? undefined;
  }

  return (
    <div className={`stat ${stat === 'workload' ? 'col-2' : 'col-2'} d-flex gap-2`}>
      {/* Conditional rendering based on stat type */}
      {(() => {
        if (stat === 'recovery') {
          return (
            <>
              <p>{periodRecovery === 0 || periodRecovery === undefined ? 'N/A' : `${periodRecovery}%`}</p>
              <p
                className={`
                  stat-change d-flex justify-content-center align-items-center gap-1
                  ${Number(periodRecoveryDifference) < 0 ? 'down' : Number(periodRecoveryDifference) > 0 ? 'up' : 'zero'}
                  ${Math.abs(Number(periodRecoveryDifference)) > 10 ? 'show-caret' : ''}
                `}
              >
                {periodRecovery === 0 || periodRecovery === undefined ? '' : (Number(periodRecoveryDifference) < 0 ? <i className="bi bi-caret-down-fill"></i> : <i className="bi bi-caret-up-fill"></i>)}
                {periodRecovery === 0 || periodRecovery === undefined ? '' : `${Number(periodRecoveryDifference)}%`}
              </p>
            </>
          );
        } else if (stat === 'workload') {
          return (
            <>
              <p>{periodWorkload === 0 || periodWorkload === undefined ? 'N/A' : `${periodWorkload}`}</p>
              <p
                className={`
                  stat-change d-flex justify-content-center align-items-center gap-1
                  ${Number(periodWorkloadDifference) < 0 ? 'down' : Number(periodWorkloadDifference) > 0 ? 'up' : 'zero'}
                  ${Math.abs(Number(periodWorkloadDifference)) > 3 ? 'show-caret' : ''}
                `}
              >
                {periodWorkload === 0 || periodWorkload === undefined ? '' : (Number(periodWorkloadDifference) < 0 ? <i className="bi bi-caret-down-fill"></i> : <i className="bi bi-caret-up-fill"></i>)}
                {periodWorkload === 0 || periodWorkload === undefined ? '' : `${Number(periodWorkloadDifference)}`}
              </p>
            </>
          );
        } else {
          return (
            <>
              <p>N/A</p>
            </>
          );
        }
      })()}
    </div>
  );
}
