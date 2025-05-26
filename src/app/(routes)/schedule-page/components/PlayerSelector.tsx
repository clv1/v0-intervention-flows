import React from 'react';
import { Player } from '../../../lib/types';
import PlayerCard from './PlayerCard';

interface PlayerSelectorProps {
    players: Player[];
    selectedPlayers: string[];
    onPlayerToggle: (playerId: string) => void;
    loading?: boolean;
    searchTerm?: string;
    onSearchChange?: (value: string) => void;
    showSearch?: boolean;
    title?: string;
}

const PlayerSelector: React.FC<PlayerSelectorProps> = ({
    players,
    selectedPlayers,
    onPlayerToggle,
    loading = false,
    searchTerm = '',
    onSearchChange,
    showSearch = false,
    title = 'Select Players'
}) => {
    return (
        <div className="player-selector">
            {showSearch && (
                <div className="player-selector-header">
                    <h2>{title}</h2>
                    <div className="player-selector-search">
                        <input
                            type="text"
                            placeholder="Search players..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>
            )}

            <div className="players-list-container">
                {loading ? (
                    <div className="no-players">Loading players...</div>
                ) : players.length > 0 ? (
                    players.map(player => (
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

export default PlayerSelector; 