'use client'

import { IAthlete, ICycleMetrics, IRecoveryData, IWorkloadData, IAllTimeMetrics, IAllTimeMetricsAverages, IAlertSystem } from '@/lib/types';
import { useSelectedPlayer } from '@/store/useSelectedPlayer';
import Link from 'next/link';
import PlayerStats from '../components/playerStats';
import './playerDataWindow.css';
import { usePeriodStats } from '@/store/usePeriodStats';
import { useDateRangePeriod } from '@/hooks/useDateRangePeriod';
import calculatePlayerPeriodAverages from '@/utils/Alert-system/calculatePlayerPeriodAverages';
import calculateAthletesAlerts from '@/utils/Alert-system/calculateAthletesAlerts';

// Define the alert system interface

export default function PlayerDataWindow(
  { athletes,
    metrics,
    allTimeMetrics,
    allTimeAverages,
    alertSystemValues,
    athleteIdsWithSurveySubmission,
    athleteSurveySubmissionCounts }:
    {
      athletes: IAthlete[],
      metrics: [IRecoveryData[], IWorkloadData[]],
      allTimeMetrics: IAllTimeMetrics[],
      allTimeAverages: IAllTimeMetricsAverages[],
      alertSystemValues: IAlertSystem[],
      athleteIdsWithSurveySubmission: { athlete_id: number }[],
      athleteSurveySubmissionCounts: Record<number, { last7Days: number; last30Days: number }>
    }
) {


  // Calculate player period averages
  const playerPeriodAverages = calculatePlayerPeriodAverages(allTimeMetrics);

  // Calculate athletes alerts
  /**
   * Calculate athletes alerts based on deviation from allTimeAverages
   * @param playerPeriodAverages - The player period averages
   * @param allTimeAverages - The all time averages
   * @param alertSystemValues - The alert system values
   * @returns The athletes alerts
   */
  const athletesAlerts = calculateAthletesAlerts(playerPeriodAverages, allTimeAverages, alertSystemValues);

  const { setSelectedPlayer } = useSelectedPlayer();
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const { getPeriodFromDateRange } = useDateRangePeriod();

  let periodString = getPeriodFromDateRange(selectedPeriod);
  if (periodString === 'today') periodString = 'Today';
  let isCalendar = false;

  if (Array.isArray(periodString)) isCalendar = true;


  return (
    <div id="player-data-window">
      <div id='topbar' className='container'>
        <div className='container'>
          <div id='column-names' className='row'>
            <p className='col-1'></p>
            <p className='col-3'>Player</p>
            <p className='col-2'>Recovery</p>
            <p className='col-2'>Strain</p>
            <p className='col-2 d-flex justify-content-center align-items-center'>Survey</p>
            <p className='col-2 d-flex justify-content-center align-items-center'>Alerts</p>
          </div>
        </div>
      </div>
      <div id='players' className='container'>
        {athletes.map((athlete) => {
          let playerAlert;
          if (!isCalendar && typeof periodString === 'string') {
            // Ensure periodString is a valid key of IPeriodAlerts
            const validPeriod = periodString as 'Today' | 'last7Days' | 'last30Days';
            playerAlert = athletesAlerts[validPeriod].find(alert => alert.athlete_id === athlete.athlete_id);
          }
          return (
            <Link
              href={`/player/${athlete.athlete_id}`}
              key={athlete.athlete_id}
              className="text-decoration-none"
              onClick={() => setSelectedPlayer(athlete.athlete_id)}
            >
              <div className="player-row">
                <PlayerStats
                  athlete={athlete}
                  athletes={athletes}
                  metrics={metrics}
                  alert={playerAlert?.alert || 0}
                  deviatingMetrics={playerAlert?.deviatingMetrics || []}
                  isCalendar={isCalendar}
                  periodString={periodString}
                  athleteIdsWithSurveySubmission={athleteIdsWithSurveySubmission}
                  athleteSurveySubmissionCounts={athleteSurveySubmissionCounts}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}