import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRacesAsync, selectRace, fetchAllSeasons } from '../redux/actions/GPXActions';

function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
  const day = date.getDate();
  let daySuffix;

  switch (day) {
    case 1: case 21: case 31:
      daySuffix = 'st';
      break;
    case 2: case 22:
      daySuffix = 'nd';
      break;
    case 3: case 23:
      daySuffix = 'rd';
      break;
    default:
      daySuffix = 'th';
  }

  return formattedDate.replace(new RegExp(` ${day}`), ` ${day}${daySuffix}`);
}

function RaceList() {
  const dispatch = useDispatch();
  const races = useSelector(state => state.races) || [];
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(fetchAllSeasons());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchRacesAsync(selectedSeason));
  }, [dispatch, selectedSeason]);

  const handleRaceSelect = (raceId) => {
    dispatch(selectRace(raceId));
  };

  const handleSeasonChange = (e) => {
    setSelectedSeason(Number(e.target.value));
  };

  // Sort races by race_start_date
  const sortedRaces = races.sort((a, b) => new Date(a.race_start_date) - new Date(b.race_start_date));

  return (
    <div>
      <h2>Select a Race</h2>
      <label htmlFor="season-select">Season:</label>
      <select id="season-select" value={selectedSeason} onChange={handleSeasonChange}>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
      </select>
      
      <ul>
        {sortedRaces.length > 0 ? sortedRaces.map(race => (
          <li key={race.id}>
            <div onClick={() => handleRaceSelect(race.id)}>
              {formatDate(race.race_start_date)} - {race.race_name}
              {race.stages && race.stages.length > 0 && ` (${race.stages.length} Stages)`}
            </div>
            {race.stages && (
              <ul>
                {race.stages.map(stage => (
                  <li key={stage.id}>{stage.name}</li>
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