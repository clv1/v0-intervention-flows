import React from 'react';
import { CalendarViewProps } from '../../../lib/types';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

const MonthView: React.FC<CalendarViewProps> = ({ currentDate, events, onEventClick, onTimeSlotClick, players }) => {
    const getMonthDays = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay() || 7; // Convert Sunday (0) to 7

        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 1; i < startingDay; i++) {
            days.push(null);
        }

        // Add days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const day = new Date(year, month, i);
            days.push(day);
        }

        // Add empty cells to complete the grid (ensuring full rows of 7 cells)
        const totalCells = Math.ceil(days.length / 7) * 7;
        while (days.length < totalCells) {
            days.push(null);
        }

        return days;
    };

    const monthDays = getMonthDays(currentDate);
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getEventsForDay = (day: Date | null) => {
        if (!day) return [];

        // Get all events for this day
        const dayEvents = events.filter(event => {
            const eventDate = new Date(event.startTime);
            return eventDate.toDateString() === day.toDateString();
        });

        // Sort events by start time
        return dayEvents.sort((a, b) => {
            const timeA = new Date(a.startTime).getTime();
            const timeB = new Date(b.startTime).getTime();
            return timeA - timeB;
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Calculate height for event card - increase height for better visibility
    const EVENT_HEIGHT = 32; // Increased from 24 to 32
    const EVENT_MARGIN = 6; // Increased from 4 to 6

    const getMatchDayText = (day: Date | null) => {
        if (!day) return '';

        // Saturday is match day (6)
        const dayOfWeek = day.getDay();
        const daysTillMatchDay = (6 - dayOfWeek + 7) % 7; // Days until next Saturday
        const daysFromMatchDay = (dayOfWeek - 6 + 7) % 7; // Days since last Saturday

        if (dayOfWeek === 6) {
            // It's a match day
            return 'MD';
        } else if (daysTillMatchDay < daysFromMatchDay) {
            // Closer to next match day
            return `MD-${daysTillMatchDay}`;
        } else {
            // Closer to previous match day or equidistant
            return `MD+${daysFromMatchDay}`;
        }
    };

    const getMatchDayBackgroundColor = (day: Date | null) => {
        if (!day) return '';
        return day.getDay() === 6 ? 'rgb(139, 92, 246)' : '#2b1f4e'; // Purple for match day, dark blue for other days
    };

    const isToday = (day: Date | null) => {
        if (!day) return false;
        const today = new Date();
        return day.getDate() === today.getDate() &&
            day.getMonth() === today.getMonth() &&
            day.getFullYear() === today.getFullYear();
    };

    return (
        <div className="month-view">
            <div className="month-header">
                {weekDays.map((day, index) => (
                    <div key={index} className="month-day-header">
                        {day}
                    </div>
                ))}
            </div>
            <div className="month-grid">
                {monthDays.map((day, index) => {
                    const dayEvents = getEventsForDay(day);
                    const matchDayText = day ? getMatchDayText(day) : '';
                    const backgroundColor = getMatchDayBackgroundColor(day);
                    const isCurrentDay = isToday(day);

                    return (
                        <div
                            key={index}
                            className={`month-day ${!day ? 'empty' : ''}`}
                            onClick={() => day && onTimeSlotClick(day)}
                            style={isCurrentDay ? {
                                backgroundColor: '#17122a' // Light purple background using the same color as chart-purple but with low opacity
                            } : undefined}
                        >
                            {day && (
                                <>
                                    <div
                                        className="add-event-icon"
                                        style={{
                                            position: 'absolute',
                                            top: '5px',
                                            right: '5px',
                                            backgroundColor: '#4a5568',
                                            color: 'white',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '18px',
                                            fontWeight: 'bold',
                                            opacity: 0,
                                            transition: 'opacity 0.2s ease',
                                            zIndex: 10,
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onTimeSlotClick(day);
                                        }}
                                    >
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <AddOutlinedIcon sx={{ fontSize: '14px' }} />
                                        </div>
                                    </div>
                                    <div className="month-day-number">
                                        {day.getDate()}
                                    </div>

                                    <div
                                        className="match-day-indicator"
                                        style={{
                                            position: 'absolute',
                                            top: '4px',
                                            left: '8px',
                                            width: '40px',
                                            height: '20px',
                                            color: `${backgroundColor === '#2b1f4e' ? '#ffffff70' : backgroundColor}`,
                                            borderRadius: '4px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 'bold',
                                            zIndex: 5
                                        }}
                                    >
                                        {matchDayText}
                                    </div>

                                    <div className="month-day-events">
                                        {dayEvents.map((event, eventIndex) => {
                                            const topPosition = eventIndex * (EVENT_HEIGHT + EVENT_MARGIN);

                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`event-card event-${event.type}`}
                                                    style={{
                                                        position: 'absolute',
                                                        top: `${10 + topPosition}px`,
                                                        left: 0,
                                                        right: 0,
                                                        height: `${EVENT_HEIGHT}px`,
                                                        margin: '0 4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                        cursor: 'pointer',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                        fontSize: '12px'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick(event);
                                                    }}
                                                >
                                                    <div className="event-title" style={{
                                                        padding: '0 8px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: event.title.length > 20 ? 'hidden' : 'visible',
                                                        textOverflow: event.title.length > 20 ? 'ellipsis' : 'clip',
                                                        textAlign: event.title.length > 20 ? 'left' : 'center',
                                                        width: '100%'
                                                    }}>
                                                        {event.title}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MonthView; 