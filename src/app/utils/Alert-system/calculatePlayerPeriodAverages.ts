import { IAllTimeMetrics } from '@/lib/types';
import calculateAveragesForAthlete from './calculateAveragesForAthlete';
import { IPeriodData } from './interfaces';

/**
 * Calculate the player period averages
 * @param allTimeMetrics - The all time metrics
 * @returns The player period averages
 */
const calculatePlayerPeriodAverages = (allTimeMetrics: IAllTimeMetrics[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Days = new Date(today);
  last7Days.setDate(last7Days.getDate() - 6); // 6 days back (today + 6 days = 7 days total)
  const last30Days = new Date(today);
  last30Days.setDate(last30Days.getDate() - 30);

  // Get unique athlete IDs from the allTimeAverages data
  const athleteIds = Array.from(
    new Set(allTimeMetrics.map((item) => item.athlete_id))
  );

  // Create three period objects to hold data for all players
  const playerPeriodAverages: IPeriodData = {
    Today: {},
    last7Days: {},
    last30Days: {},
  };

  // Calculate averages for each athlete and period
  athleteIds.forEach((athleteId) => {
    // Get all data for this athlete
    const athleteData = allTimeMetrics.filter(
      (item) => item.athlete_id === athleteId
    );

    if (athleteData.length === 0) return;

    // Today's data
    const todayData = athleteData.filter((item) => {
      const itemDate = new Date(item.label);
      return itemDate >= today;
    });

    // Last 7 days data (today + 6 days back)
    const last7DaysData = athleteData.filter((item) => {
      const itemDate = new Date(item.label);
      return itemDate >= last7Days;
    });

    // Last 30 days data
    const last30DaysData = athleteData.filter((item) => {
      const itemDate = new Date(item.label);
      return itemDate >= last30Days;
    });

    // Calculate averages for Today
    if (todayData.length > 0) {
      playerPeriodAverages.Today[athleteId] =
        calculateAveragesForAthlete(todayData);
    }

    // Calculate averages for last 7 days
    if (last7DaysData.length > 0) {
      playerPeriodAverages.last7Days[athleteId] =
        calculateAveragesForAthlete(last7DaysData);
    }

    // Calculate averages for last 30 days
    if (last30DaysData.length > 0) {
      playerPeriodAverages.last30Days[athleteId] =
        calculateAveragesForAthlete(last30DaysData);
    }
  });

  return playerPeriodAverages;
};

export default calculatePlayerPeriodAverages;
