import { SupabaseClient } from '@supabase/supabase-js';
import { IAthlete } from '@/lib/types';

/**
 * Get the count of survey submissions for each athlete in the last 7 and 30 days
 * @param supabase - The Supabase client
 * @param last30DaysCycleAthletes - Array of cycle IDs, athlete IDs, and cycle dates for the last 30 days
 * @returns Object with athlete IDs as keys and counts of submissions for last 7 and 30 days
 */
export const getAthleteSurveySubmissionCounts = async (
  supabase: SupabaseClient,
  last30DaysCycleAthletes: { cycle_id: number; athlete_id: number; cycle_date: string }[]
): Promise<Record<number, { last7Days: number; last30Days: number }>> => {
  // Get all cycle IDs from the last 30 days
  const cycleIds = last30DaysCycleAthletes.map((cycle) => cycle.cycle_id);

  // Query the behaviour_submission table to get all submissions for these cycle IDs
  const { data: surveySubmissions, error } = await supabase
    .schema('public')
    .from('behaviour_submission')
    .select('cycle_id')
    .in('cycle_id', cycleIds);

  if (error) {
    console.error(`Failed to fetch survey submissions: ${error.message}`);
    return {};
  }

  // Create a Set of cycle IDs that have submissions for faster lookup
  const submittedCycleIds = new Set(surveySubmissions?.map((submission) => submission.cycle_id) || []);

  // Get the current date to calculate the 7-day window
  const currentDate = new Date();
  const sevenDaysAgo = new Date(currentDate);
  sevenDaysAgo.setDate(currentDate.getDate() - 7);

  // Initialize the result object
  const result: Record<number, { last7Days: number; last30Days: number }> = {};

  // Process each cycle entry
  last30DaysCycleAthletes.forEach((cycle) => {
    const athleteId = cycle.athlete_id;
    const cycleDate = new Date(cycle.cycle_date);

    // Initialize the athlete's counts if not already done
    if (!result[athleteId]) {
      result[athleteId] = { last7Days: 0, last30Days: 0 };
    }

    // Check if this cycle has a submission
    if (submittedCycleIds.has(cycle.cycle_id)) {
      // Increment the 30-day count
      result[athleteId].last30Days++;

      // Check if this cycle is within the last 7 days
      if (cycleDate >= sevenDaysAgo) {
        result[athleteId].last7Days++;
      }
    }
  });

  return result;
};

export default getAthleteSurveySubmissionCounts;
