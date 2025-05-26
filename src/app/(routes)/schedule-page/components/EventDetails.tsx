import React, { useState, useEffect } from 'react';
import { ScheduleEvent, Player } from '../../../lib/types';
import { createClient } from '@/lib/client';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';

interface EventDetailsProps {
    event: ScheduleEvent;
    onClose: () => void;
    onEdit: () => void;
    onDelete?: (id: string) => void;
}

const DeleteConfirmationDialog: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}> = ({ onConfirm, onCancel, isDeleting }) => {
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    return (
        <div className="delete-confirmation-dialog" onClick={handleOverlayClick}>
            <div className="delete-confirmation-content">
                <h3>Delete Event</h3>
                <p>Are you sure you want to delete this event? This action cannot be undone.</p>
                <div className="delete-confirmation-buttons">
                    <button
                        className="delete-confirmation-cancel"
                        onClick={onCancel}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className="delete-confirmation-confirm"
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <div className="spinner-container">
                                <div className="spinner"></div>
                            </div>
                        ) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const EventDetails: React.FC<EventDetailsProps> = ({ event, onClose, onEdit, onDelete }) => {
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [players, setPlayers] = useState<{
        athlete_id: number;
        first_name: string;
        last_name: string;
    }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlayers = async () => {
            if (event.forTeam) {
                setLoading(false);
                return;
            }

            try {
                const supabase = createClient();

                // Get the current user
                const { data: userData } = await supabase.auth.getUser();
                if (!userData?.user) {
                    console.error('No authenticated user found');
                    setLoading(false);
                    return;
                }

                // Get the user's team ID
                const { data: userTeamData } = await supabase
                    .from("user_team")
                    .select("team_id")
                    .eq('supabase_auth_uid', userData.user.id);

                if (!userTeamData || userTeamData.length === 0) {
                    console.error('No team found for user');
                    setLoading(false);
                    return;
                }

                const teamId = userTeamData[0].team_id;

                // Get player IDs as numbers
                const playerIds = event.players.map(id => parseInt(id));

                // Fetch only the specific athletes for this event
                const { data: athleteData, error } = await supabase
                    .from("athlete")
                    .select("athlete_id, first_name, last_name")
                    .eq('team_id', teamId)
                    .in('athlete_id', playerIds);

                if (error) {
                    console.error('Error fetching athletes:', error);
                    setLoading(false);
                    return;
                }

                setPlayers(athleteData);
            } catch (error) {
                console.error('Error in fetchPlayers:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, [event.forTeam, event.players]);

    const handleDeleteClick = () => {
        setShowDeleteConfirmation(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            setIsDeleting(true);
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
            setIsDeleting(false);
        }
    };

    const handleDeleteCancel = () => {
        if (!isDeleting) {
            setShowDeleteConfirmation(false);
        }
    };

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


    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const renderParticipants = () => {
        if (event.forTeam) {
            return 'Team Event';
        }

        if (loading) {
            return 'Loading participants...';
        }

        if (!event.players || event.players.length === 0) {
            return 'No participants';
        }

        if (players.length === 0) {
            return 'Unknown participants';
        }

        // Format player names as "FirstName L."
        const participantNames = players.map(player => {
            const firstName = player.first_name;
            const lastInitial = player.last_name.charAt(0);
            return `${firstName} ${lastInitial}.`;
        });

        return participantNames.join(', ');
    };

    return (
        <div className="event-details-overlay" onClick={(e) => {
            if (e.target === e.currentTarget && !isDeleting) {
                onClose();
            }
        }}>
            <div className="event-details-dialog">
                <button className="event-details-close-button" onClick={onClose} disabled={isDeleting}>×</button>

                <div className="event-details-content">
                    <div className="event-details-header">
                        <div className="event-details-header-top">
                            <div
                                className="event-badge event-type-badge"
                                style={{ backgroundColor: getEventTypeColor(event.type).backgroundColor, border: `2px solid ${getEventTypeColor(event.type).borderColor}` }}
                            >
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </div>
                            <button className="event-details-close-button" onClick={onClose} disabled={isDeleting}>×</button>
                        </div>
                        <h2>{event.title}</h2>
                    </div>

                    <div className="event-details-info">
                        <div className="event-details-row">
                            <CalendarTodayOutlinedIcon className="event-details-icon" />
                            <span className="event-details-text">
                                {formatDate(event.startTime)}
                            </span>
                        </div>

                        <div className="event-details-row">
                            <ScheduleIcon className="event-details-icon" />
                            <span className="event-details-text">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </span>
                        </div>

                        <div className="event-details-row">
                            <PeopleAltOutlinedIcon className="event-details-icon" />
                            <span className="event-details-text">
                                {renderParticipants()}
                            </span>
                        </div>

                        {event.notes && (
                            <div className="event-details-row">
                                <EditNoteOutlinedIcon className="event-details-icon" />
                                <span className="event-details-text">{event.notes}</span>
                            </div>
                        )}
                    </div>

                    <div className="event-details-footer">
                        <button
                            className="event-details-edit-button"
                            onClick={onEdit}
                            disabled={isDeleting}
                        >
                            Edit Event
                        </button>
                        <button
                            className="event-details-delete-button"
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                        >
                            Delete Event
                        </button>
                    </div>
                </div>
            </div>

            {showDeleteConfirmation && (
                <DeleteConfirmationDialog
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
};

export default EventDetails; 