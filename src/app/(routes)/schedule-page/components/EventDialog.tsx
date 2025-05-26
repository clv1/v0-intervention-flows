import React, { useState, useEffect } from 'react';
import { ScheduleEvent, EventType, Player, Location } from '../../../lib/types';
import PlayerCard from './PlayerCard';
import { createClient } from '@/lib/client';
import { CircularProgress } from '@mui/material';
import { Button } from '@mui/material';

const getEventTypeColor = (type: string) => {
    switch (type) {
        case 'match':
            return {
                backgroundColor: '#f58a8250',
                borderColor: '#f58a82'
            };
        case 'training':
            return {
                backgroundColor: '#c9bdff50',
                borderColor: '#c9bdff'
            };
        case 'travel':
            return {
                backgroundColor: '#ffbb8d50',
                borderColor: '#ffbb8d'
            };
        case 'hotel':
            return {
                backgroundColor: '#7fb5ff50',
                borderColor: '#7fb5ff'
            };
        case 'rest':
            return {
                backgroundColor: '#8edd9250',
                borderColor: '#8edd92'
            };
        case 'recovery':
            return {
                backgroundColor: '#4a4a7565',
                borderColor: '#4a4a75'
            };
        default:
            return {
                backgroundColor: '#CCCCCC50',
                borderColor: '#CCCCCC'
            };
    }
};

