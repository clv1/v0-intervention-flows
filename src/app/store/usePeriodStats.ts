import { create } from 'zustand';
import { DateRange, ICycle, IRecovery } from '../lib/types';

export type State = {
  selectedPeriod: DateRange;
  previousSelectedPeriod: DateRange;
  calendarPeriod: DateRange | null;
};

export type Actions = {
  setSelectedPeriod: (period: DateRange) => void;
  setPreviousSelectedPeriod: (period: DateRange) => void;
  setCalendarPeriod: (period: DateRange | null) => void;
};

export const usePeriodStats = create<State & Actions>()((set) => ({
  selectedPeriod: {
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  previousSelectedPeriod: {
    start: new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split('T')[0],
    end: new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString()
      .split('T')[0],
  },
  calendarPeriod: null,

  // Actions
  setSelectedPeriod: (period: DateRange) =>
    set((state) => {
      // Calculate the previous period of the same length
      const startDate = new Date(period.start);
      const endDate = new Date(period.end);

      // Calculate the length of the selected period in milliseconds
      const periodLength = endDate.getTime() - startDate.getTime();

      // Calculate the previous period's end date (one day before the start of the selected period)
      const previousEndDate = new Date(startDate);
      previousEndDate.setDate(previousEndDate.getDate() - 1);

      // Calculate the previous period's start date
      const previousStartDate = new Date(previousEndDate);
      previousStartDate.setTime(previousEndDate.getTime() - periodLength);

      // Format dates to ISO string and split to get just the date part
      const previousPeriod = {
        start: previousStartDate.toISOString().split('T')[0],
        end: previousEndDate.toISOString().split('T')[0],
      };

      return {
        selectedPeriod: period,
        previousSelectedPeriod: previousPeriod,
      };
    }),

  setPreviousSelectedPeriod: (period: DateRange) =>
    set(() => ({
      previousSelectedPeriod: period,
    })),

  setCalendarPeriod: (period: DateRange | null) =>
    set(() => ({
      calendarPeriod: period,
    })),
}));

// Selector hooks for convenient access to specific state values
export const useSelectedPeriod = () =>
  usePeriodStats((state) => state.selectedPeriod);
export const useCalendarPeriod = () =>
  usePeriodStats((state) => state.calendarPeriod);
export const usePreviousSelectedPeriod = () =>
  usePeriodStats((state) => state.previousSelectedPeriod);
