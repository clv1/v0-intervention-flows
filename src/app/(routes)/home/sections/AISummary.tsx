'use client'

import { useAllTimeDataAverages } from "@/hooks/useAllTimeDataAverages";
import { useDateRangePeriod } from "@/hooks/useDateRangePeriod";
import { useFetchFromAllTimeMetrics } from "@/hooks/useFetchFromAllTimeMetrics";
import { IAllTimeMetricsAverages, IAthlete, IRecoveryAverageData, IRecoveryData, IWorkloadAverageData, IWorkloadData } from "@/lib/types";
import { usePeriodStats } from "@/store/usePeriodStats";
import { formatAthleteCalendarData } from '@/utils/formatAthleteCalendarData';
import { formatAthleteData } from '@/utils/formatAthleteData';
import { useEffect, useState } from "react";
import AIAnalysisHomepage from "../components/AIAnalysisHomepage";
import './AISummary.css';

/**
 * Calculates the average recovery score and strain across all athletes
 * @param allTimeAverages Array of athlete metrics averages
 * @returns Object containing the average recovery score and strain
 */
const calculateTeamAverages = (allTimeAverages: IAllTimeMetricsAverages[]) => {
  if (!allTimeAverages || allTimeAverages.length === 0) {
    return { recoveryScoreAvg: 0, strainAvg: 0 };
  }

  const totalRecovery = allTimeAverages.reduce((sum, athlete) =>
    sum + (athlete.recovery_score_avg || 0), 0);

  const totalStrain = allTimeAverages.reduce((sum, athlete) =>
    sum + (athlete.strain_avg || 0), 0);

  return {
    recoveryScoreAvg: totalRecovery / allTimeAverages.length,
    strainAvg: totalStrain / allTimeAverages.length
  };
};