interface EventDialogProps {
    isOpen: boolean;
    onClose: () => void;
    event?: ScheduleEvent;
    onSubmit: (event: Omit<ScheduleEvent, 'id'>) => void;
    initialDate?: Date;
    isCreatingEvent?: boolean;
    onDelete?: (eventId: string) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
    isOpen,
    onClose,
    event,
    onSubmit,
    initialDate,
    isCreatingEvent = false,
    onDelete
}) => {
    const [step, setStep] = useState(1);
    const [title, setTitle] = useState('');
    const [type, setType] = useState<EventType>('training');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [forTeam, setForTeam] = useState(true);
    const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
    const [players, setPlayers] = useState<Player[]>([]);
    const [loadingPlayers, setLoadingPlayers] = useState(true);
    const [notes, setNotes] = useState('');
    const [recurring, setRecurring] = useState(false);
    const [recurrencePattern, setRecurrencePattern] = useState('');

    // Match specific fields
    const [opponent, setOpponent] = useState('');
    const [venue, setVenue] = useState('');
    const [city, setCity] = useState('');
    const [country, setCountry] = useState('');

    // Travel specific fields
    const [fromVenue, setFromVenue] = useState('');
    const [fromCity, setFromCity] = useState('');
    const [fromCountry, setFromCountry] = useState('');
    const [toVenue, setToVenue] = useState('');
    const [toCity, setToCity] = useState('');
    const [toCountry, setToCountry] = useState('');
    const [transportType, setTransportType] = useState<'flight' | 'bus' | 'train' | 'car'>('flight');

    // Hotel specific fields
    const [hotelName, setHotelName] = useState('');
    const [hotelVenue, setHotelVenue] = useState('');
    const [hotelCity, setHotelCity] = useState('');
    const [hotelCountry, setHotelCountry] = useState('');

    // Recovery specific fields
    const [therapyType, setTherapyType] = useState<string>('1');

    // Therapy types for dropdown
    const therapyTypes = [
        { id: '1', name: 'Cold Shower' },
        { id: '2', name: 'Cold Plunge' },
        { id: '3', name: 'Cryotherapy' },
        { id: '4', name: 'Sauna' },
        { id: '5', name: 'Contrast Therapy' },
        { id: '6', name: 'Breathwork' },
        { id: '7', name: 'Foam Rolling' },
        { id: '8', name: 'Massage' },
        { id: '9', name: 'Massage Gun' },
        { id: '10', name: 'Recovery Sleeves' },
        { id: '11', name: 'Yoga / Pilates' }
    ];

    // Training specific fields
    const [trainingType, setTrainingType] = useState<'tactical' | 'physical' | 'technical'>('tactical');
    const [trainingVenue, setTrainingVenue] = useState('');
    const [trainingCity, setTrainingCity] = useState('');
    const [trainingCountry, setTrainingCountry] = useState('');

    // GPS file
    const [gpsFile, setGpsFile] = useState<File | null>(null);

    const resetForm = () => {
        setStep(1);
        setTitle('');
        setType('training');
        setStartDate('');
        setStartTime('');
        setEndDate('');
        setEndTime('');
        setForTeam(true);
        setSelectedPlayers([]);
        setNotes('');
        setRecurring(false);
        setRecurrencePattern('');

        // Reset match fields
        setOpponent('');
        setVenue('');
        setCity('');
        setCountry('');

        // Reset travel fields
        setFromVenue('');
        setFromCity('');
        setFromCountry('');
        setToVenue('');
        setToCity('');
        setToCountry('');
        setTransportType('flight');

        // Reset hotel fields
        setHotelName('');
        setHotelVenue('');
        setHotelCity('');
        setHotelCountry('');

        // Reset recovery fields
        setTherapyType('1');

        // Reset training fields
        setTrainingType('tactical');
        setTrainingVenue('');
        setTrainingCity('');
        setTrainingCountry('');

        // Reset GPS file
        setGpsFile(null);
    };

    // Reset form when dialog is opened/closed
    useEffect(() => {
        if (isOpen) {
            resetForm();
            if (event) {
                // Edit mode - populate form with event data
                setTitle(event.title);
                setType(event.type);
                setStartDate(formatDateForInput(event.startTime));
                setStartTime(formatTimeForInput(event.startTime));
                setEndDate(formatDateForInput(event.endTime));
                setEndTime(formatTimeForInput(event.endTime));
                setForTeam(event.forTeam);
                setSelectedPlayers(event.players);
                setNotes(event.notes || '');
                setRecurring(event.recurring);
                setRecurrencePattern(event.recurrencePattern || '');

                // Match specific fields
                setOpponent(event.opponent || '');
                setVenue(event.location?.venue || '');
                setCity(event.location?.city || '');
                setCountry(event.location?.country || '');

                // Travel specific fields
                setFromVenue(event.fromLocation?.venue || '');
                setFromCity(event.fromLocation?.city || '');
                setFromCountry(event.fromLocation?.country || '');
                setToVenue(event.toLocation?.venue || '');
                setToCity(event.toLocation?.city || '');
                setToCountry(event.toLocation?.country || '');
                setTransportType(event.transportType || 'flight');

                // Hotel specific fields
                setHotelName(event.hotelName || '');
                setHotelVenue(event.hotelLocation?.venue || '');
                setHotelCity(event.hotelLocation?.city || '');
                setHotelCountry(event.hotelLocation?.country || '');

                // Recovery specific fields
                setTherapyType(event.therapyType || '1');

                // Training specific fields
                setTrainingType(event.trainingType || 'tactical');
                setTrainingVenue(event.venue?.venue || '');
                setTrainingCity(event.venue?.city || '');
                setTrainingCountry(event.venue?.country || '');
            } else if (initialDate) {
                // New event with initial date
                const startTime = new Date(initialDate);
                setStartDate(formatDateForInput(startTime));
                setStartTime(formatTimeForInput(startTime));

                // Set end time to 1 hour after start time
                const endTime = new Date(startTime);
                endTime.setHours(endTime.getHours() + 1);
                setEndDate(formatDateForInput(endTime));
                setEndTime(formatTimeForInput(endTime));
            } else {
                // New event without initial date
                const startTime = new Date();
                setStartDate(formatDateForInput(startTime));
                setStartTime(formatTimeForInput(startTime));

                // Set end time to 1 hour after start time
                const endTime = new Date(startTime);
                endTime.setHours(endTime.getHours() + 1);
                setEndDate(formatDateForInput(endTime));
                setEndTime(formatTimeForInput(endTime));
            }
        }
    }, [isOpen, event, initialDate]);

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
                    id: athlete.athlete_id.toString(),
                    name: `${athlete.first_name} ${athlete.last_name}`,
                    position: 'Player' // Default position since it's not in the athlete data
                }));

                setPlayers(fetchedPlayers);
            } catch (error) {
                console.error('Error in fetchPlayers:', error);
            } finally {
                setLoadingPlayers(false);
            }
        };

        fetchPlayers();
    }, []);

    const formatDateForInput = (date: Date | string) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTimeForInput = (date: Date | string) => {
        const d = new Date(date);
        // Get the local time components
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const startDateTime = new Date(`${startDate}T${startTime}`);
        const endDateTime = new Date(`${endDate}T${endTime}`);

        const newEvent: Omit<ScheduleEvent, 'id'> = {
            title,
            type,
            startTime: startDateTime,
            endTime: endDateTime,
            forTeam,
            players: forTeam ? [] : selectedPlayers,
            notes,
            recurring,
            recurrencePattern: recurring ? recurrencePattern : undefined,

            // Match specific fields
            ...(type === 'match' && {
                opponent,
                location: { venue, city, country }
            }),

            // Travel specific fields
            ...(type === 'travel' && {
                fromLocation: { venue: fromVenue, city: fromCity, country: fromCountry },
                toLocation: { venue: toVenue, city: toCity, country: toCountry },
                transportType
            }),

            // Hotel specific fields
            ...(type === 'hotel' && {
                hotelName,
                hotelLocation: { venue: hotelVenue, city: hotelCity, country: hotelCountry }
            }),

            // Recovery specific fields
            ...(type === 'recovery' && {
                therapyType
            }),

            // Training specific fields
            ...(type === 'training' && {
                trainingType,
                venue: { venue: trainingVenue, city: trainingCity, country: trainingCountry }
            }),

            // GPS data for match and training
            ...((type === 'match' || type === 'training') && gpsFile && {
                gpsFile: { name: gpsFile.name, url: URL.createObjectURL(gpsFile) }
            })
        };

        onSubmit(newEvent);
    };

    const handlePlayerToggle = (playerId: string) => {
        if (selectedPlayers.includes(playerId)) {
            setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
        } else {
            setSelectedPlayers([...selectedPlayers, playerId]);
        }
    };

    const handleNext = () => {
        if (title && type) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleDelete = async () => {
        if (!event?.id) return;

        try {
            const response = await fetch(`/api/event?event_id=${event.id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete event');
            }

            onDelete?.(event.id);
            onClose();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Only close if the click is directly on the overlay (not its children)
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="event-dialog-overlay" onClick={handleOverlayClick}>
            <div className="event-dialog">
                <div className="event-dialog-header">
                    <h2>{event ? 'Edit Event' : 'Add Event'}</h2>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className="event-form">
                    {step === 1 ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="title">Event Title</label>
                                <input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="type">Event Type</label>
                                <select
                                    id="type"
                                    value={type}
                                    onChange={(e) => setType(e.target.value as EventType)}
                                    required
                                >
                                    <option value="match">Match</option>
                                    <option value="travel">Travel</option>
                                    <option value="hotel">Hotel Stay</option>
                                    <option value="rest">Rest Day</option>
                                    <option value="recovery">Recovery Therapy</option>
                                    <option value="training">Training</option>
                                </select>
                            </div>

                            <div className="form-actions">
                                {/* <button type="button" className="cancel-button" onClick={onClose}>
                                    Cancel
                                </button> */}
                                <button type="button" className="next-button" onClick={handleNext}>
                                    Next
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="event-summary">
                                <div
                                    className="event-badge event-type-badge"
                                    style={{ backgroundColor: getEventTypeColor(type).backgroundColor, border: `2px solid ${getEventTypeColor(type).borderColor}` }}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </div>
                                <h3>{title}</h3>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="startDate">Start Date</label>
                                    <input
                                        id="startDate"
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="startTime">Start Time</label>
                                    <input
                                        id="startTime"
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        required={type !== 'rest'}
                                    />
                                </div>
                            </div>

                            {type !== 'rest' && (
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="endDate">End Date</label>
                                        <input
                                            id="endDate"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="endTime">End Time</label>
                                        <input
                                            id="endTime"
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Match specific fields */}
                            {type === 'match' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="opponent">Opponent</label>
                                        <input
                                            id="opponent"
                                            type="text"
                                            value={opponent}
                                            onChange={(e) => setOpponent(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="venue">Venue</label>
                                        <input
                                            id="venue"
                                            type="text"
                                            value={venue}
                                            onChange={(e) => setVenue(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="city">City</label>
                                            <input
                                                id="city"
                                                type="text"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="country">Country</label>
                                            <input
                                                id="country"
                                                type="text"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Travel specific fields */}
                            {type === 'travel' && (
                                <>
                                    <div className="form-group">
                                        <label>From</label>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="Venue"
                                                    value={fromVenue}
                                                    onChange={(e) => setFromVenue(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    value={fromCity}
                                                    onChange={(e) => setFromCity(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="Country"
                                                    value={fromCountry}
                                                    onChange={(e) => setFromCountry(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>To</label>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="Venue"
                                                    value={toVenue}
                                                    onChange={(e) => setToVenue(e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="City"
                                                    value={toCity}
                                                    onChange={(e) => setToCity(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    placeholder="Country"
                                                    value={toCountry}
                                                    onChange={(e) => setToCountry(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="transportType">Transport Type</label>
                                        <select
                                            id="transportType"
                                            value={transportType}
                                            onChange={(e) => setTransportType(e.target.value as 'flight' | 'bus' | 'train' | 'car')}
                                            required
                                        >
                                            <option value="flight">Flight</option>
                                            <option value="bus">Bus</option>
                                            <option value="train">Train</option>
                                            <option value="car">Car</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Hotel specific fields */}
                            {type === 'hotel' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="hotelName">Hotel Name</label>
                                        <input
                                            id="hotelName"
                                            type="text"
                                            value={hotelName}
                                            onChange={(e) => setHotelName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="hotelVenue">Venue</label>
                                        <input
                                            id="hotelVenue"
                                            type="text"
                                            value={hotelVenue}
                                            onChange={(e) => setHotelVenue(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="hotelCity">City</label>
                                            <input
                                                id="hotelCity"
                                                type="text"
                                                value={hotelCity}
                                                onChange={(e) => setHotelCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="hotelCountry">Country</label>
                                            <input
                                                id="hotelCountry"
                                                type="text"
                                                value={hotelCountry}
                                                onChange={(e) => setHotelCountry(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Recovery specific fields */}
                            {type === 'recovery' && (
                                <div className="form-group">
                                    <label htmlFor="therapyType">Type of Therapy</label>
                                    <select
                                        id="therapyType"
                                        value={therapyType}
                                        onChange={(e) => setTherapyType(e.target.value)}
                                        required
                                    >
                                        {therapyTypes.map(therapy => (
                                            <option key={therapy.id} value={therapy.id}>
                                                {therapy.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Training specific fields */}
                            {type === 'training' && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="trainingType">Type of Training</label>
                                        <select
                                            id="trainingType"
                                            value={trainingType}
                                            onChange={(e) => setTrainingType(e.target.value as 'tactical' | 'physical' | 'technical')}
                                            required
                                        >
                                            <option value="tactical">Tactical</option>
                                            <option value="physical">Physical</option>
                                            <option value="technical">Technical</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="trainingVenue">Venue</label>
                                        <input
                                            id="trainingVenue"
                                            type="text"
                                            value={trainingVenue}
                                            onChange={(e) => setTrainingVenue(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="trainingCity">City</label>
                                            <input
                                                id="trainingCity"
                                                type="text"
                                                value={trainingCity}
                                                onChange={(e) => setTrainingCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="trainingCountry">Country</label>
                                            <input
                                                id="trainingCountry"
                                                type="text"
                                                value={trainingCountry}
                                                onChange={(e) => setTrainingCountry(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <div className="player-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={forTeam}
                                            onChange={(e) => setForTeam(e.target.checked)}
                                            className="checkbox-input"
                                            style={{ display: 'none' }}
                                        />
                                        <span className={`checkmark ${forTeam ? 'checked' : ''}`}></span>
                                    </div>
                                    For entire team
                                </label>
                            </div>

                            {!forTeam && (
                                <div className="form-group">
                                    <label>Select Players</label>
                                    <div className="players-list-container">
                                        {loadingPlayers ? (
                                            <div className="no-players">Loading players...</div>
                                        ) : players.length > 0 ? (
                                            players.map(player => (
                                                <PlayerCard
                                                    key={player.id}
                                                    player={player}
                                                    isSelected={selectedPlayers.includes(String(player.id))}
                                                    onToggle={handlePlayerToggle}
                                                />
                                            ))
                                        ) : (
                                            <div className="no-players">No players found</div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="checkbox-label">
                                    <div className="player-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={recurring}
                                            onChange={(e) => setRecurring(e.target.checked)}
                                            className="checkbox-input"
                                            style={{ display: 'none' }}
                                        />
                                        <span className={`checkmark ${recurring ? 'checked' : ''}`}></span>
                                    </div>
                                    Recurring Event
                                </label>
                            </div>

                            {recurring && (
                                <div className="form-group">
                                    <label htmlFor="recurrencePattern">Recurrence Pattern</label>
                                    <select
                                        id="recurrencePattern"
                                        value={recurrencePattern}
                                        onChange={(e) => setRecurrencePattern(e.target.value)}
                                        required
                                    >
                                        <option value="daily">Daily</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="biweekly">Bi-weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="notes">Notes</label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {(type === 'training' || type === 'match') && (
                                <div className="form-group">
                                    <label htmlFor="gpsFile">GPS Data File</label>
                                    <input
                                        id="gpsFile"
                                        type="file"
                                        onChange={(e) => setGpsFile(e.target.files?.[0] || null)}
                                        accept=".gpx,.tcx,.fit"
                                    />
                                </div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="back-button" onClick={handleBack}>
                                    Back
                                </button>
                                {/* <button type="button" className="cancel-button" onClick={onClose}>
                                    Cancel
                                </button> */}
                                <button type="submit" className="submit-button" disabled={isCreatingEvent}>
                                    {isCreatingEvent ? (
                                        <div className="spinner-container">
                                            <div className="spinner"></div>
                                        </div>
                                    ) : (
                                        event ? 'Update Event' : 'Add Event'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default EventDialog; 