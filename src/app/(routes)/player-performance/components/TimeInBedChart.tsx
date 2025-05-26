import React from "react";
import { BarChart, Bar, Tooltip, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LabelList, ReferenceLine } from "recharts";
import "./timeInBedChart.css";
import { useSwitchTogglesStore } from '@/store/useSwitchTogglesStore';

interface ProcessedData {
    day: string;
    sleep: [number | null, number | null];
}

interface TimeInBedChartProps {
    data: ProcessedData[];
    renderCustomLabel?: (props: any) => JSX.Element;
    isDays?: boolean;
}

// Normalize values above 24h
const normalizeHour = (hour: number | null): number | null => {
    if (hour === null) return null;
    return hour % 24;
};

// Round to nearest minute
const roundToNearestMinute = (decimalHour: number | null): number | null => {
    if (decimalHour === null) return null;

    let hour = Math.floor(decimalHour);
    let minutes = Math.round((decimalHour % 1) * 60);

    if (minutes === 60) {
        hour += 1;
        minutes = 0;
    }

    return hour + minutes / 60;
};

// Format hour to readable AM/PM
const formatHour = (decimalHour: number | null): string => {
    if (decimalHour === null) return "N/A";

    const normalizedHour = normalizeHour(decimalHour);
    if (normalizedHour === null) return "N/A";

    const roundedDecimalHour = roundToNearestMinute(normalizedHour);
    if (roundedDecimalHour === null) return "N/A";

    let hour = Math.floor(roundedDecimalHour) % 24;
    let minutes = Math.round((roundedDecimalHour % 1) * 60);
    let suffix = hour >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    hour = hour % 12 === 0 ? 12 : hour % 12;

    // Only show minutes if they're not zero
    const minuteDisplay = minutes === 0 ? "" : `:${minutes.toString().padStart(2, "0")}`;
    return `${hour}${minuteDisplay} ${suffix}`;
};

// Calculate sleep duration
const calculateDuration = (start: number | null, end: number | null): string => {
    if (start === null || end === null) return "N/A";

    let adjustedEnd = end;
    if (end < start) {
        adjustedEnd += 24; // Adjust for next day
    }
    let durationMinutes = (adjustedEnd - start) * 60;
    let hours = Math.floor(durationMinutes / 60);
    let minutes = Math.round(durationMinutes % 60);
    return `${hours}h ${minutes}m`;
};

// Custom tooltip
const CustomTooltip: React.FC<{ active?: boolean, payload?: any[] }> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const { day, sleep } = payload[0].payload as ProcessedData;

        // If both sleep values are null, don't show the tooltip
        if (sleep[0] === null && sleep[1] === null) {
            return null;
        }

        return (
            <div style={{
                backgroundColor: 'var(--dark-purple-3)',
                padding: "10px",
                borderRadius: '8px',
                color: 'var(--white)'
            }}>
                <p><strong>{day}</strong></p>
                <p>Start: {formatHour(sleep[0])}</p>
                <p>End: {formatHour(sleep[1])}</p>
                <p>Duration: <strong>{calculateDuration(sleep[0], sleep[1])}</strong></p>
            </div>
        );
    }
    return null;
};

const TimeInBedChart: React.FC<TimeInBedChartProps> = ({ data, renderCustomLabel, isDays }) => {
    // Get overlay mode from the store to match other charts
    const overlayMode = useSwitchTogglesStore(state => state.overlayMode);

    // Shift times so that any time before 10PM (22) is assumed to be on the next day.
    const adjustSleepForChart = (start: number | null, end: number | null): [number | null, number | null] => {
        if (start === null || end === null) {
            return [null, null];
        }
        if (start < 12) {
            // For overnight sleep recorded in the early morning (e.g. 1 AM),
            // add 24 to both values to bring them to the same scale as the previous night.
            return [start + 24, end + 24];
        }
        return [start, end];
    };

    const chartData = data.map(({ day, sleep }) => {
        const [adjustedStart, adjustedEnd] = adjustSleepForChart(sleep[0], sleep[1]);
        return { day, sleep: [adjustedStart, adjustedEnd] };
    });

    // Calculate the maximum adjusted time for the domain's upper bound.
    // Filter out null values before calculating min/max
    const validTimes = chartData.flatMap(({ sleep }) => sleep).filter((time): time is number => time !== null);

    // Default values if there are no valid times
    const maxSleep = validTimes.length > 0 ? Math.ceil(Math.max(...validTimes) * 1.05) : 36; // Default to 12am next day
    const minSleep = validTimes.length > 0 ? Math.floor(Math.min(...validTimes) * 0.990) : 20; // Default to 8pm

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart id="time-in-bed-chart" data={chartData} margin={{
                top: 8,
                right: overlayMode ? 50 : 20,
                left: overlayMode ? 50 : 20,
                bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis
                    dataKey="day"
                    stroke="var(--gray)"
                />

                {/* Add ReferenceLines for custom labels */}
                {isDays && renderCustomLabel && data.map((item, index) => (
                    <ReferenceLine
                        key={index}
                        x={item.day}
                        yAxisId="time"
                        stroke="none"
                        label={(props) => renderCustomLabel({ ...props, index, payload: item })}
                    />
                ))}

                <YAxis
                    yAxisId="time"
                    domain={[minSleep, maxSleep]}
                    tickFormatter={formatHour}
                    stroke="var(--gray)"
                    tickCount={5}
                    width={60}
                />
                <Tooltip content={<CustomTooltip />} />
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
                <Bar
                    dataKey="sleep" // Ensure your Bar component is set up to render a range based on [start, end]
                    fill="#74AABB"
                    name="Time in Bed"
                    maxBarSize={50}
                    radius={[4, 4, 4, 4]}
                    yAxisId="time"
                >
                    <LabelList
                        dataKey="sleep"
                        position="insideBottom"
                        fill="white"
                        style={{ fontWeight: "bold", fontSize: "11px" }}
                        formatter={(val: [number | null, number | null]) => val[0] !== null ? formatHour(val[0]) : ""}
                    />
                    {/* Display sleep end time at the top of the bar */}
                    <LabelList
                        dataKey="sleep"
                        position="insideTop"
                        fill="white"
                        style={{ fontWeight: "bold", fontSize: "11px" }}
                        formatter={(val: [number | null, number | null]) => val[1] !== null ? formatHour(val[1]) : ""}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default TimeInBedChart;
