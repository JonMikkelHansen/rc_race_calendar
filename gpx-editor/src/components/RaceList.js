import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRacesAsync, selectRace } from '../redux/actions/GPXActions';
import { formatDate } from '../Utilities';

function RaceList() {
  const dispatch = useDispatch();
  const races = useSelector(state => state.races) || [];
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [expandedRaces, setExpandedRaces] = useState([]);

  useEffect(() => {
    // Dispatch fetchRacesAsync to fetch races for the selected season on component mount
    dispatch(fetchRacesAsync(selectedSeason.toString()));
  }, [dispatch, selectedSeason]);

  const handleRaceSelect = (raceId) => {
    dispatch(selectRace(raceId));
  };

  const handleSeasonChange = (e) => {
    setSelectedSeason(Number(e.target.value));
  };

  const toggleExpandRace = (raceId) => {
    if (expandedRaces.includes(raceId)) {
      setExpandedRaces(expandedRaces.filter(id => id !== raceId));
    } else {
      setExpandedRaces([...expandedRaces, raceId]);
    }
  };

  // Sort races by race_start_date
  const sortedRaces = races.sort((a, b) => new Date(a.race_start_date) - new Date(b.race_start_date));

  return (
    <div>
      <h2>Select a Race</h2>
      <label htmlFor="season-select">Season:</label>
      <select id="season-select" value={selectedSeason} onChange={handleSeasonChange}>
        {/* Hardcoded season options */}
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
      </select>

      <ul>
        {sortedRaces.length > 0 ? sortedRaces.map(race => (
          <li key={race.id}>
            <div>
              {/* Modified to use a button for accessibility and semantic correctness */}
              <button onClick={() => handleRaceSelect(race.id)} style={{ background: 'none', border: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                <span>{expandedRaces.includes(race.id) ? '▼ ' : '► '}</span>
                {formatDate(race.race_start_date)} - {race.race_name}
                {race.stages && race.stages.length > 0 && ` (${race.stages.length} Stages)`}
              </button>
            </div>
            {expandedRaces.includes(race.id) && (
              <ul>
                {race.stages && race.stages.map(stage => (
                  <li key={stage.id} onClick={(e) => {
                    e.stopPropagation(); // Prevent the race selection when clicking on a stage
                    //handleStageSelect(stage.id);
                  }}>{stage.name}</li>
                ))}
              </ul>
            )}
          </li>
        )) : <li>No races found for the selected season.</li>}
      </ul>
    </div>
  );

}

export default RaceList;
