import { DateRange } from '@/lib/types';

export const useDateRangePeriod = () => {
  const expectedDateRanges = {
    today: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    last7Days: {
      start: new Date(new Date().setDate(new Date().getDate() - 6))
        .toISOString()
        .split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    last30Days: {
      start: new Date(new Date().setDate(new Date().getDate() - 29))
        .toISOString()
        .split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
    last6Months: {
      start: new Date(new Date().setDate(new Date().getDate() - 180)).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  };

  const expectedPreviousDateRanges = {
    previousDay: {
      start: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split('T')[0],
      end: new Date(new Date().setDate(new Date().getDate() - 1))
        .toISOString()
        .split('T')[0],
    },
    previous7Days: {
      start: new Date(new Date().setDate(new Date().getDate() - 13))
        .toISOString()
        .split('T')[0],
      end: new Date(new Date().setDate(new Date().getDate() - 7))
        .toISOString()
        .split('T')[0],
    },
    previous30Days: {
      start: new Date(new Date().setDate(new Date().getDate() - 59))
        .toISOString()
        .split('T')[0],
      end: new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split('T')[0],
    },
  };

  // This one returns the period from the date range as a string, such as last7Days,
  // but returns a list of dates for previous period such as previous7Days
  const getPeriodFromDateRange = (dateRange: DateRange) => {
    for (const [period, range] of Object.entries(expectedDateRanges)) {
      if (dateRange.start === range.start && dateRange.end === range.end) {
        return period;
      }
    }

    // If no match is found, generate a list of dates in the specified format
    const dates: string[] = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    // Set time to midnight for consistent formatting
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    // Create a new date object to iterate through the range
    const currentDate = new Date(start);

    // Loop through each day in the range
    while (currentDate <= end) {
      // Format the date as YYYY-MM-DD 00:00:00+00
      const formattedDate = `${
        currentDate.toISOString().split('T')[0]
      } 00:00:00+00`;
      dates.push(formattedDate);

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  // This one returns the previous period from the date range as a string, such as previous7Days
  const getPreviousPeriodFromDateRange = (dateRange: DateRange) => {
    for (const [period, range] of Object.entries(expectedPreviousDateRanges)) {
      if (dateRange.start === range.start && dateRange.end === range.end) {
        return period;
      }
    }

    // If no match is found, generate a list of dates in the specified format
    const dates: string[] = [];
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);

    // Set time to midnight for consistent formatting
    start.setUTCHours(0, 0, 0, 0);
    end.setUTCHours(0, 0, 0, 0);

    // Create a new date object to iterate through the range
    const currentDate = new Date(start);

    // Loop through each day in the range
    while (currentDate <= end) {
      // Format the date as YYYY-MM-DD 00:00:00+00
      const formattedDate = `${
        currentDate.toISOString().split('T')[0]
      } 00:00:00+00`;
      dates.push(formattedDate);

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  return {
    getPeriodFromDateRange,
    getPreviousPeriodFromDateRange,
  };
};
