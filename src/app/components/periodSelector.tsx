'use client';

import { DateRange } from '@/lib/types';
import { usePeriodStats } from '@/store/usePeriodStats';
import { useEffect, useMemo, useState } from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { v4 as uuidv4 } from 'uuid';
import { TimePeriodData } from '../data/data';
import './periodSelector.css';

export default function PeriodSelector(
  {
    playerPerformancePage = false,
    pParam = ''
  }: {
    playerPerformancePage?: boolean,
    pParam?: string
  }
) {
  const selectedPeriod = usePeriodStats(state => state.selectedPeriod);
  const [timePeriods, setTimePeriods] = useState(
    playerPerformancePage
      ? TimePeriodData.slice(1)
      : TimePeriodData.filter(period => period.id !== 4)
  );
  const [timePeriod, setTimePeriod] = useState<DateRange>(
    playerPerformancePage ?
      {
        start: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      } : selectedPeriod
  );
  const [lineChartPeriod, setLineChartPeriod] = useState<DateRange[]>(
    Array.from({ length: 7 }, (_, i) => ({
      start: new Date(new Date(selectedPeriod.start).setDate(new Date(selectedPeriod.start).getDate() - i)).toISOString().split('T')[0],
      end: new Date(new Date(selectedPeriod.end).setDate(new Date(selectedPeriod.end).getDate() - i)).toISOString().split('T')[0]
    }))
  );
  const {
    setSelectedPeriod,
    setCalendarPeriod,
  } = usePeriodStats();

  // Get the current date and format day and month
  const calendarPeriod = usePeriodStats(state => state.calendarPeriod);
  // const [testPeriod, setTestPeriod] = useState<DateRange | null>();
  const [periodButtons, setPeriodButtons] = useState<NodeListOf<Element> | null>(null);
  const [showCalendarIcon, setShowCalendarIcon] = useState<boolean>(false);
  const [lineChartCalendarPeriods, setLineChartCalendarPeriods] = useState<DateRange[]>([]);

  // Update initial active state based on selected period
  useEffect(() => {
    const initialTimePeriods = playerPerformancePage
      ? TimePeriodData.slice(1)
      : TimePeriodData.filter(period => period.id !== 4);
    setTimePeriods(
      initialTimePeriods.map(period => ({
        ...period,
        active: period.name === getPeriodName(selectedPeriod)
      }))
    );
  }, []);

  // Helper function to determine period name from date range
  const getPeriodName = (period: DateRange): string => {
    const start = new Date(period.start);
    const end = new Date(period.end);
    const diffDays = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 6) return 'Last 7 Days';
    if (diffDays === 29) return 'Last 30 Days';
    return '';
  };

  const processStats = async () => {
    try {
      setSelectedPeriod(timePeriod);
    } catch (error) {
      console.error('Error processing stats:', error);
    }
  };

  useEffect(() => {
    setPeriodButtons(document.querySelectorAll('#period-selector button'));
  }, []);

  useEffect(() => {
    processStats();
  }, [timePeriod, lineChartPeriod]);

  // Handler to update the selected time period when a button is clicked
  const handleTimePeriod = (e: React.MouseEvent<HTMLButtonElement>) => {
    let dateRange: DateRange;
    let dateRangeLineChart: DateRange[] = [];

    setTimePeriods(
      timePeriods.map(period => {
        period.active = false;

        if ((e.target as HTMLElement).innerHTML === period.name) {
          period.active = true;
        }
        return period;
      })
    );

    if ((e.target as HTMLElement).innerHTML === 'Today') {
      dateRange = {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

      // Create 7 ranges: today + previous 6 days
      dateRangeLineChart = Array.from({ length: 7 }, (_, i) => ({
        start: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
        end: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0]
      }));
    } else if ((e.target as HTMLElement).innerHTML === 'Last 7 Days') {
      dateRange = {
        start: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

      // Create different ranges based on playerPerformancePage
      dateRangeLineChart = playerPerformancePage ?
        // For player performance page, just show the last 7 days
        Array.from({ length: 7 }, (_, i) => ({
          start: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
          end: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0]
        })) :
        // For other pages, show 7 separate week periods
        Array.from({ length: 7 }, (_, i) => ({
          start: new Date(new Date().setDate(new Date().getDate() - (6 + (7 * i)))).toISOString().split('T')[0],
          end: new Date(new Date().setDate(new Date().getDate() - (7 * i))).toISOString().split('T')[0]
        }));
    } else if ((e.target as HTMLElement).innerHTML === 'Last 30 Days') {
      dateRange = {
        start: new Date(new Date().setDate(new Date().getDate() - 29)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

      // Create different ranges based on playerPerformancePage
      dateRangeLineChart = playerPerformancePage ?
        // For player performance page, just show the last 30 days
        Array.from({ length: 30 }, (_, i) => ({
          start: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
          end: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0]
        })) :
        // Create 7 ranges: each representing a 30-day period
        dateRangeLineChart = Array.from({ length: 7 }, (_, i) => ({
          start: new Date(new Date().setDate(new Date().getDate() - (29 + (30 * i)))).toISOString().split('T')[0],
          end: new Date(new Date().setDate(new Date().getDate() - (30 * i))).toISOString().split('T')[0]
        }));
    } else {
      dateRange = {
        start: new Date(new Date().setDate(new Date().getDate() - 180)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

      // Create 7 ranges: each representing a 30-day period
      dateRangeLineChart = Array.from({ length: 7 }, (_, i) => ({
        start: new Date(new Date().setDate(new Date().getDate() - (29 + (30 * i)))).toISOString().split('T')[0],
        end: new Date(new Date().setDate(new Date().getDate() - (30 * i))).toISOString().split('T')[0]
      }));
    }

    setTimePeriod(dateRange);
    setLineChartPeriod(dateRangeLineChart);
    if (calendarPeriod) setShowCalendarIcon(true);
  };

  const handleCalendarClick = () => {
    if (calendarPeriod) {
      if (periodButtons) {
        periodButtons.forEach(button => {
          button.classList.remove('active');
        });
      }

      setShowCalendarIcon(false);
      setTimePeriod(calendarPeriod);

      if (lineChartCalendarPeriods.length > 0) {
        setLineChartPeriod(lineChartCalendarPeriods);
      } else {
        if (playerPerformancePage) {
          // For player performance, create one period per day
          const startDate = new Date(calendarPeriod.start);
          const endDate = new Date(calendarPeriod.end);
          const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          const newLineChartPeriods = Array.from({ length: daysDiff }, (_, i) => {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            return {
              start: dateStr,
              end: dateStr
            };
          }).reverse();  // Reverse the array

          setLineChartPeriod(newLineChartPeriods);
        } else {
          // Original 7-day logic for other pages
          const periodLength = new Date(calendarPeriod.end).getTime() - new Date(calendarPeriod.start).getTime();
          const isSameDay = periodLength === 0;

          const newLineChartPeriods = Array.from({ length: 7 }, (_, i) => {
            if (isSameDay) {
              const date = new Date(calendarPeriod.end);
              date.setDate(date.getDate() - i);
              const dateStr = date.toISOString().split('T')[0];
              return {
                start: dateStr,
                end: dateStr
              };
            } else {
              const endDate = new Date(calendarPeriod.end);
              endDate.setTime(endDate.getTime() - (periodLength * i));

              const startDate = new Date(endDate);
              startDate.setTime(endDate.getTime() - periodLength);

              return {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0]
              };
            }
          });

          setLineChartPeriod(newLineChartPeriods);
        }
      }
    }
  };

  // This component is here temporarily. It will later be extracted as a reusable component.
  const CustomDateRangePicker: React.FC = () => {
    const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
    const today = new Date();

    // Calculate maxDate based on first selected date and today
    const maxSelectableDate = useMemo(() => {
      if (playerPerformancePage && dateRange[0]) {
        const thirtyDaysFromStart = new Date(dateRange[0]);
        thirtyDaysFromStart.setDate(thirtyDaysFromStart.getDate() + 29); // +29 to make it inclusive for 30 days total
        // Return the earlier of: 30 days from start OR today
        return thirtyDaysFromStart < today ? thirtyDaysFromStart : today;
      }
      return today; // Default max date is today
    }, [dateRange[0], playerPerformancePage]);

    useEffect(() => {
      if (dateRange[0] && dateRange[1]) {
        setTimePeriods(
          timePeriods.map(period => ({
            ...period,
            active: false
          }))
        );

        const startDate = new Date(Date.UTC(
          dateRange[0].getFullYear(),
          dateRange[0].getMonth(),
          dateRange[0].getDate(),
          0, 0, 0
        ));

        const endDate = new Date(Date.UTC(
          dateRange[1].getFullYear(),
          dateRange[1].getMonth(),
          dateRange[1].getDate(),
          0, 0, 0
        ));

        if (playerPerformancePage) {
          // For player performance, create one period per day
          const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

          const lineChartRanges = Array.from({ length: daysDiff }, (_, i) => {
            const currentDate = new Date(startDate);
            currentDate.setUTCDate(startDate.getUTCDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            return {
              start: dateStr,
              end: dateStr
            };
          }).reverse();  // Reverse the array

          const period = {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          };

          setTimePeriod(period);
          setCalendarPeriod(period);
          setLineChartCalendarPeriods(lineChartRanges);
          setLineChartPeriod(lineChartRanges);
        } else {
          // Original 7-day logic for other pages
          const isSameDay = startDate.getTime() === endDate.getTime();

          const lineChartRanges = Array.from({ length: 7 }, (_, i) => {
            if (isSameDay) {
              const date = new Date(endDate);
              date.setUTCDate(date.getUTCDate() - i);
              const dateStr = date.toISOString().split('T')[0];
              return {
                start: dateStr,
                end: dateStr
              };
            } else {
              const periodLength = endDate.getTime() - startDate.getTime();
              const rangeEnd = new Date(endDate);
              rangeEnd.setTime(endDate.getTime() - (periodLength * i));

              const rangeStart = new Date(rangeEnd);
              rangeStart.setTime(rangeEnd.getTime() - periodLength);

              return {
                start: rangeStart.toISOString().split('T')[0],
                end: rangeEnd.toISOString().split('T')[0]
              };
            }
          });

          const period = {
            start: startDate.toISOString().split('T')[0],
            end: endDate.toISOString().split('T')[0]
          };

          setTimePeriod(period);
          setCalendarPeriod(period);
          setLineChartCalendarPeriods(lineChartRanges);
          setLineChartPeriod(lineChartRanges);
        }
      }
    }, [dateRange]);

    const formatDateRange = (showIcon: boolean = true) => {
      if (calendarPeriod && !showIcon) {
        let start = '', end = '';

        const formatDate = (date: string) => {
          const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };
          return new Date(date).toLocaleDateString('en-GB', options);
        };

        const formatDateWithYear = (date: string, year?: number) => {
          const dateObj = new Date(date);
          if (year) dateObj.setFullYear(year);

          const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: '2-digit' };
          return dateObj.toLocaleDateString('en-GB', options).replace(',', '').replace(/\d{2}$/, "'$&");
        };

        const startDate = new Date(calendarPeriod.start);
        const endDate = new Date(calendarPeriod.end);
        const currentYear = new Date().getFullYear();
        let startYear = startDate.getFullYear();
        let endYear = endDate.getFullYear();

        // If the end month is earlier than the start month, assume the next year
        if (endDate.getMonth() < startDate.getMonth()) {
          endYear = startYear + 1;
        }

        // Always show the year if the start year is different from the current year
        start = startYear !== currentYear ? formatDateWithYear(calendarPeriod.start) : formatDate(calendarPeriod.start);

        // If the start is in the previous year, ensure the end date **shows the year**
        if (startYear < currentYear || endYear !== currentYear) {
          end = formatDateWithYear(calendarPeriod.end, endYear);
        } else {
          end = formatDate(calendarPeriod.end);
        }

        // If start and end dates are the same, return only one date
        if (calendarPeriod.start === calendarPeriod.end) return start;

        return `${start} - ${end}`;
      }

      return <i className="bi bi-calendar3"></i>;
    };





    return (
      <DatePicker
        selectsRange={true}
        startDate={dateRange[0]}
        endDate={dateRange[1]}
        onChange={(update) => {
          if (update[0]) {
            const startDate = new Date(Date.UTC(
              update[0].getFullYear(),
              update[0].getMonth(),
              update[0].getDate(),
              0, 0, 0
            ));
            const period = {
              start: startDate.toISOString().split('T')[0],
              end: ''
            }
            // setTestPeriod(period);

          }
          setDateRange(update);
        }}
        calendarStartDay={1}
        onKeyDown={(e) => e.preventDefault()}
        maxDate={maxSelectableDate}
        customInput={
          <button className="date-picker-button">
            {formatDateRange(showCalendarIcon)}
          </button>
        }
      />
    );
  };

  // Reset to default values when component mounts
  useEffect(() => {
    // Set default time period based on playerPerformancePage
    const defaultPeriod = playerPerformancePage ?
      {
        start: new Date(new Date().setDate(new Date().getDate() - 6)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      } :
      {
        start: new Date().toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
      };

    // Set default line chart periods
    const defaultLineChartPeriods = Array.from({ length: 7 }, (_, i) => ({
      start: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0],
      end: new Date(new Date().setDate(new Date().getDate() - i)).toISOString().split('T')[0]
    }));

    // Reset all states to default values
    const initialTimePeriods = playerPerformancePage ? TimePeriodData.slice(1) : TimePeriodData.filter(period => period.id !== 4);
    if (pParam === 'last30Days') {
      setTimePeriods(
        initialTimePeriods.map(period => ({
          ...period,
          active: period.name === 'Last 30 Days'
        }))
      );

    } else {

      setTimePeriods(
        initialTimePeriods.map(period => ({
          ...period,
          active: period.name === (playerPerformancePage ? 'Last 7 Days' : 'Today')
        }))
      );
    }
    setTimePeriod(defaultPeriod);
    setLineChartPeriod(defaultLineChartPeriods);
    setShowCalendarIcon(false);
    setCalendarPeriod(null);
    setSelectedPeriod(defaultPeriod);

    // Cleanup function
    return () => {
      setSelectedPeriod(defaultPeriod);
      setCalendarPeriod(null);
    };
  }, []);

  useEffect(() => {
    if (pParam === 'last30Days') {
      const secondButton = document.querySelector('#period-selector button:nth-child(2)');
      if (secondButton) {
        (secondButton as HTMLButtonElement).click();
      }
    }
  }, [pParam]);

  return (
    <>
      <div id="period-selector" className='d-flex gap-3'>
        {timePeriods.map(period => (
          <button
            key={uuidv4()}
            className={`${period.active ? 'active' : undefined}`}
            onClick={handleTimePeriod}
          >
            {period.name}
          </button>
        ))}
        <div
          id='date'
          className='d-flex justify-content-center align-items-center'
          onClick={handleCalendarClick}
        >
          <CustomDateRangePicker />
        </div>
      </div>
    </>
  );
}