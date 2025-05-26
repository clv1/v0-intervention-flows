import React, { useState, useEffect } from 'react';
import { CalendarViewProps } from '../../../lib/types';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
const DayView: React.FC<CalendarViewProps> = ({ currentDate, events, onEventClick, onTimeSlotClick, players }) => {
    const [timeSlotHeight, setTimeSlotHeight] = useState(48); // Default value, will be updated

    useEffect(() => {
        // Get the height of a time slot after the component mounts
        const timeSlot = document.querySelector('.time-slot');
        if (timeSlot) {
            setTimeSlotHeight(timeSlot.getBoundingClientRect().height);
        }
    }, []);

    const timeSlots = Array.from({ length: 24 }, (_, i) => {
        const hour = i;
        return { hour, minute: 0 };
    });

    const calculateEventHeight = (startTime: Date, endTime: Date) => {
        const durationInHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        return durationInHours * timeSlotHeight;
    };

    const formatTimeRange = (startTime: string | Date, endTime: string | Date) => {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };

    // Filter events for the current day
    const dayEvents = events.filter(event => {
        const eventStart = new Date(event.startTime);
        const eventDay = new Date(eventStart);
        eventDay.setHours(0, 0, 0, 0);
        const currentDay = new Date(currentDate);
        currentDay.setHours(0, 0, 0, 0);
        return eventDay.getTime() === currentDay.getTime();
    });

    // Function to check if there is an event overlapping with this time slot
    const hasEventAbove = (hour: number) => {
        return dayEvents.some(event => {
            const eventStart = new Date(event.startTime);
            const eventEnd = new Date(event.endTime);
            const slotStart = new Date(currentDate);
            slotStart.setHours(hour, 0, 0, 0);
            const slotEnd = new Date(currentDate);
            slotEnd.setHours(hour + 1, 0, 0, 0);

            // Check if event spans this time slot but didn't start in it
            return (eventStart < slotStart && eventEnd > slotStart) ||
                (eventStart >= slotStart && eventStart < slotEnd);
        });
    };

    return (
        <div className="day-view">
            <div className="time-column">
                {timeSlots.map((timeSlot, index) => (
                    <div key={index} className="time-slot">
                        {`${timeSlot.hour.toString().padStart(2, '0')}:${timeSlot.minute.toString().padStart(2, '0')}`}
                    </div>
                ))}
            </div>
            <div className="events-column" style={{ position: 'relative' }}>
                {timeSlots.map((timeSlot, index) => {
                    const shouldShowIcon = !hasEventAbove(timeSlot.hour);

                    return (
                        <div
                            key={index}
                            className="time-slot"
                            onClick={() => {
                                const slotDate = new Date(currentDate);
                                slotDate.setHours(timeSlot.hour, timeSlot.minute, 0, 0);
                                onTimeSlotClick(slotDate);
                            }}
                            style={{
                                position: 'relative',
                                cursor: 'pointer'
                            }}
                        >
                            {true && (
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
                                            <span style={{
                                                fontWeight: 'bold',
                                                fontSize: '0.7rem'
                                            }}>
                                                {event.title}
                                            </span>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                            }}>
                                                {event.forTeam ? (
                                                    <div style={{
                                                        backgroundColor: '#4a5568',
                                                        color: 'white',
                                                        padding: '1px 4px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.7rem',
                                                        marginRight: '4px'
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
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    opacity: 0.8
                                                }}>
                                                    {formatTimeRange(event.startTime, event.endTime)}
                                                </span>
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '2px',
                                            marginTop: 'auto'
                                        }}>
                                            {/* Team badge and players moved to the top row */}
                                        </div>
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

export default DayView; 