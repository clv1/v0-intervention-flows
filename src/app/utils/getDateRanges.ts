import { DateRange } from '@/lib/types';

/**
 * Returns 6 date ranges based on today's date:
 * - today: Today's date
 * - yesterday: Yesterday's date
 * - last7Days: Last 7 days including today
 * - previousLast7Days: 7 days before last7Days
 * - last30Days: Last 30 days including today
 * - previousLast30Days: 30 days before last30Days
 *
 * @returns Object containing 6 date ranges in ISO format (YYYY-MM-DD)
 */
export const getDateRanges = (): {
  today: DateRange;
  yesterday: DateRange;
  last7Days: DateRange;
  previousLast7Days: DateRange;
  last30Days: DateRange;
  previousLast30Days: DateRange;
} => {
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to midnight for consistent calculations

  // Format a date to ISO string and get only the date part (YYYY-MM-DD)
  const formatDate = (date: Date): string => date.toISOString().split('T')[0];

  // Today's date range
  const todayRange: DateRange = {
    start: formatDate(today),
    end: formatDate(today),
  };

  // Yesterday's date
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayRange: DateRange = {
    start: formatDate(yesterday),
    end: formatDate(yesterday),
  };

  // Last 7 days (including today)
  const last7Start = new Date(today);
  last7Start.setDate(last7Start.getDate() - 6); // 6 days ago + today = 7 days
  const last7DaysRange: DateRange = {
    start: formatDate(last7Start),
    end: formatDate(today),
  };

  // Previous 7 days before last7Days
  const prevLast7End = new Date(last7Start);
  prevLast7End.setDate(prevLast7End.getDate() - 1); // Day before last7Start
  const prevLast7Start = new Date(prevLast7End);
  prevLast7Start.setDate(prevLast7Start.getDate() - 6); // 6 days before prevLast7End
  const previousLast7DaysRange: DateRange = {
    start: formatDate(prevLast7Start),
    end: formatDate(prevLast7End),
  };

  // Last 30 days (including today)
  const last30Start = new Date(today);
  last30Start.setDate(last30Start.getDate() - 29); // 29 days ago + today = 30 days
  const last30DaysRange: DateRange = {
    start: formatDate(last30Start),
    end: formatDate(today),
  };

  // Previous 30 days before last30Days
  const prevLast30End = new Date(last30Start);
  prevLast30End.setDate(prevLast30End.getDate() - 1); // Day before last30Start
  const prevLast30Start = new Date(prevLast30End);
  prevLast30Start.setDate(prevLast30Start.getDate() - 29); // 29 days before prevLast30End
  const previousLast30DaysRange: DateRange = {
    start: formatDate(prevLast30Start),
    end: formatDate(prevLast30End),
  };

  return {
    today: todayRange,
    yesterday: yesterdayRange,
    last7Days: last7DaysRange,
    previousLast7Days: previousLast7DaysRange,
    last30Days: last30DaysRange,
    previousLast30Days: previousLast30DaysRange,
  };
};
