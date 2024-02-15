import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRacesAsync, selectRace, fetchAllSeasons } from '../redux/actions/GPXActions';

function RaceList() {
  const dispatch = useDispatch();
  const races = useSelector(state => state.races) || []; // Ensure races is always an array
  const seasons = useSelector(state => state.seasons) || []; // Assuming seasons are stored in Redux
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear()); // Default to current year

  useEffect(() => {
    // Fetch all seasons on component mount
    dispatch(fetchAllSeasons());
  }, [dispatch]);

  useEffect(() => {
    // Dispatch fetchRacesAsync with the selectedSeason
    dispatch(fetchRacesAsync(selectedSeason));
  }, [dispatch, selectedSeason]);

  const handleSeasonChange = (e) => {
    setSelectedSeason(Number(e.target.value));
  };

  const handleRaceSelect = (raceId) => {
    dispatch(selectRace(raceId));
  };

  return (
    <div>
      <h2>Select a Race</h2>
      <label htmlFor="season-select">Season:</label>
      <select id="season-select" value={selectedSeason} onChange={handleSeasonChange}>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
      </select>
      
      
      <ul>
        {races.length > 0 ? races.map(race => (
          <li key={race.id} onClick={() => handleRaceSelect(race.id)}>
            {race.race_name} ({race.season})
          </li>
        )) : <li>No races found for the selected season.</li>}
      </ul>
    </div>
  );
}

export default RaceList;
