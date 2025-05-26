import { ImplicitLabelType } from 'recharts/types/component/Label';
import { ReactElement } from 'react';

interface MatchDay {
    type: string;
    date: string;
}

interface MatchDayChartIndicatorProps {
    viewBox?: {
        x: number;
        y: number;
        height: number;
    };
    text?: string;
    index?: number;
    dataPoint?: {
        name: string;
        [key: string]: any;
    };
    matchDays?: MatchDay[];
}

export const MatchDayChartIndicatorComponent = ({
    viewBox,
    text,
    index = 0,
    dataPoint,
    matchDays = []
}: MatchDayChartIndicatorProps): ReactElement => {
    if (!viewBox) return <></>;

    const { x, y, height } = viewBox;
    const rectWidth = 40;
    const rectHeight = 20;
    const offset = 30;
    const rectX = x - rectWidth / 2;
    const rectY = y + height + offset;

    // Check if the current data point is a match day
    let isMatchDay = false;
    let matchDayIndex = -1;
    let mdText = 'MD';

    if (dataPoint && matchDays.length > 0) {
        try {
            let currentDate: Date;

            // Check if the data point name is a day name (like "Wed", "Thu", etc.)
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const isDayName = dayNames.includes(dataPoint.name);

            if (isDayName) {
                // For last 7 days chart with day names
                const today = new Date();
                const dayIndex = dayNames.indexOf(dataPoint.name);

                // Calculate the date for this day name
                // For the last 7 days, we need to map the day names to the correct dates
                // The last 7 days are: [6 days ago, 5 days ago, ..., today]
                const daysAgo = 6 - index; // index is 0-6 for the 7 days
                currentDate = new Date(today);
                currentDate.setDate(today.getDate() - daysAgo);

                // Adjust for the one-day offset
                currentDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
            } else if (dataPoint.name === 'Today') {
                // Handle the "Today" case
                currentDate = new Date();
                currentDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
            } else {
                // For regular charts with "Mar 27" format
                const [month, day] = dataPoint.name.split(' ');
                const monthIndex = new Date(`${month} 1, 2000`).getMonth();
                const dayNum = parseInt(day);

                // Get the year from the first match day
                const matchDayYear = new Date(matchDays[0].date).getFullYear();
                currentDate = new Date(matchDayYear, monthIndex, dayNum);
                currentDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
            }

            // Find the closest match day
            let closestMatchDay: MatchDay | null = null;
            let minDaysDiff = Infinity;

            (matchDays as MatchDay[]).forEach((md: MatchDay) => {
                const matchDate = new Date(md.date);
                matchDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

                const daysDiff = Math.abs(
                    (currentDate.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysDiff < minDaysDiff) {
                    minDaysDiff = daysDiff;
                    closestMatchDay = md;
                }
            });

            if (closestMatchDay) {
                const matchDate = new Date((closestMatchDay as MatchDay).date);
                matchDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

                const daysDiff = Math.round(
                    (currentDate.getTime() - matchDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                // If it's a match day, use the index
                if (daysDiff === 0) {
                    isMatchDay = true;
                    matchDayIndex = matchDays.indexOf(closestMatchDay);
                    mdText = 'MD'; // Ensure text is set to 'MD' when it's a match day
                } else {
                    // Otherwise, use the day difference
                    mdText = `MD${daysDiff > 0 ? '+' : ''}${daysDiff}`;
                }
            }
        } catch (e) {
            console.error('Error parsing date:', e);
        }
    }

    // If we have a match day, use it; otherwise, use the calculated mdText
    if (isMatchDay) {
        mdText = 'MD';
    } else if (mdText === 'MD') {
        // Fallback to the pattern-based approach if no match days are found
        const cycleIndex = index % 7;
        let mdOffset;

        if (cycleIndex < 3) {
            mdOffset = cycleIndex;
        } else {
            mdOffset = cycleIndex - 7;
        }

        mdText = mdOffset === 0 ? 'MD' : `MD${mdOffset > 0 ? '+' : ''}${mdOffset}`;

        // If the text is 'MD' but isMatchDay is false, we need to fix this inconsistency
        if (mdText === 'MD' && !isMatchDay) {
            // This is a fallback case where the text is 'MD' but the background is dark
            // We should either make it a match day or change the text
            isMatchDay = true; // Make it a match day to match the text
        }
    }

    // Determine background color based on whether it's a match day or not
    const backgroundColor = isMatchDay ? "rgb(139, 92, 246)" : "#2b1f4e";

    return (
        <g>
            <rect
                x={rectX}
                y={rectY}
                width={rectWidth}
                height={rectHeight}
                fill={backgroundColor}
                rx={4}
                ry={4}
            />
            <text
                x={x}
                y={rectY + rectHeight / 2}
                fill="white"
                textAnchor="middle"
                dominantBaseline="middle"
                style={{ fontSize: '10px' }}
            >
                {mdText}
            </text>
        </g>
    );
};

export const MatchDayChartIndicator = (props: {
    viewBox?: {
        x: number;
        y: number;
        height: number;
    };
    text?: string;
    index?: number;
    payload?: {
        name: string;
        [key: string]: any;
    };
    matchDays?: MatchDay[];
}): ReactElement => {
    return <MatchDayChartIndicatorComponent
        viewBox={props.viewBox}
        index={props.index}
        dataPoint={props.payload}
        matchDays={props.matchDays}
    />;
}; 