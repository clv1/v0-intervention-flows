import React, { useState, useEffect } from 'react';
import { Player } from '../../../lib/types';
import { createClient } from '@/lib/client';
import PlayerCard from './PlayerCard';

// Define a simplified athlete interface for our component
interface AthleteData {
    athlete_id: number;
    first_name: string;
    last_name: string;
}

interface TeamMembersProps {
    selectedPlayers: string[];
    onPlayerToggle: (playerId: string) => void;
}

const TeamMembers: React.FC<TeamMembersProps> = ({ selectedPlayers, onPlayerToggle }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPosition, setSelectedPosition] = useState<string>('all');
    const [athletes, setAthletes] = useState<AthleteData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAthletes = async () => {
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

                setAthletes(athleteData || []);
            } catch (error) {
                console.error('Error in fetchAthletes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAthletes();
    }, []);

    // Convert athletes to Player format
    const players: Player[] = athletes.map(athlete => ({
        id: athlete.athlete_id,
        name: `${athlete.first_name} ${athlete.last_name}`,
        position: 'Player' // Default position since it's not in the athlete data
    }));

    const positions = ['all', ...Array.from(new Set(players.map(player => player.position)))];

    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPosition = selectedPosition === 'all' || player.position === selectedPosition;
        return matchesSearch && matchesPosition;
    });

    return (
        <div className="team-members">
            <div className="team-members-header">
                <h2>Team Members</h2>
                {/* Position filter buttons removed as they're not currently used */}
            </div>

            <div className="players-list-container">
                {loading ? (
                    <div className="no-players">Loading players...</div>
                ) : filteredPlayers.length > 0 ? (
                    filteredPlayers.map(player => (
                        <PlayerCard
                            key={player.id}
                            player={player}
                            isSelected={selectedPlayers.includes(player.id.toString())}
                            onToggle={onPlayerToggle}
                        />
                    ))
                ) : (
                    <div className="no-players">No players found</div>
                )}
            </div>
        </div>
    );
};

export default TeamMembers; 