'use client'

import { IAthlete } from '@/lib/types';
import { useSelectedPlayer } from '@/store/useSelectedPlayer';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import './playerSelector.css';

interface PlayerSelectorProps {
  athletes: IAthlete[];
  routeBefore: string;
  routeAfter?: string;
  visiblePlayers: number;
}

export default function PlayerSelector({ athletes, routeBefore, routeAfter = '', visiblePlayers }: PlayerSelectorProps) {
  const router = useRouter();
  const { id } = useParams();
  const { selectedPlayer, setSelectedPlayer } = useSelectedPlayer();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const playerId = Number(id);
    const athleteExists = athletes.some(athlete => athlete.athlete_id === playerId);

    if (isNaN(playerId) || !athleteExists) {
      // Default to the first athlete in the list
      const defaultAthlete = athletes[0];
      if (defaultAthlete) {
        setSelectedPlayer(defaultAthlete.athlete_id);
        router.push(`/${routeBefore}/${defaultAthlete.athlete_id}/${routeAfter}`);
      }
    } else if (selectedPlayer === null || selectedPlayer !== playerId) {
      setSelectedPlayer(playerId);
    }
  }, [id, selectedPlayer, setSelectedPlayer, athletes, routeBefore, routeAfter, router]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
        setShowDropdown(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when search expands
  useEffect(() => {
    if (isSearchExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchExpanded]);

  const filteredAthletes = athletes.filter(athlete => {
    const fullName = `${athlete.first_name} ${athlete.last_name.charAt(0)}.`.toLowerCase();
    const search = searchTerm.toLowerCase();

    // Match from the start of first name or last name
    return fullName.startsWith(search) ||
      fullName.indexOf(' ' + search) === athlete.first_name.length;
  });

  const handlePlayerSelect = (athleteId: number) => {
    setSelectedPlayer(athleteId);
    setShowDropdown(false);
    router.push(`/${routeBefore}/${athleteId}/${routeAfter}`);
  };

  const currentIndex = athletes.findIndex(a => a.athlete_id === selectedPlayer);

  const handlePrevious = () => {
    const newIndex = (currentIndex - 1 + athletes.length) % athletes.length;
    handlePlayerSelect(athletes[newIndex].athlete_id);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % athletes.length;
    handlePlayerSelect(athletes[newIndex].athlete_id);
  };

  const getVisiblePlayers = () => {
    if (currentIndex === -1) return athletes.slice(0, visiblePlayers);

    let start = Math.max(0, currentIndex - Math.floor(visiblePlayers / 2));
    let end = start + visiblePlayers;

    // Adjust start if end exceeds array length
    if (end > athletes.length) {
      start = Math.max(0, athletes.length - visiblePlayers);
      end = athletes.length;
    }

    return athletes.slice(start, end);
  };

  return (
    <div id='search-bar' className='d-flex align-items-center gap-3'>
      <div ref={searchRef} className={`search-container ${isSearchExpanded ? 'expanded' : ''}`}>
        <div className="search-icon" onClick={() => {
          setIsSearchExpanded(true);
          setShowDropdown(true);
        }}>
          <i className="bi bi-search"></i>
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search athlete..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="search-input"
        />
        {showDropdown && (  // Removed searchTerm condition to show all players
          <div className="search-dropdown">
            {filteredAthletes.map(athlete => (
              <div
                key={athlete.athlete_id}
                className="dropdown-item cursor-pointer"
                onClick={() => {
                  handlePlayerSelect(athlete.athlete_id);
                  setIsSearchExpanded(false);
                  setSearchTerm('');
                }}
              >
                {athlete.first_name} {athlete.last_name.charAt(0)}.
              </div>
            ))}
          </div>
        )}
      </div>
      <div id='player-selector' className='d-flex align-items-center gap-3'>
        <button
          onClick={handlePrevious}
          className='btn btn-link text-white'
        >
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className='d-flex gap-3'>
          {getVisiblePlayers().map(athlete => (
            <div
              key={athlete.athlete_id}
              onClick={() => handlePlayerSelect(athlete.athlete_id)}
              className={`player-name cursor-pointer ${selectedPlayer === athlete.athlete_id ? 'selected' : undefined
                }`}
            >
              {athlete.first_name} {athlete.last_name.charAt(0)}.
            </div>
          ))}
        </div>
        <button
          onClick={handleNext}
          className='btn btn-link text-white'
        >
          <i className="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  );
} 