import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Get the current cycle IDs for the given date
 * @param supabase - The Supabase client
 * @param athletes - The athletes to get the cycle IDs for
 * @param currentCycleDate - The current cycle date
 * @returns The current cycle IDs
 */

export const getSurveySubmissionIds = async (
  supabase: SupabaseClient,
  cycleIds: { cycle_id: number }[]
): Promise<{ cycle_id: number }[]> => {
  const { data: surveySubmissionIds, error: surveySubmissionIdsError } = await supabase
    .schema('public')
    .from('behaviour_submission')
    .select('cycle_id')
    .in(
      'cycle_id',
      cycleIds.map((cycle) => cycle.cycle_id)
    );

  if (surveySubmissionIdsError) {
    console.error(`Failed to fetch survey submission IDs: ${surveySubmissionIdsError.message}`);
    return [];
  }

  //* Check if the survey submission IDs are found (No one has submitted the survey yet)

  if (!surveySubmissionIds) {
    console.warn('No survey submission IDs found for the given cycle IDs');
    return [];
  }

  const surveySubmissionIdsData: { cycle_id: number }[] = JSON.parse(JSON.stringify(surveySubmissionIds, null, 2));

  return surveySubmissionIdsData;
};
