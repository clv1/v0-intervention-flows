import { SupabaseClient } from '@supabase/supabase-js';
import { IAthlete } from '@/lib/types';
import { getCurrentCycleDate } from './getCurrentCycleDate';
import { getCurrentCycleIds } from './getCurrentCycleIds';
import { getSurveySubmissionIds } from './getSurveySubmissionIds';

/**
 * Get the athlete IDs with survey submission for the given cycle IDs
 * @param supabase - The Supabase client
 * @param surveySubmissionIds - The cycle IDs to get the athlete IDs for
 * @returns The athlete IDs with survey submission
 */

const getAthleteIdsWithSurveySubmission = async (supabase: SupabaseClient, athletes: IAthlete[]) => {
  //* Get the current cycle date
  const currentCycleDate = getCurrentCycleDate();

  //* Get the current cycle IDs
  const currentCycleIds = await getCurrentCycleIds(supabase, athletes, currentCycleDate);

  //* Get the survey submission IDs
  const surveySubmissionIds: { cycle_id: number }[] = await getSurveySubmissionIds(supabase, currentCycleIds);

  const { data, error } = await supabase
    .schema('public')
    .from('cycle')
    .select('athlete_id')
    .in(
      'cycle_id',
      surveySubmissionIds.map((submission) => submission.cycle_id)
    );

  if (error) {
    console.error(error);
    return [];
  }

  const athleteIdsWithSurveySubmission: { athlete_id: number }[] = JSON.parse(JSON.stringify(data, null, 2));

  return athleteIdsWithSurveySubmission;
};

export default getAthleteIdsWithSurveySubmission;
