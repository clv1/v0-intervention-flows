'use client';

import { useSwitchTogglesStore } from '@/store/useSwitchTogglesStore';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, ReferenceArea } from 'recharts';
import './performanceLineChart.css';
import { IAlertSystem } from '@/lib/types';
interface LineChartComponentProps {
  lineNames: string[];
  data: Array<{
    name: string;
    [key: string]: string | number | null;  // Allow dynamic keys for each line
  }>;
  previousAverageData?: Array<{
    name: string;
    [key: string]: string | number | null;  // Allow dynamic keys for each line
  }>;
  currentAverageData: Array<{
    name: string;
    [key: string]: string | number | null;  // Allow dynamic keys for each line
  }>;
  allTimeAverageData: Array<{
    name: string;
    [key: string]: string | number | null;  // Allow dynamic keys for each line
  }>;
  legend?: boolean;
  MatchDayChartIndicator?: (props: any) => JSX.Element;
  isDays?: boolean;
  athleteAlert?: {
    alert: number, athlete_id: number, deviationMetrics: Array<{
      metric: string,
      value: number,
      avgValue: number,
      deviation: number
    }>
  };
  alertSystemValuesForAthlete?: Partial<IAlertSystem>;
}

export function PerformanceLineChart({ lineNames, data, previousAverageData, currentAverageData, allTimeAverageData, legend = true, MatchDayChartIndicator, isDays, athleteAlert, alertSystemValuesForAthlete }: LineChartComponentProps) {
  const overlayMode = useSwitchTogglesStore(state => state.overlayMode);
  const averageType = useSwitchTogglesStore(state => state.averageType);
  const colors = {
    'Recovery Score': "#9575cd",       // Muted Purple
    'Strain': "#AEBCB8",              // Muted Green
    'RHR': "#7EBB77",                 // Soft Green
    'HRV': "#B3A8AD",                 // Muted Purple
    'Sleep Performance %': "#ffcc80",  // Soft Gold
    'Sleep Consistency %': "#FFF9E0",  // Soft Orange
    'Sleep Efficiency %': "#80cbc4",   // Muted Teal
    'Sleep Duration': "#64b5f6", // Soft Blue
    'Restorative Sleep Duration': "#f48fb1", // Light Pink
    'Restorative Sleep %': "#e57373"   // Light Red
  };

  const metricNameMap = {
    "Recovery Score": "recovery_score_avg",
    "Strain": "strain_avg",
    "RHR": "rhr_avg",
    "HRV": "hrv_avg",
    "Sleep Performance %": "sleep_performance_avg",
    "Sleep Consistency %": "sleep_consistency_avg",
    "Sleep Efficiency %": "sleep_efficiency_avg",
    "Sleep Duration": "sleep_duration_avg",
    "Restorative Sleep Duration": "restorative_sleep_duration_avg",
    "Restorative Sleep %": "restorative_sleep_avg"
  };

  const firstDeviationBandColor = 'rgba(0, 76, 255, 0.175)'; // Yellow color

  // Function to get the correct alert system values based on the metric name and period
  const getAlertSystemValues = (normalizedMetricName: string) => {
    if (!alertSystemValuesForAthlete) return null;

    // Remove the _avg suffix to get the base metric name
    const baseMetricName = normalizedMetricName.replace('_avg', '');

    // First try to get three-month values
    const threeMonthAvg = alertSystemValuesForAthlete[`${baseMetricName}_three_month_avg` as keyof IAlertSystem];
    const threeMonthStdDev = alertSystemValuesForAthlete[`${baseMetricName}_three_month_std_dev` as keyof IAlertSystem];

    // If three-month values exist, use them
    if (threeMonthAvg !== undefined && threeMonthStdDev !== undefined) {
      // Convert to hours if it's a duration metric
      if (baseMetricName === 'sleep_duration' || baseMetricName === 'restorative_sleep_duration') {
        return {
          avg: threeMonthAvg / (1000 * 60 * 60), // Convert ms to hours
          stdDev: threeMonthStdDev / (1000 * 60 * 60) // Convert ms to hours
        };
      }
      return { avg: threeMonthAvg, stdDev: threeMonthStdDev };
    }

    // If three-month values don't exist, fall back to all-time values
    const allTimeAvg = alertSystemValuesForAthlete[`${baseMetricName}_all_time_avg` as keyof IAlertSystem];
    const allTimeStdDev = alertSystemValuesForAthlete[`${baseMetricName}_all_time_std_dev` as keyof IAlertSystem];

    if (allTimeAvg === undefined || allTimeStdDev === undefined) return null;

    // Convert to hours if it's a duration metric
    if (baseMetricName === 'sleep_duration' || baseMetricName === 'restorative_sleep_duration') {
      return {
        avg: allTimeAvg / (1000 * 60 * 60), // Convert ms to hours
        stdDev: allTimeStdDev / (1000 * 60 * 60) // Convert ms to hours
      };
    }


    return { avg: allTimeAvg, stdDev: allTimeStdDev };
  };


  // Function to get reference ranges for each metric
  const getReferenceRange = (metricName: string) => {
    const normalizedMetricName = metricNameMap[metricName as keyof typeof metricNameMap];

    if (!normalizedMetricName) return null;

    const alertSystemValues = getAlertSystemValues(normalizedMetricName);
    if (!alertSystemValues) return null;

    let y1, y2;
    if (normalizedMetricName === 'strain_avg') {
      y1 = (alertSystemValues.avg - alertSystemValues.stdDev) / 21 * 100;
      y2 = (alertSystemValues.avg + alertSystemValues.stdDev) / 21 * 100;
    } else {
      y1 = alertSystemValues.avg - alertSystemValues.stdDev;
      y2 = alertSystemValues.avg + alertSystemValues.stdDev;
    }
    return {
      y1,
      y2
    };
  };

  // Use the appropriate average data based on the toggle
  const averageData = averageType ? allTimeAverageData : currentAverageData;

  // Create a deep copy of the data to avoid modifying the original
  const chartData = JSON.parse(JSON.stringify(data));
  // console.clear();
  // console.log(chartData);

  // const copyChartData = chartData.map((item: any, index: number) => {
  //   if (index !== 1) {  // Keep data only for the second item (index 1)
  //     const secondKey = Object.keys(item)[1];  // Get the name of the second property
  //     return {
  //       ...item,
  //       [secondKey]: null  // Set the second property to null
  //     };
  //   }
  //   return item;  // Return the item unchanged if it's the second item
  // });




  // Define which metrics are percentages
  const percentageMetrics = [
    'Recovery Score',
    'Strain',
    'Sleep Performance %',
    'Sleep Consistency %',
    'Sleep Efficiency %',
    'Restorative Sleep %'
  ];


  // Separate the metrics into percentage and non-percentage
  const percentLines = lineNames.filter(name => percentageMetrics.includes(name));
  const nonPercentLines = lineNames.filter(name => !percentageMetrics.includes(name));



  // Format value based on metric type
  const formatValue = (value: number, metricName: string) => {
    if (metricName.includes('Duration')) {
      const hours = Math.floor(value);
      const minutes = Math.round((value - hours) * 60);
      return `${hours}h ${minutes}m`;
    }
    if (percentageMetrics.includes(metricName)) {
      return `${value}%`;
    }
    return value;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        id="performance-line-chart"
        data={chartData}
        margin={{
          top: 8,
          right: 20,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="name"
          stroke="var(--gray)"
        />

        {/* Add ReferenceLines for custom labels */}
        {isDays && MatchDayChartIndicator && data.map((item, index) => {
          // Determine which yAxisId to use based on the first metric in lineNames
          const firstMetric = lineNames[0];
          const yAxisId = percentageMetrics.includes(firstMetric) ? 'percentage' : firstMetric;
          return (
            <>
              <ReferenceLine
                key={index}
                x={item.name}
                yAxisId={yAxisId}
                stroke="none"
                label={(props) => MatchDayChartIndicator({ ...props, index, payload: item })}
              ></ReferenceLine>
            </>
          );
        })}

        {/* Percentage Y-axis */}
        {percentLines.length > 0 && (
          <>
            <YAxis
              yAxisId="percentage"
              orientation="left"
              stroke="var(--gray)"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              label={undefined}
            />
          </>
        )}

        {/* Individual Y-axes for non-percentage metrics */}
        {nonPercentLines.map((metricName) => {
          // Calculate domain with padding
          const values = data.map(item => Number(item[metricName])).filter(val => val !== null && !isNaN(val));

          // Get average value if available
          let avgValue = null;
          if (averageData.length > 0 && averageData[0][metricName] !== undefined && averageData[0][metricName] !== null) {
            avgValue = Number(averageData[0][metricName]);
          }

          // Include average value in the domain calculation if it exists
          const allValues = avgValue !== null ? [...values, avgValue] : values;

          const nonZeroValues = allValues.filter(val => val !== 0);
          const min = nonZeroValues.length > 0 ? Math.min(...nonZeroValues) : 0;
          const max = Math.max(...allValues);

          // Adjust padding based on the metric type
          const isDurationMetric = metricName.includes('Duration');

          // Adjust padding based on metric type and overlay mode
          let padding;
          if (isDurationMetric) {
            // Keep the same padding for duration metrics regardless of overlay mode
            padding = (max - min) * 0.1;
          } else if (overlayMode) {
            // Minimal padding for non-duration metrics in overlay mode
            padding = (max - min) * 0.05;
          } else {
            // Standard padding for non-overlay mode
            padding = (max - min) * 0.25;
          }

          // Calculate domain with tighter bounds for overlay mode
          let domainMin, domainMax;
          let customTicks: number[] = [];

          if (overlayMode && !isDurationMetric) {
            // For overlay mode with non-duration metrics, create a much tighter domain
            // Find the actual min/max of the displayed data
            const dataRange = max - min;

            // Almost no padding for overlay mode
            domainMin = Math.max(0, min - dataRange * 0.01);
            domainMax = max + dataRange * 0.01;

            // For specific metrics, we can set even tighter bounds if needed
            if (metricName === 'HRV' || metricName === 'RHR') {
              // Round to nearest 5 for cleaner numbers
              domainMin = Math.floor(domainMin / 5) * 5;
              domainMax = Math.ceil(domainMax / 5) * 5;
            }

            // For overlay mode, only show min and max values
            // This is the most aggressive approach to reduce spacing
            customTicks = [domainMin, domainMax];

            // If the range is very small, just show a single value
            if (domainMax - domainMin < 10) {
              customTicks = [Math.round((domainMin + domainMax) / 2)];
            }
          } else {
            // Standard domain calculation for other cases
            domainMin = Math.max(0, min - padding);
            domainMax = max + padding;
          }

          // Determine tick count based on metric type and overlay mode
          const tickCount = isDurationMetric ? 5 : (overlayMode ? 2 : 5);

          return (
            <>
              <YAxis
                key={metricName}
                yAxisId={metricName}
                orientation={overlayMode ? "right" : "left"}
                stroke={colors[metricName as keyof typeof colors]}
                domain={[domainMin, domainMax]}
                tickFormatter={(value) => {
                  if (metricName.includes('Duration')) {
                    const hours = Math.floor(value);
                    const minutes = Math.round((value - hours) * 60);
                    return `${hours}h ${minutes}m`;
                  }
                  return Math.round(value).toString();
                }}
                tickCount={tickCount}
                allowDecimals={false}
                label={undefined}
                // Use custom ticks for non-duration metrics in overlay mode
                ticks={overlayMode && !isDurationMetric ? customTicks : undefined}
                // Disable automatic tick calculation
                interval={0}
                // Reduce the font size for overlay mode
                style={overlayMode && !isDurationMetric ? { fontSize: '0.8rem' } : undefined}
                // Minimize the width of the axis
                width={overlayMode && !isDurationMetric ? 25 : undefined}
              />
            </>
          );
        })}

        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--dark-purple-3)',
            border: 'none',
            borderRadius: '8px',
            color: 'var(--white)'
          }}
          formatter={(value: number, name: string) => {
            // // Skip items that contain '-average-hidden' entirely
            // if (name.includes('-average-hidden')) {
            //   return [false, false];
            // }
            // Return the original value and name for non-average line 
            let roundedValue = value;
            if (!name.includes('Duration')) {
              roundedValue = Math.round(roundedValue);
            }

            return [formatValue(roundedValue, name), name];
          }}
        />

        {legend && (
          <Legend
            verticalAlign="top"
            align="center"
            wrapperStyle={{
              paddingTop: '0',
              marginLeft: '0',
              marginRight: '0',
              top: '-10px',
              height: 'fit-content',
              width: '100%'
            }}
            height={36}
          />
        )}

        {/* Lines for percentage metrics */}
        {percentLines.map((metricName) => {
          const referenceRange = getReferenceRange(metricName);
          return (
            <>
              <Line
                key={metricName}
                yAxisId="percentage"
                type="monotone"
                name={metricName}
                dataKey={metricName}
                stroke={colors[metricName as keyof typeof colors]}
                strokeWidth={3}
                dot={true}
                connectNulls={false}
              />
              {referenceRange && !overlayMode && (
                <ReferenceArea
                  y1={referenceRange.y1}
                  y2={referenceRange.y2}
                  yAxisId="percentage"
                  stroke="none"
                  fill={firstDeviationBandColor}
                />
              )}
            </>
          );
        })}

        {/* Lines for non-percentage metrics */}
        {nonPercentLines.map((metricName) => {
          if (metricName === 'Time In Bed') return null;
          const referenceRange = getReferenceRange(metricName);
          return (
            <>
              <Line
                key={metricName}
                yAxisId={metricName}
                type="monotone"
                name={metricName}
                dataKey={metricName}
                stroke={colors[metricName as keyof typeof colors]}
                strokeWidth={3}
                dot={true}
                connectNulls={false}
              />
              {referenceRange && !overlayMode && (
                <ReferenceArea
                  y1={referenceRange.y1}
                  y2={referenceRange.y2}
                  yAxisId={metricName}
                  stroke="none"
                  fill={firstDeviationBandColor}
                />
              )}
            </>
          );
        })}

        {/* Average lines for percentage metrics */}
        {!overlayMode && percentLines.map((metricName) => {
          // Check if we have average data for this metric
          const hasAverageData = averageData.length > 0 &&
            averageData.some(item => item[metricName] !== undefined && item[metricName] !== null);
          const referenceRange = getReferenceRange(metricName);

          // Skip rendering if average value is 0 or doesn't exist
          if (!hasAverageData || (averageData[0][metricName] === 0)) return null;

          return (
            <>
              <Line
                key={`${metricName} Average`}
                yAxisId="percentage"
                type="monotone"
                name={`${metricName} Average`}
                data={data.map(d => ({
                  name: d.name,
                  [`${metricName} Average`]: averageData[0][metricName]
                }))}
                dataKey={`${metricName} Average`}
                stroke={colors[metricName as keyof typeof colors]}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={true}
                legendType="none"
              />
              {referenceRange && !overlayMode && (
                <ReferenceArea
                  y1={referenceRange.y1}
                  y2={referenceRange.y2}
                  yAxisId="percentage"
                  stroke="none"
                  fill={firstDeviationBandColor}
                />
              )}
            </>
          );
        })}

        {/* Average lines for non-percentage metrics */}
        {!overlayMode && nonPercentLines.map((metricName) => {
          // Check if we have average data for this metric
          const hasAverageData = averageData.length > 0 &&
            averageData.some(item => item[metricName] !== undefined && item[metricName] !== null);
          const referenceRange = getReferenceRange(metricName);

          // Skip rendering if average value is 0 or doesn't exist
          if (!hasAverageData || (averageData[0][metricName] === 0)) return null;

          // Create a separate dataset for the average line to avoid modifying the original data
          const averageLineData = data.map(d => ({
            name: d.name,
            [`${metricName} Average`]: averageData[0][metricName]
          }));

          const copyLineData = averageData.map((d: any) => ({
            name: d.name,
            [`${metricName} Copy`]: d[metricName]
          }));

          return (
            <>
              <Line
                key={`${metricName} Average`}
                yAxisId={metricName}
                type="monotone"
                name={`${metricName} Average`}
                data={averageLineData}
                dataKey={`${metricName} Average`}
                stroke={colors[metricName as keyof typeof colors]}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                connectNulls={true}
                legendType="none"
              />
              {referenceRange && !overlayMode && (
                <ReferenceArea
                  y1={referenceRange.y1}
                  y2={referenceRange.y2}
                  yAxisId={metricName}
                  stroke="none"
                  fill={firstDeviationBandColor}
                />
              )}
            </>
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
} 