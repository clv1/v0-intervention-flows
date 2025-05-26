import React from 'react';
import { Player } from '../../../lib/types';

interface PlayerCardProps {
    player: Player;
    isSelected: boolean;
    onToggle: (playerId: string) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelected, onToggle }) => {
    return (
        <div
            className={`player-item ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggle(player.id.toString())}
        >
            <div className="player-checkbox">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => { }}
                    readOnly
                />
                <span className="checkmark"></span>
            </div>
            <div className="player-info">
                <div className="player-name">{player.name}</div>
                {/* {player.position && <div className="player-position">{player.position}</div>} */}
            </div>
        </div>
    );
};

export default PlayerCard; 