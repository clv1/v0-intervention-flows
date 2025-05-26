import { SupabaseClient } from '@supabase/supabase-js';
import { IAthlete } from '@/lib/types';

/**
 * Get the current cycle IDs for the given date
 * @param supabase - The Supabase client
 * @param athletes - The athletes to get the cycle IDs for
 * @param currentCycleDate - The current cycle date
 * @returns The current cycle IDs
 */
export const getCurrentCycleIds = async (
  supabase: SupabaseClient,
  athletes: IAthlete[],
  currentCycleDate: string
): Promise<{ cycle_id: number }[]> => {
  const { data: currentCycleIds, error: currentCycleIdsError } = await supabase
    .schema('public')
    .from('cycle')
    .select('cycle_id')
    .in(
      'athlete_id',
      athletes.map((athlete) => athlete.athlete_id)
    )
    .eq('cycle_date', currentCycleDate);

  if (currentCycleIdsError) {
    console.error(`Failed to fetch current cycle IDs: ${currentCycleIdsError.message}`);
    return [];
  }

  if (!currentCycleIds) {
    console.warn('No cycle IDs found for the given date');
    return [];
  }

  const cycleIds: { cycle_id: number }[] = JSON.parse(JSON.stringify(currentCycleIds, null, 2));

  return cycleIds;
};
