'use client';

import React, { useState, useEffect, useRef } from 'react';
import './schedule.css';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import MonthView from './components/MonthView';
import EventDialog from './components/EventDialog';
import EventDetails from './components/EventDetails';
import TeamMembers from './components/TeamMembers';
import UpcomingEvents from './components/UpcomingEvents';
import { ScheduleEvent, EventType, Player } from '../../lib/types';
import { createClient } from '@/lib/client';
import SearchIcon from '@mui/icons-material/Search';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

// Mock data for testing

const SchedulePage = () => {
    const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('day');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState<ScheduleEvent[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
    const [isAddingEvent, setIsAddingEvent] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEventTypes, setSelectedEventTypes] = useState<EventType[]>(['recovery', 'match', 'training', 'travel', 'hotel', 'rest']);
    const [initialEventDate, setInitialEventDate] = useState<Date | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [isCreatingEvent, setIsCreatingEvent] = useState(false);
    const [isUpdatingEvent, setIsUpdatingEvent] = useState(false);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isSearchExpanded, setIsSearchExpanded] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    }, [events]);

    useEffect(() => {
        const fetchPlayers = async () => {
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

                // Fetch athletes for the team
                const { data: athleteData, error } = await supabase
                    .from("athlete")
                    .select("athlete_id, first_name, last_name")
                    .eq('team_id', teamId);

                if (error) {
                    console.error('Error fetching athletes:', error);
                    return;
                }

                // Convert athletes to Player format
                const fetchedPlayers: Player[] = athleteData.map(athlete => ({
                    id: parseInt(athlete.athlete_id),
                    name: `${athlete.first_name} ${athlete.last_name}`,
                    position: 'Player' // Default position since it's not in the athlete data
                }));

                setPlayers(fetchedPlayers);

                // Select all players by default
                const allPlayerIds = fetchedPlayers.map(player => player.id.toString());
                setSelectedPlayers(allPlayerIds);
            } catch (error) {
                console.error('Error in fetchPlayers:', error);
            }
        };

        fetchPlayers();
    }, []);

    // Fetch events from the database
    useEffect(() => {
        const fetchEvents = async () => {
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

                // Fetch events using the new API endpoint
                const response = await fetch(`/api/event?team_id=${teamId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }

                const { events } = await response.json();

                // Convert database events to our ScheduleEvent format
                if (events && events.length > 0) {
                    const formattedEvents = events.map((event: any) => {
                        const players = event.participants?.map((p: any) => p.athlete_id.toString()) || [];

                        // Transform location data to include venue property
                        const locationWithVenue = event.location ? {
                            venue: event.location.name,
                            city: event.location.city,
                            country: event.location.country
                        } : undefined;

                        return {
                            id: event.event_id.toString(),
                            title: event.title || '',
                            type: getEventTypeFromId(event.event_type_id),
                            startTime: new Date(event.start_time),
                            endTime: new Date(event.end_time),
                            forTeam: players.length === 0 ? true : event.for_team || false,
                            players: players,
                            notes: event.notes,
                            recurring: event.recurring || false,
                            recurrencePattern: event.recurrence_pattern,
                            // Match specific fields
                            ...(event.event_type_id === 1 && {
                                opponent: event.opponent,
                                location: locationWithVenue
                            }),
                            // Travel specific fields
                            ...(event.event_type_id === 2 && {
                                fromLocation: event.from_location ? {
                                    venue: event.from_location.name,
                                    city: event.from_location.city,
                                    country: event.from_location.country
                                } : undefined,
                                toLocation: event.to_location ? {
                                    venue: event.to_location.name,
                                    city: event.to_location.city,
                                    country: event.to_location.country
                                } : undefined,
                                transportType: event.transport_type
                            }),
                            // Hotel specific fields
                            ...(event.event_type_id === 3 && {
                                hotelName: event.hotel_name,
                                hotelLocation: locationWithVenue
                            }),
                            // Recovery specific fields
                            ...(event.event_type_id === 5 && {
                                therapyType: event.therapy_type_id
                            }),
                            // Training specific fields
                            ...(event.event_type_id === 6 && {
                                trainingType: event.training_type,
                                venue: locationWithVenue
                            })
                        };
                    });

                    setEvents(formattedEvents);
                }
            } catch (error) {
                console.error('Error in fetchEvents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Helper function to convert event type ID to EventType
    const getEventTypeFromId = (id: number): EventType => {
        switch (id) {
            case 1: return 'match';
            case 2: return 'travel';
            case 3: return 'hotel';
            case 4: return 'rest';
            case 5: return 'recovery';
            case 6: return 'training';
            default: return 'training';
        }
    };

    // Filter events based on search term, selected players, and event types
    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Show event if it's for the team OR if it includes at least one selected player
        const matchesPlayers =
            event.forTeam ||
            (event.players.length > 0 && event.players.some(playerId => selectedPlayers.includes(playerId)));

        // Only show events of selected types
        const matchesType = selectedEventTypes.includes(event.type);

        return matchesSearch && matchesPlayers && matchesType;
    });

    const handleEventClick = (event: ScheduleEvent) => {
        setSelectedEvent(event);
    };

    const handleTimeSlotClick = (date: Date) => {
        setInitialEventDate(date);
        setIsAddingEvent(true);
    };

    const handleAddEvent = async (event: Omit<ScheduleEvent, 'id'>) => {
        try {
            setIsCreatingEvent(true);
            // Map event type to event_type_id
            const eventTypeToId: Record<EventType, number> = {
                'match': 1,
                'travel': 2,
                'hotel': 3,
                'rest': 4,
                'recovery': 5,
                'training': 6
            };

            // Get the current user's team ID
            const supabase = createClient();
            const { data: userData } = await supabase.auth.getUser();
            if (!userData?.user) {
                console.error('No authenticated user found');
                return;
            }

            const { data: userTeamData } = await supabase
                .from("user_team")
                .select("team_id")
                .eq('supabase_auth_uid', userData.user.id)
                .single();

            if (!userTeamData) {
                console.error('No team found for user');
                return;
            }

            // Prepare the request body
            const requestBody = {
                team_id: userTeamData.team_id,
                event_type_id: eventTypeToId[event.type],
                start_time: event.startTime.toISOString(),
                end_time: event.endTime.toISOString(),
                notes: event.notes,
                title: event.title,
                participants: !event.forTeam ? event.players.map(id => parseInt(id)) : [],
                // Set location for events that need it
                location: event.type === 'match' ? {
                    venue: event.location?.venue,
                    city: event.location?.city || '',
                    country: event.location?.country || ''
                }
                    : event.type === 'hotel' ? {
                        venue: event.hotelLocation?.venue,
                        city: event.hotelLocation?.city || '',
                        country: event.hotelLocation?.country || ''
                    }
                        : event.type === 'training' ? {
                            venue: event.venue?.venue,
                            city: event.venue?.city || '',
                            country: event.venue?.country || ''
                        }
                            : undefined,
                // Event type specific fields
                ...(event.type === 'match' && {
                    opponent: event.opponent
                }),
                ...(event.type === 'travel' && {
                    from_location_id: event.fromLocation,
                    to_location_id: event.toLocation,
                    transport_type: event.transportType
                }),
                ...(event.type === 'hotel' && {
                    hotel_name: event.hotelName
                }),
                ...(event.type === 'recovery' && {
                    therapy_type_id: event.therapyType
                }),
                ...(event.type === 'training' && {
                    training_type: event.trainingType,
                    gps_data: event.gpsFile
                })
            };

            // Make the POST request
            const response = await fetch('/api/event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                throw new Error('Failed to create event');
            }

            const data = await response.json();

            // Add the new event to the state with the returned event_id
            const newEvent = {
                ...event,
                id: data.event.event_id.toString()
            };
            setEvents(prevEvents => [...prevEvents, newEvent]);

            // Only close the dialog and reset state after successful save
            setIsAddingEvent(false);
            setInitialEventDate(undefined);

        } catch (error) {
            console.error('Error in handleAddEvent:', error);
            // Don't close the dialog if there was an error
        } finally {
            setIsCreatingEvent(false);
        }
    };

    const handleEditEvent = async (event: Omit<ScheduleEvent, 'id'>) => {
        if (selectedEvent) {
            try {
                setIsUpdatingEvent(true);
                // Map event type to event_type_id
                const eventTypeToId: Record<EventType, number> = {
                    'match': 1,
                    'travel': 2,
                    'hotel': 3,
                    'rest': 4,
                    'recovery': 5,
                    'training': 6
                };

                // Get the current user's team ID
                const supabase = createClient();
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) {
                    console.error('No authenticated user found');
                    return;
                }

                const { data: userTeamData } = await supabase
                    .from("user_team")
                    .select("team_id")
                    .eq('supabase_auth_uid', userData.user.id)
                    .single();

                if (!userTeamData) {
                    console.error('No team found for user');
                    return;
                }

                // Prepare the request body
                const requestBody = {
                    event_id: selectedEvent.id,
                    team_id: userTeamData.team_id,
                    event_type_id: eventTypeToId[event.type],
                    start_time: event.startTime.toISOString(),
                    end_time: event.endTime.toISOString(),
                    notes: event.notes,
                    title: event.title,
                    participants: !event.forTeam ? event.players.map(id => parseInt(id)) : [],
                    // Set location for events that need it
                    location: event.type === 'match' ? {
                        venue: event.location?.venue,
                        city: event.location?.city || '',
                        country: event.location?.country || ''
                    }
                        : event.type === 'hotel' ? {
                            venue: event.hotelLocation?.venue,
                            city: event.hotelLocation?.city || '',
                            country: event.hotelLocation?.country || ''
                        }
                            : event.type === 'training' ? {
                                venue: event.venue?.venue,
                                city: event.venue?.city || '',
                                country: event.venue?.country || ''
                            }
                                : undefined,
                    // Event type specific fields
                    ...(event.type === 'match' && {
                        opponent: event.opponent
                    }),
                    ...(event.type === 'travel' && {
                        from_location_id: event.fromLocation,
                        to_location_id: event.toLocation,
                        transport_type: event.transportType
                    }),
                    ...(event.type === 'hotel' && {
                        hotel_name: event.hotelName
                    }),
                    ...(event.type === 'recovery' && {
                        therapy_type_id: event.therapyType
                    }),
                    ...(event.type === 'training' && {
                        training_type: event.trainingType,
                        gps_data: event.gpsFile
                    })
                };

                // Make the PUT request
                const response = await fetch('/api/event', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    throw new Error('Failed to update event');
                }

                // Update the event in the state
                const updatedEvents = events.map(e =>
                    e.id === selectedEvent.id ? { ...event, id: e.id } : e
                );
                setEvents(updatedEvents);
                setSelectedEvent(null);
                setIsEditingEvent(false);
            } catch (error) {
                console.error('Error in handleEditEvent:', error);
            } finally {
                setIsUpdatingEvent(false);
            }
        }
    };

    const handlePlayerToggle = (playerId: string) => {
        if (selectedPlayers.includes(playerId)) {
            setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
        } else {
            setSelectedPlayers([...selectedPlayers, playerId]);
        }
    };

    const handleEventTypeToggle = (type: EventType) => {
        if (selectedEventTypes.includes(type)) {
            setSelectedEventTypes(selectedEventTypes.filter(t => t !== type));
        } else {
            setSelectedEventTypes([...selectedEventTypes, type]);
        }
    };

    const handleDeleteEvent = async (eventId: string) => {
        try {
            // Remove the event from the local state
            setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
            // Close any open dialogs and reset form state
            setIsEditingEvent(false);
            setSelectedEvent(null);
            setIsAddingEvent(false);
            setInitialEventDate(undefined);
        } catch (error) {
            console.error('Error handling event deletion:', error);
        }
    };

    const renderCalendarView = () => {
        const props = {
            currentDate,
            events: filteredEvents,
            onEventClick: handleEventClick,
            onTimeSlotClick: handleTimeSlotClick,
            players: players
        };

        switch (currentView) {
            case 'day':
                return <DayView {...props} />;
            case 'week':
                return <WeekView {...props} />;
            case 'month':
                return <MonthView {...props} />;
            default:
                return null;
        }
    };

    useEffect(() => {
        // Focus the input when search is expanded
        if (isSearchExpanded && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isSearchExpanded]);

    useEffect(() => {
        // Handle click outside to collapse search
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node) &&
                isSearchExpanded
            ) {
                setIsSearchExpanded(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isSearchExpanded]);

    return (
        <div id="schedule-page" className="schedule-container">
            <header className="schedule-header">
                <div className="header-container">
                    {/* <h1 className="header-title"></h1> */}
                    <div className="event-badges">
                        <span
                            className={`event-badge badge-recovery ${selectedEventTypes.includes('recovery') ? 'active' : ''}`}
                            onClick={() => handleEventTypeToggle('recovery')}
                        >
                            Recovery
                        </span>
                        <span
                            className={`event-badge badge-match ${selectedEventTypes.includes('match') ? 'active' : ''}`}
                            onClick={() => handleEventTypeToggle('match')}
                        >
                            Match
                        </span>
                        <span
                            className={`event-badge badge-training ${selectedEventTypes.includes('training') ? 'active' : ''}`}
                            onClick={() => handleEventTypeToggle('training')}
                        >
                            Training
                        </span>
                        <span
                            className={`event-badge badge-travel ${selectedEventTypes.includes('travel') ? 'active' : ''}`}
                            onClick={() => handleEventTypeToggle('travel')}
                        >
                            Travel
                        </span>
                        <span
                            className={`event-badge badge-hotel ${selectedEventTypes.includes('hotel') ? 'active' : ''}`}
                            onClick={() => handleEventTypeToggle('hotel')}
                        >
                            Hotel
                        </span>
                        <span
                            className={`event-badge badge-rest ${selectedEventTypes.includes('rest') ? 'active' : ''}`}
                            onClick={() => handleEventTypeToggle('rest')}
                        >
                            Rest Day
                        </span>
                    </div>
                    <button
                        className="add-event-button"
                        onClick={() => setIsAddingEvent(true)}
                    >
                        <AddOutlinedIcon fontSize='small' />
                    </button>
                    <div className="header-controls">
                        <div
                            ref={searchContainerRef}
                            className={`search-container ${isSearchExpanded ? 'expanded' : ''}`}
                        >
                            {!isSearchExpanded ? (
                                <div
                                    className="search-icon"
                                    onClick={() => setIsSearchExpanded(true)}
                                >
                                    <SearchIcon />
                                </div>
                            ) : (
                                <>
                                    <div className="search-icon-small">
                                        <SearchIcon fontSize="small" />
                                    </div>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        className="search-input"
                                        placeholder="Search events..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </>
                            )}
                        </div>
                        {isSearchExpanded && (
                            <div
                                className="search-overlay"
                                onClick={() => setIsSearchExpanded(false)}
                            />
                        )}
                    </div>
                    <div className='nav-controls-container'>
                        <div className='nav-controls-wrapper'>
                            <div className="nav-controls">
                                <button
                                    className="nav-button"
                                    onClick={() => {
                                        const newDate = new Date(currentDate);
                                        if (currentView === 'day') {
                                            newDate.setDate(currentDate.getDate() - 1);
                                        } else if (currentView === 'week') {
                                            newDate.setDate(currentDate.getDate() - 7);
                                        } else if (currentView === 'month') {
                                            newDate.setMonth(currentDate.getMonth() - 1);
                                        }
                                        setCurrentDate(newDate);
                                    }}
                                >
                                    ←
                                </button>
                                <span>
                                    {currentView === 'day' && currentDate.toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                    {currentView === 'week' && (() => {
                                        // Calculate the start of the week (Monday)
                                        const start = new Date(currentDate);
                                        const day = start.getDay();
                                        const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
                                        start.setDate(diff);

                                        // Calculate the end of the week (Sunday)
                                        const end = new Date(start);
                                        end.setDate(start.getDate() + 6);

                                        return `${start.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })} - ${end.toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}`;
                                    })()}
                                    {currentView === 'month' && currentDate.toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long'
                                    })}
                                </span>
                                <button
                                    className="nav-button"
                                    onClick={() => {
                                        const newDate = new Date(currentDate);
                                        if (currentView === 'day') {
                                            newDate.setDate(currentDate.getDate() + 1);
                                        } else if (currentView === 'week') {
                                            newDate.setDate(currentDate.getDate() + 7);
                                        } else if (currentView === 'month') {
                                            newDate.setMonth(currentDate.getMonth() + 1);
                                        }
                                        setCurrentDate(newDate);
                                    }}
                                >
                                    →
                                </button>
                                <button
                                    className="nav-button"
                                    onClick={() => setCurrentDate(new Date())}
                                >
                                    Today
                                </button>
                            </div>

                            <div className="view-toggle">
                                <button
                                    className={`nav-button ${currentView === 'day' ? 'active' : ''}`}
                                    onClick={() => setCurrentView('day')}
                                >
                                    Day
                                </button>
                                <button
                                    className={`nav-button ${currentView === 'week' ? 'active' : ''}`}
                                    onClick={() => setCurrentView('week')}
                                >
                                    Week
                                </button>
                                <button
                                    className={`nav-button ${currentView === 'month' ? 'active' : ''}`}
                                    onClick={() => setCurrentView('month')}
                                >
                                    Month
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>



            <div className="schedule-content">
                <div className="left-column">
                    <div className="team-members-container">
                        <TeamMembers
                            selectedPlayers={selectedPlayers}
                            onPlayerToggle={handlePlayerToggle}
                        />
                    </div>
                    <div className="upcoming-events-container">
                        <UpcomingEvents selectedPlayers={selectedPlayers} />
                    </div>
                </div>
                <main className="calendar-area">
                    {loading ? (
                        <div className="loading-indicator">Loading calendar...</div>
                    ) : (
                        renderCalendarView()
                    )}
                </main>
            </div>

            {/* Event Details Modal */}
            {selectedEvent && (
                <EventDetails
                    event={selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onEdit={() => {
                        setIsEditingEvent(true);
                    }}
                    onDelete={handleDeleteEvent}
                />
            )}

            {/* Event Dialog for adding/editing events */}
            <EventDialog
                isOpen={isAddingEvent || isEditingEvent}
                onClose={() => {
                    setIsAddingEvent(false);
                    setIsEditingEvent(false);
                    setInitialEventDate(undefined);
                }}
                event={selectedEvent || undefined}
                onSubmit={isEditingEvent ? handleEditEvent : handleAddEvent}
                initialDate={initialEventDate}
                isCreatingEvent={isCreatingEvent || isUpdatingEvent}
                onDelete={handleDeleteEvent}
            />
        </div>
    );
};

export default SchedulePage;