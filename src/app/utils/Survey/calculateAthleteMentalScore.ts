import { IAthleteMentalState } from '@/lib/types';

/**
 * Calculates the athlete mental score based on the athlete mental state
 * @param athleteMentalState - The athlete mental state
 * @returns The athlete mental score
 */
const calculateAthleteMentalScore = (athleteMentalState: IAthleteMentalState[]) => {
  if (athleteMentalState.length === 0) return 0; //* The athlete has not filled in the survey yet
  const {
    motivation,
    feeling_in_control,
    social_fulfillment,
    positive_anticipation,
    gratitude,
    sense_of_purpose,
    learning,
    progress_on_goal,
    anxiety,
    feeling_sick,
  } = athleteMentalState[0];

  // Sum of 8 positive metrics
  const positiveSum =
    motivation +
    feeling_in_control +
    social_fulfillment +
    positive_anticipation +
    gratitude +
    sense_of_purpose +
    learning +
    progress_on_goal;

  // Sum of 2 negative metrics
  const negativeSum = anxiety + feeling_sick;

  // Apply the normalized formula: ((positive - negative + 6) / 30) * 100
  const mentalScore = ((positiveSum - negativeSum + 6) / 30) * 100;

  return Math.round(mentalScore * 100) / 100;
};

export default calculateAthleteMentalScore;
