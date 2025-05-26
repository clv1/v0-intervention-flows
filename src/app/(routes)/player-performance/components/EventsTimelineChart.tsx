import { timelineChartNonPercentageMetricPadding, timelineChartPercentageMetricPadding, timelineChartPositioning } from '@/data/data';
import { Event } from '@/lib/types';
import React, { useEffect, useState, useCallback } from 'react';
import { Line, LineChart, ResponsiveContainer, XAxis } from 'recharts';
import './eventsTimelineChart.css';

interface ChartPositioning {
  style: string;
  padding: {
    left: number;
    right?: number;
  };
  margin: {
    left: number;
    right: number;
  };
}

interface EventsTimelineChartProps {
  data: Event[];
  overlay: boolean;
  periodString: string | string[];
  selectedPeriod: { start: string; end: string };
  chartMode: boolean; // Add chartMode prop to determine if it's a bar or line chart
  selectedMetrics?: string[]; // Add selectedMetrics prop
}

const EventsTimelineChart: React.FC<EventsTimelineChartProps> = ({ data, overlay, periodString, selectedPeriod, chartMode, selectedMetrics = [] }) => {
  // Hide the chart for 6-month periods
  if (periodString === 'last6Months') {
    return null;
  }

  const [leftPadding, setLeftPadding] = useState<number>(0);

  const updateWidth = useCallback(() => {
    let outerElements: NodeListOf<Element>;
    let innerElements: NodeListOf<Element>;

    if (chartMode) {
      if (overlay) {
        outerElements = document.querySelectorAll("#performance-bar-chart g.recharts-cartesian-grid");
        innerElements = document.querySelectorAll("#performance-bar-chart g.recharts-layer.recharts-bar");
      } else {
        outerElements = document.querySelectorAll("#performance-bar-chart g.recharts-cartesian-grid");
        innerElements = document.querySelectorAll("#performance-bar-chart g.recharts-layer.recharts-cartesian-axis.recharts-xAxis.xAxis");
      }
    } else {
      // For line chart mode
      outerElements = document.querySelectorAll("#performance-bar-chart g.recharts-cartesian-grid");
      innerElements = document.querySelectorAll("#performance-bar-chart g.recharts-cartesian-grid");
    }

    const outerElement = outerElements[0];
    const innerElement = innerElements[0];

    if (outerElement && innerElement) {
      const spacing = (outerElement.getBoundingClientRect().width - innerElement.getBoundingClientRect().width) / 2;
      setLeftPadding(spacing);
    }
    else {
      setLeftPadding(0);
    }
  }, [chartMode, overlay, selectedMetrics]);

  useEffect(() => {
    // Initial update
    updateWidth();

    // Create a debounced version of updateWidth
    const debouncedUpdateWidth = () => {
      let timeoutId: NodeJS.Timeout;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(updateWidth, 1500); // debounce delay
      };
    };

    const debouncedHandler = debouncedUpdateWidth();

    // Add the debounced resize handler
    window.addEventListener("resize", debouncedHandler);

    // Add a timeout to handle chart mode changes
    const timeoutId = setTimeout(updateWidth, 1500);

    // Cleanup listeners and timeout on unmount
    return () => {
      window.removeEventListener("resize", debouncedHandler);
      clearTimeout(timeoutId);
    };
  }, [chartMode, overlay, updateWidth]);

  const percentageMetrics = [
    'Recovery Score',
    'Strain',
    'Sleep Performance %',
    'Sleep Consistency %',
    'Sleep Efficiency %',
    'Restorative Sleep %'
  ];

  // Get the appropriate positioning based on chart type and overlay mode
  const getChartPositioning = (): ChartPositioning => {
    if (chartMode) {
      // Bar chart mode
      if (!overlay) {
        // Non-overlay mode
        return timelineChartPositioning.find(pos => pos.style === 'bar-chart-non-overlay') || timelineChartPositioning[0];
      } else {
        // Overlay mode
        const hasPercentageMetrics = selectedMetrics.some(metric => percentageMetrics.includes(metric));
        if (hasPercentageMetrics) {
          return timelineChartPositioning.find(pos => pos.style === 'bar-chart-overlay-percentage') || timelineChartPositioning[0];
        } else {
          return timelineChartPositioning.find(pos => pos.style === 'bar-chart-overlay-non-percentage') || timelineChartPositioning[0];
        }
      }
    } else {
      // Line chart mode
      if (!overlay) {
        // Non-overlay mode
        return timelineChartPositioning.find(pos => pos.style === 'line-chart-non-overlay') || timelineChartPositioning[0];
      } else {
        // Overlay mode
        const hasPercentageMetrics = selectedMetrics.some(metric => percentageMetrics.includes(metric));
        if (hasPercentageMetrics) {
          return timelineChartPositioning.find(pos => pos.style === 'line-chart-overlay-percentage') || timelineChartPositioning[0];
        } else {
          return timelineChartPositioning.find(pos => pos.style === 'line-chart-overlay-non-percentage') || timelineChartPositioning[0];
        }
      }
    }
  };

  const positioning = getChartPositioning();

  // Calculate additional padding based on selected metrics when in overlay mode
  const calculateMetricPadding = () => {
    // if (!overlay || chartMode) return 0;

    // Check if we have any percentage metrics
    const hasPercentageMetrics = selectedMetrics.some(metric => percentageMetrics.includes(metric));

    // If we have percentage metrics, apply padding for all matching metrics
    if (hasPercentageMetrics) {
      return selectedMetrics.reduce((totalPadding, metric) => {
        const metricPadding = timelineChartPercentageMetricPadding.find(m => m.metric === metric);
        return totalPadding + (metricPadding?.paddingRight || 0);
      }, 0);
    }

    if (selectedMetrics.length === 1) {
      return 0;
    }

    return selectedMetrics.reduce((totalPadding, metric) => {
      const metricPadding = timelineChartNonPercentageMetricPadding.find(m => m.metric === metric);
      return totalPadding + (metricPadding?.paddingRight || 0);
    }, 0);
  };

  const additionalPadding = calculateMetricPadding();

  // Create an array of all dates in the selected period
  const createDateArray = (period: { start: string; end: string }): string[] => {
    const dates: string[] = [];
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);

    // Create a new date object to iterate through the range using local timezone
    const currentDate = new Date(startDate);
    // Set to beginning of day in local timezone
    currentDate.setHours(0, 0, 0, 0);

    // Ensure end date is at end of day in local timezone
    const endLocalDate = new Date(endDate);
    endLocalDate.setHours(23, 59, 59, 999);

    // Loop through each day in the range
    while (currentDate <= endLocalDate) {
      // Format as YYYY-MM-DD in local timezone, not UTC
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      dates.push(dateString);

      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const periodDates = createDateArray(selectedPeriod);

  // Check if this is a 7-day period
  const is7DayPeriod = periodDates.length === 7;

  // Get today's date in YYYY-MM-DD format using local timezone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Transform the data for the chart
  const chartData = periodDates.map(date => {
    const dateObj = new Date(date);
    let formattedDate: string;

    if (is7DayPeriod && date === todayString) {
      formattedDate = 'Today';
    } else if (is7DayPeriod) {
      formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Find all events for this date
    // Convert event dates to local timezone YYYY-MM-DD format for comparison
    const events = data.filter(e => {
      if (!e.date) return false;

      // Handle both string dates and full timestamps
      const eventDate = new Date(e.date);
      const eventDateString = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;

      return eventDateString === date;
    });

    return {
      date: formattedDate,
      value: 50, // Set to middle of chart height
      events: events.length > 0 ? events : null
    };
  });

  const renderEventIcon = (type: Event['type'], cx: number, cy: number, index: number, eventDate: string): React.ReactElement<SVGElement> => {
    // Calculate vertical offset based on index (24px is the icon diameter)
    const verticalOffset = index * 26; // 24px + 2px gap
    console.log(type);
    switch (type) {
      case 'Travel':
        return (
          <g key={`${eventDate}-travel-${index}`} transform={`translate(${cx - 12}, ${cy - 12 - verticalOffset})`}>
            <circle
              cx="12"
              cy="12"
              r="12"
              fill="transparent"
              // stroke="var(--white)"
              strokeWidth="1"
            />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              style={{ userSelect: 'none' }}
            >
              ✈️
            </text>
          </g>
        );
      case 'Hotel':
        return (
          <g key={`${eventDate}-hotel-${index}`} transform={`translate(${cx - 12}, ${cy - 12 - verticalOffset})`}>
            <circle
              cx="12"
              cy="12"
              r="12"
              fill="transparent"
              // stroke="var(--white)"
              strokeWidth="1"
            />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              style={{ userSelect: 'none' }}
            >
              🏨
            </text>
          </g>
        );
      case 'Rest Day':
        return (
          <g key={`${eventDate}-rest-${index}`} transform={`translate(${cx - 12}, ${cy - 12 - verticalOffset})`}>
            <circle
              cx="12"
              cy="12"
              r="12"
              fill="transparent"
              // stroke="var(--white)"
              strokeWidth="1"
            />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              style={{ userSelect: 'none' }}
            >
              😴
            </text>
          </g>
        );
      case 'Training':
        return (
          <g key={`${eventDate}-rest-${index}`} transform={`translate(${cx - 12}, ${cy - 12 - verticalOffset})`}>
            <circle
              cx="12"
              cy="12"
              r="12"
              fill="transparent"
              // stroke="var(--white)"
              strokeWidth="1"
            />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              style={{ userSelect: 'none' }}
            >
              💪
            </text>
          </g>
        );

      case 'Recovery':
        return (
          <g key={`${eventDate}-rest-${index}`} transform={`translate(${cx - 12}, ${cy - 12 - verticalOffset})`}>
            <circle
              cx="12"
              cy="12"
              r="12"
              fill="transparent"
              // stroke="var(--white)"
              strokeWidth="1"
            />
            <text
              x="12"
              y="16"
              textAnchor="middle"
              fill="white"
              fontSize="14"
              style={{ userSelect: 'none' }}
            >
              🔋
            </text>
          </g>
        );
      default:
        // Return an empty circle for unknown event types
        return (
          <g key={`${eventDate}-unknown-${index}`} transform={`translate(${cx - 12}, ${cy - 12 - verticalOffset})`}>
            <circle cx="12" cy="12" r="12" fill="#6B7280" />
          </g>
        );
    }
  };

  const renderCustomDot = (props: any): React.ReactElement<SVGElement> => {
    const { cx, cy, payload } = props;
    if (!payload.events) {
      // Return an invisible dot for no events
      return (
        <g key={`empty-${payload.date}`} transform={`translate(${cx - 12}, ${cy - 12})`}>
          <circle cx="12" cy="12" r="0" fill="transparent" />
        </g>
      );
    }

    // Render all events for this date
    return (
      <g key={`events-${payload.date}`}>
        {payload.events.map((event: Event, index: number) =>
          renderEventIcon(event.type, cx, cy, index, payload.date)
        )}
      </g>
    );
  };

  return (
    <div
      id='events-timeline-chart'
      className={`d-flex events-timeline-chart ${positioning.style}`}
      style={{
        padding: `0px ${(leftPadding + (positioning.padding.right || 0)) + additionalPadding}px 0px ${leftPadding + (positioning.padding.left || 0)}px`,
        marginLeft: `${positioning.margin.left}px`,
        marginRight: `${positioning.margin.right}px`,
      }}
    >
      <ResponsiveContainer width="100%" height={120}>
        <LineChart
          data={chartData}
          margin={{ top: 60, right: 30, left: 30, bottom: 5 }}
        >
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--gray)' }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={2}
            dot={renderCustomDot}
            activeDot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EventsTimelineChart; 