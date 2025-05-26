import React, { useState, useEffect } from 'react';
import { ScheduleEvent } from '../../../lib/types';
import { createClient } from '@/lib/client';
import { format } from 'date-fns';

interface UpcomingEventsProps {
    selectedPlayers: string[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ selectedPlayers }) => {
    const [upcomingEvents, setUpcomingEvents] = useState<ScheduleEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUpcomingEvents = async () => {
            try {
                const supabase = createClient();

                // Get the current user
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) {
                    console.error('No authenticated user found');
                    return;
                }

                // Get the user's team ID
                const { data: userTeamData } = await supabase
                    .from("user_team")
                    .select("team_id")
                    .eq('supabase_auth_uid', userData.user.id);

                if (!userTeamData || userTeamData.length === 0) {
                    console.error('No team found for user');
                    return;
                }

                const teamId = userTeamData[0].team_id;

                // Get current date
                const now = new Date();
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 7); // Show events for the next 7 days

                // Fetch upcoming events for the team
                const { data: eventData, error } = await supabase
                    .from("event")
                    .select("*")
                    .eq('team_id', teamId)
                    .gte('start_time', now.toISOString())
                    .lte('start_time', tomorrow.toISOString())
                    .order('start_time', { ascending: true })
                    .limit(5);  // Limit to 5 events

                if (error) {
                    console.error('Error fetching events:', error);
                    return;
                }

                // Convert database events to our Event format
                if (eventData && eventData.length > 0) {
                    const formattedEvents = eventData.map(event => {
                        const players = event.participants?.map((p: any) => p.athlete_id.toString()) || [];

                        // Transform location data to include venue property
                        const locationWithVenue = event.location ? {
                            venue: event.location.name,
                            city: event.location.city,
                            country: event.location.country
                        } : undefined;

                        return {
                            id: event.event_id.toString(),
                            title: event.title,
                            type: event.type,
                            startTime: new Date(event.start_time),
                            endTime: new Date(event.end_time),
                            forTeam: players.length === 0 ? true : event.for_team || false,
                            players: players,
                            notes: event.notes,
                            recurring: event.recurring || false,
                            recurrencePattern: event.recurrence_pattern,
                            // Additional properties based on event type
                            ...(event.type === 'match' && {
                                opponent: event.opponent,
                                location: locationWithVenue
                            }),
                            ...(event.type === 'travel' && {
                                fromLocation: event.from_location,
                                toLocation: event.to_location,
                                transportType: event.transport_type
                            }),
                            ...(event.type === 'hotel' && {
                                hotelName: event.hotel_name,
                                hotelLocation: locationWithVenue
                            }),
                            ...(event.type === 'recovery' && {
                                therapyType: event.therapy_type_id
                            }),
                            ...(event.type === 'training' && {
                                trainingType: event.training_type,
                                venue: locationWithVenue
                            })
                        };
                    });

                    setUpcomingEvents(formattedEvents);
                }
            } catch (error) {
                console.error('Error in fetchUpcomingEvents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUpcomingEvents();
    }, []);

    // Filter events based on selected players if needed
    const filteredEvents = selectedPlayers.length === 0
        ? upcomingEvents
        : upcomingEvents.filter(event =>
            event.forTeam || event.players.some(playerId => selectedPlayers.includes(playerId))
        );

    // Format date for display
    const formatEventTime = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const isToday = date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        const isTomorrow = date.getDate() === tomorrow.getDate() &&
            date.getMonth() === tomorrow.getMonth() &&
            date.getFullYear() === tomorrow.getFullYear();

        if (isToday) {
            return `Today, ${format(date, 'HH:mm')}`;
        } else if (isTomorrow) {
            return `Tomorrow, ${format(date, 'HH:mm')}`;
        } else {
            return format(date, 'EEE, MMM d, HH:mm');
        }
    };

    return (
        <div className="upcoming-events">
            <h3>Upcoming Events</h3>
            <div className="upcoming-events-list">
                {loading ? (
                    <div className="no-events">Loading events...</div>
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map(event => (
                        <div key={event.id} className={`upcoming-event event-${event.type}`}>
                            <div className="upcoming-event-time">{formatEventTime(event.startTime)}</div>
                            <div className="upcoming-event-title">{event.title}</div>
                        </div>
                    ))
                ) : (
                    <div className="no-events">No upcoming events</div>
                )}
            </div>
        </div>
    );
};

export default UpcomingEvents; 