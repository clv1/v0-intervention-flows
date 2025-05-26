'use client';

import { useAllTimeDataAverages } from "@/hooks/useAllTimeDataAverages";
import { useDateRangePeriod } from "@/hooks/useDateRangePeriod";
import { useFetchFromAllTimeMetrics } from "@/hooks/useFetchFromAllTimeMetrics";
import { IAthlete, IAthleteMentalState, IRecoveryAverageData, IWorkloadAverageData } from "@/lib/types";
import { usePeriodStats } from "@/store/usePeriodStats";
import { useParams } from "next/navigation";
import RaderChart from "../components/radarChart";
import './performanceSummaryWindow.css';
import calculateAthleteMentalScore from "../../../utils/Survey/calculateAthleteMentalScore";

interface PerformanceSummaryWindowProps {
  recovery: IRecoveryAverageData[];
  workload: IWorkloadAverageData[];
  athletes: IAthlete[];
  athleteMentalState: IAthleteMentalState[];
}

export default function PerformanceSummaryWindow({ recovery, workload, athletes, athleteMentalState }: PerformanceSummaryWindowProps) {
  const { id } = useParams();
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const { getPeriodFromDateRange } = useDateRangePeriod();
  const periodString = getPeriodFromDateRange(selectedPeriod);

  const { metricsData, previousMetricsData } = useFetchFromAllTimeMetrics(athletes);
  const teamAverages = useAllTimeDataAverages(metricsData.filter(item => item.athlete_id === Number(id)));
  const previousTeamAverages = useAllTimeDataAverages(previousMetricsData.filter(item => item.athlete_id === Number(id)));

  let periodRecoveryAvg: number | undefined;
  let recoveryAvgDiff: number | undefined;
  let periodStrainAvg: number | undefined;
  let strainAvgDiff: number | undefined;

  if (Array.isArray(periodString)) {
    periodRecoveryAvg = teamAverages.recoveryAvg;
    recoveryAvgDiff = teamAverages.recoveryAvg - previousTeamAverages.recoveryAvg;
    periodStrainAvg = teamAverages.strainAvg;
    strainAvgDiff = teamAverages.strainAvg - previousTeamAverages.strainAvg;
  }
  else {
    periodRecoveryAvg = recovery?.find(item => item.period === periodString)?.average ?? undefined;
    recoveryAvgDiff = recovery?.find(item => item.period === `${periodString}Difference`)?.average ?? undefined;
    periodStrainAvg = workload?.find(item => item.period === periodString)?.average ?? undefined;
    strainAvgDiff = workload?.find(item => item.period === `${periodString}Difference`)?.average ?? undefined;
  }

  const averageMetrics = {
    recovery: periodRecoveryAvg,
    strain: periodStrainAvg
  };

  const athleteMentalScore = calculateAthleteMentalScore(athleteMentalState);

  return (
    <div id="performance-summary-window" className="d-flex flex-column gap-3 justify-content-center align-items-center">
      <p>Performance Summary</p>
      <RaderChart averageMetrics={averageMetrics} athleteMentalScore={athleteMentalScore} />
    </div>
  );
}