export default function AISummary({
  athletes,
  recoveryMetrics,
  recoveryMetricsAverage,
  workloadMetrics,
  workloadMetricsAverage,
  allTimeAverages
}: {
  athletes: IAthlete[],
  recoveryMetrics: IRecoveryData[],
  recoveryMetricsAverage: IRecoveryAverageData[],
  workloadMetrics: IWorkloadData[],
  workloadMetricsAverage: IWorkloadAverageData[],
  allTimeAverages: IAllTimeMetricsAverages[]
}) {
  const { getPeriodFromDateRange, getPreviousPeriodFromDateRange } = useDateRangePeriod();
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const previousSelectedPeriod = usePeriodStats(state => state.previousSelectedPeriod);
  const periodString = getPeriodFromDateRange(selectedPeriod);
  const previousPeriodString = getPreviousPeriodFromDateRange(previousSelectedPeriod);

  const { metricsData, previousMetricsData } = useFetchFromAllTimeMetrics(athletes);
  const calendarTeamAverages = useAllTimeDataAverages(metricsData);
  const previousCalendarTeamAverages = useAllTimeDataAverages(previousMetricsData);
  const [athletesDataObject, setAthletesDataObject] = useState<Record<string, string>>({});
  const [teamData, setTeamData] = useState<Record<string, number | null>>({});
  // const dateRanges = getDateRanges();

  useEffect(() => {
    let athletesData: Record<string, string> = {};
    let teamData: Record<string, number | null> = {};

    athletes.forEach(athlete => {
      const athleteName = `${athlete.first_name} ${athlete.last_name}`;

      if (!Array.isArray(periodString)) {
        athletesData[athleteName] = formatAthleteData(recoveryMetrics, workloadMetrics, allTimeAverages, athleteName, athlete.athlete_id, periodString, previousPeriodString);
      }
      else {
        const athlete_metrics = metricsData.filter(metric => metric.athlete_id === athlete.athlete_id);
        const athlete_previous_metrics = previousMetricsData.filter(metric => metric.athlete_id === athlete.athlete_id);

        athletesData[athleteName] = formatAthleteCalendarData(athleteName, athlete.athlete_id, athlete_metrics, athlete_previous_metrics, allTimeAverages, periodString, previousPeriodString);
      }

      if (!Array.isArray(periodString)) {
        if (periodString === 'today') {
          teamData[`Recovery for ${periodString}`] = recoveryMetricsAverage[0]?.average ?? null;
          teamData[`Recovery for ${previousPeriodString}`] = (recoveryMetricsAverage[0]?.average ?? 0) - (recoveryMetricsAverage[1]?.average ?? 0);
          teamData[`Strain for ${periodString}`] = workloadMetricsAverage[0]?.average ?? null;
          teamData[`Strain for ${previousPeriodString}`] = (workloadMetricsAverage[0]?.average ?? 0) - (workloadMetricsAverage[1]?.average ?? 0);
          teamData['Squad All-Time Recovery Average'] = Math.round(calculateTeamAverages(allTimeAverages).recoveryScoreAvg / 100 * 21);
          teamData['Squad All-Time Workload Average'] = Math.round(calculateTeamAverages(allTimeAverages).strainAvg / 100 * 21);
        }
        else if (periodString === 'last7Days') {
          teamData[`Recovery for ${periodString}`] = recoveryMetricsAverage[2]?.average ?? null;
          teamData[`Recovery for ${previousPeriodString}`] = (recoveryMetricsAverage[2]?.average ?? 0) - (recoveryMetricsAverage[3]?.average ?? 0);
          teamData[`Strain for ${periodString}`] = workloadMetricsAverage[2]?.average ?? null;
          teamData[`Strain for ${previousPeriodString}`] = (workloadMetricsAverage[2]?.average ?? 0) - (workloadMetricsAverage[3]?.average ?? 0);
          teamData['Squad All-Time Recovery Average'] = Math.round(calculateTeamAverages(allTimeAverages).recoveryScoreAvg / 100 * 21);
          teamData['Squad All-Time Workload Average'] = Math.round(calculateTeamAverages(allTimeAverages).strainAvg / 100 * 21);
        }
        else {
          teamData[`Recovery for ${periodString}`] = recoveryMetricsAverage[4]?.average ?? null;
          teamData[`Recovery for ${previousPeriodString}`] = (recoveryMetricsAverage[4]?.average ?? 0) - (recoveryMetricsAverage[5]?.average ?? 0);
          teamData[`Strain for ${periodString}`] = workloadMetricsAverage[4]?.average ?? null;
          teamData[`Strain for ${previousPeriodString}`] = (workloadMetricsAverage[4]?.average ?? 0) - (workloadMetricsAverage[5]?.average ?? 0);
          teamData['Squad All-Time Recovery Average'] = Math.round(calculateTeamAverages(allTimeAverages).recoveryScoreAvg / 100 * 21);
          teamData['Squad All-Time Workload Average'] = Math.round(calculateTeamAverages(allTimeAverages).strainAvg / 100 * 21);
          // teamData[`Recovery for ${periodString}`] = recoveryMetricsAverage[0].average ?? null;
          // teamData[`Strain for ${periodString}`] = workloadMetricsAverage[0].average ?? null;
          // teamData[`Recovery for ${dateRanges.last7Days.start} to ${dateRanges.last7Days.end}`] = recoveryMetricsAverage[2].average ?? null;
          // teamData[`Strain for ${dateRanges.last7Days.start} to ${dateRanges.last7Days.end}`] = workloadMetricsAverage[2].average ?? null;
          // teamData[`Recovery for ${dateRanges.last30Days.start} to ${dateRanges.last30Days.end}`] = recoveryMetricsAverage[4].average ?? null;
          // teamData[`Strain for ${dateRanges.last30Days.start} to ${dateRanges.last30Days.end}`] = workloadMetricsAverage[4].average ?? null;
        }
      } else {
        teamData[`Recovery For Period ${periodString[0]} to ${periodString[periodString.length - 1]}`] = calendarTeamAverages.recoveryAvg;
        teamData[`Recovery For Period ${previousPeriodString[0]} to ${previousPeriodString[previousPeriodString.length - 1]}`] = previousCalendarTeamAverages.recoveryAvg;
        teamData[`Strain For Period ${periodString[0]} to ${periodString[periodString.length - 1]}`] = calendarTeamAverages.strainAvg;
        teamData[`Strain For Period ${previousPeriodString[0]} to ${previousPeriodString[previousPeriodString.length - 1]}`] = previousCalendarTeamAverages.strainAvg;
        teamData['Squad All-Time Recovery Average'] = Math.round(calculateTeamAverages(allTimeAverages).recoveryScoreAvg / 100 * 21);
        teamData['Squad All-Time Workload Average'] = Math.round(calculateTeamAverages(allTimeAverages).strainAvg / 100 * 21);
      }
    });
    setAthletesDataObject(athletesData);
    setTeamData(teamData);
  }, [selectedPeriod, metricsData]);


  return (
    <div id="ai-summary-window" className='d-flex flex-column justify-content-center align-items-center w-100'>
      <div id="ai-summary-homepage" className='d-flex gap-2 flex-column align-items-center w-100'>
        <div className='d-flex gap-2 flex-column align-items-center w-100 h-100'>
          <p id="title" className="w-100">AI Summary</p>
          <div id="content" className='d-flex gap-2 flex-column align-items-start w-100'>
            <AIAnalysisHomepage
              athletesPromptData={athletesDataObject}
              teamData={teamData}
            />
          </div>
        </div>
      </div>
    </div >
  );
}