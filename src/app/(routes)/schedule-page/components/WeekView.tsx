import React, { useState, useEffect, useRef } from 'react';
import { CalendarViewProps, ScheduleEvent } from '../../../lib/types';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
interface Player {
    id: number;
    name: string;
}

interface WeekViewProps {
    currentDate: Date;
    events: ScheduleEvent[];
    players: Player[];
    onEventClick: (event: ScheduleEvent) => void;
    onTimeSlotClick: (date: Date) => void;
}

const formatTimeRange = (startTime: string | Date, endTime: string | Date) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const formatStartTime = (startTime: string | Date) => {
    const start = new Date(startTime);
    return start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const WeekView: React.FC<WeekViewProps> = ({ currentDate, events, players, onEventClick, onTimeSlotClick }) => {
    const [timeSlotHeight, setTimeSlotHeight] = useState(48); // Default value, will be updated
    const eventTitleRefs = useRef<{ [key: string]: HTMLSpanElement | null }>({});

    useEffect(() => {
        // Get the height of a time slot after the component mounts
        const timeSlot = document.querySelector('.time-slot');
        if (timeSlot) {
            setTimeSlotHeight(timeSlot.getBoundingClientRect().height);
        }
    }, []);

    const getWeekDays = (date: Date) => {
        const start = new Date(date);
        // Adjust the calculation to handle Sunday correctly
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        start.setDate(diff);

        return Array.from({ length: 7 }, (_, i) => {
            const day = new Date(start);
            day.setDate(start.getDate() + i);
            return day;
        });
    };

    const weekDays = getWeekDays(currentDate);
    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        return { hour, minute: 0 };
    });

    const getEventsForDayAndTime = (day: Date, timeSlot: { hour: number; minute: number }) => {
        const slotDate = new Date(day);
        slotDate.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
        const nextSlotDate = new Date(slotDate);
        nextSlotDate.setHours(timeSlot.hour + 1, timeSlot.minute, 0, 0);

        return events.filter(event => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            // Only show events that start in this time slot
            return eventStart >= slotDate && eventStart < nextSlotDate;
        });
    };

    // Function to check if there is an event overlapping with this time slot
    const hasEventAbove = (day: Date, hour: number) => {
        // Get all events for this day
        const dayEvents = events.filter(event => {
            const eventStart = new Date(event.startTime);
            const eventDay = new Date(eventStart);
            eventDay.setHours(0, 0, 0, 0);
            const currentDay = new Date(day);
            currentDay.setHours(0, 0, 0, 0);
            return eventDay.getTime() === currentDay.getTime();
        });

        return dayEvents.some(event => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            const slotStart = new Date(day);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(day);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            // Check if event spans this time slot but didn't start in it
            return (eventStart < slotStart && eventEnd > slotStart) ||
                (eventStart >= slotStart && eventStart < slotEnd);
        });
    };

    const calculateEventHeight = (startTime: Date, endTime: Date) => {
        const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return durationInHours * timeSlotHeight;
    };

    const calculateEventTop = (startTime: Date) => {
        // Use local time directly
        const localHours = startTime.getHours();
        const localMinutes = startTime.getMinutes();
        console.log('Event time:', startTime.toISOString(),
            'Local time:', startTime.toString(),
            'Local hours:', localHours,
            'minutes:', localMinutes);
        // Calculate position from midnight
        return (localHours + localMinutes / 60) * timeSlotHeight;
    };

    const getMatchDayText = (day: Date) => {
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

    const getMatchDayBackgroundColor = (day: Date) => {
        return day.getDay() === 6 ? 'rgb(139, 92, 246)' : '#2b1f4e'; // Purple for match day, dark blue for other days
    };

    return (
        <div className="week-view">
            <div className="week-header">
                <div className="time-column-header"></div>
                {weekDays.map((day, index) => {
                    const isMatchDay = day.getDay() === 6;
                    const matchDayText = getMatchDayText(day);
                    return (
                        <div key={index} className="week-day-header" style={{ position: 'relative' }}>
                            {/* Match day indicator as a pill at the top */}
                            <div
                                className="match-day-indicator"
                                style={{
                                    position: 'absolute',
                                    top: '0',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '36px',
                                    height: '16px',
                                    backgroundColor: getMatchDayBackgroundColor(day),
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '9px',
                                    fontWeight: 'bold',
                                    boxShadow: isMatchDay ? '0 2px 4px rgba(139, 92, 246, 0.3)' : 'none',
                                    zIndex: 2
                                }}
                            >
                                {matchDayText}
                            </div>

                            {/* Add a slight top padding to accommodate the indicator */}
                            <div style={{ paddingTop: '16px' }}>
                                <div className="week-day-name" style={{
                                    color: isMatchDay ? 'rgb(139, 92, 246)' : 'white',
                                    fontWeight: isMatchDay ? 'bold' : 'normal'
                                }}>
                                    {day.toLocaleDateString([], { weekday: 'short' })}
                                </div>
                                <div className="week-day-date">
                                    {day.toLocaleDateString([], { day: 'numeric' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="week-grid">
                <div className="time-column">
                    {timeSlots.map((timeSlot, index) => (
                        <div key={index} className="time-slot">
                            {`${timeSlot.hour.toString().padStart(2, '0')}:${timeSlot.minute.toString().padStart(2, '0')}`}
                        </div>
                    ))}
                </div>
                {weekDays.map((day, dayIndex) => {
                    // Set the day to midnight in local time
                    const dayStart = new Date(day);
                    dayStart.setHours(0, 0, 0, 0);
                    const dayEnd = new Date(day);
                    dayEnd.setHours(23, 59, 59, 999);

                    // Get all events for this day
                    const dayEvents = events.filter(event => {
                        const eventStart = new Date(event.startTime);
                        const eventDay = new Date(eventStart);
                        eventDay.setHours(0, 0, 0, 0);
                        const currentDay = new Date(day);
                        currentDay.setHours(0, 0, 0, 0);
                        return eventDay.getTime() === currentDay.getTime();
                    });

                    console.log('Day:', day.toISOString(), 'Local day:', day.toString(), 'Events:', dayEvents.map(e => ({
                        title: e.title,
                        start: e.startTime,
                        localStart: new Date(e.startTime).toString(),
                        end: e.endTime
                    })));

                    return (
                        <div key={dayIndex} className="day-column" style={{ position: 'relative' }}>
                            {timeSlots.map((timeSlot, timeIndex) => {
                                const shouldShowIcon = !hasEventAbove(day, timeSlot.hour);

                                return (
                                    <div
                                        key={timeIndex}
                                        className="time-slot"
                                        onClick={() => {
                                            const slotDate = new Date(day);
                                            slotDate.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
                                            onTimeSlotClick(slotDate);
                                        }}
                                        style={{
                                            position: 'relative',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {shouldShowIcon && (
                                            <>
                                                <div
                                                    className="add-event-icon"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '50%',
                                                        left: '50%',
                                                        transform: 'translate(-50%, -50%)',
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
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <AddOutlinedIcon sx={{ fontSize: '14px' }} />
                                                    </div>
                                                </div>
                                                <style jsx>{`
                                                    .time-slot:hover .add-event-icon {
                                                        opacity: 1;
                                                    }
                                                `}</style>
                                            </>
                                        )}
                                        {/* Only render events that start at this time slot */}
                                        {dayEvents.filter(event => {
                                            const eventStart = new Date(event.startTime);
                                            return eventStart.getHours() === timeSlot.hour;
                                        }).map((event) => {
                                            const startTime = new Date(event.startTime);
                                            const endTime = new Date(event.endTime);
                                            const height = calculateEventHeight(startTime, endTime);

                                            // Position based on minutes within the hour
                                            const minuteOffset = (startTime.getMinutes() / 60) * timeSlotHeight;

                                            return (
                                                <div
                                                    key={event.id}
                                                    className={`event-card event-${event.type}`}
                                                    style={{
                                                        height: `${height}px`,
                                                        position: 'absolute',
                                                        top: `${minuteOffset}px`,
                                                        left: '0',
                                                        right: '0',
                                                        zIndex: 2,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'flex-start',
                                                        padding: '2px 4px',
                                                        boxSizing: 'border-box',
                                                        borderRadius: '4px',
                                                        overflow: 'visible',
                                                        fontSize: '0.85rem',
                                                        lineHeight: '1.2'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick(event);
                                                    }}
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '2px'
                                                    }}>
                                                        <span
                                                            ref={el => {
                                                                eventTitleRefs.current[event.id] = el;
                                                                return undefined;
                                                            }}
                                                            style={{
                                                                fontWeight: 'bold',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            {event.title}
                                                        </span>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'flex-start',
                                                            gap: '4px',
                                                            height: '100%'
                                                        }}>
                                                            <span style={{
                                                                fontSize: '0.75rem',
                                                                opacity: 0.8,
                                                                marginTop: '4px',
                                                                marginRight: '4px'
                                                            }}>
                                                                {formatStartTime(event.startTime)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Make decision based on event title length and overall event height */}
                                                    {(() => {
                                                        // Simple heuristic: taller events and shorter titles get badges
                                                        const titleLength = event.title.length;
                                                        const minHeightNeeded = titleLength > 10 ? 65 : 55;

                                                        if (height >= minHeightNeeded) {
                                                            return (
                                                                <div style={{
                                                                    display: 'flex',
                                                                    flexWrap: 'wrap',
                                                                    gap: '2px',
                                                                    marginTop: '4px'
                                                                }}>
                                                                    {event.forTeam ? (
                                                                        <div style={{
                                                                            backgroundColor: '#4a5568',
                                                                            color: 'white',
                                                                            padding: '1px 4px',
                                                                            borderRadius: '4px',
                                                                            fontSize: '0.7rem',
                                                                            marginTop: '-2px'
                                                                        }}>
                                                                            Team
                                                                        </div>
                                                                    ) : event.players && event.players.length > 0 ? (
                                                                        <div style={{ display: 'flex', gap: '2px' }}>
                                                                            {event.players.slice(0, 3).map(playerId => {
                                                                                const player = players.find(p => p.id === parseInt(playerId));
                                                                                if (!player) return null;
                                                                                const initials = player.name.split(' ').map(n => n[0]).join('');
                                                                                return (
                                                                                    <div key={playerId} style={{
                                                                                        backgroundColor: '#4a5568',
                                                                                        color: 'white',
                                                                                        width: '20px',
                                                                                        height: '20px',
                                                                                        borderRadius: '50%',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        fontSize: '0.7rem'
                                                                                    }}>
                                                                                        {initials}
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                            {event.players.length > 3 && (
                                                                                <div style={{
                                                                                    backgroundColor: '#4a5568',
                                                                                    color: 'white',
                                                                                    width: '20px',
                                                                                    height: '20px',
                                                                                    borderRadius: '50%',
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'center',
                                                                                    fontSize: '0.7rem'
                                                                                }}>
                                                                                    +{event.players.length - 3}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ) : null}
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    })()}

                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '2px',
                                                        marginTop: 'auto'
                                                    }}>
                                                        {/* Team badge and players moved to their own section above */}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeekView; 