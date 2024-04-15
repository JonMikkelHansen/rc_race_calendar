import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRacesAsync, selectRace, selectStage } from '../redux/actions/GPXActions'; // Ensure these actions are imported
import { formatDate } from '../Utilities'; // Ensure this utility function is correctly imported

// Styled components
const MonthHeading = styled.h3`
  font-family: Libre Franklin, sans-serif; // Example font, adjust as needed
  font-size: 1rem; // Example font size, adjust as needed
  font-weight: bold; // Bold font weight for headings
  color: #333; // Example color, adjust as needed
  margin-bottom: .5rem
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  font-family: Libre Franklin, sans-serif; // Example font, adjust as needed
  font-size: .8rem; // Example font size, adjust as needed
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0; // Light grey on hover, adjust color as needed
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem; // Smaller font size for a modern look
  padding: 0;
  margin-right: 8px; // Add some space between the arrow and text
  display: inline-flex; // Align better with the text
  align-items: center;
`;

const RaceName = styled.span`
  // Additional styling for the race name if needed
`;

function RaceList() {
  const dispatch = useDispatch();
  const races = useSelector((state) => state.races) || [];
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [expandedRaces, setExpandedRaces] = useState([]);

  useEffect(() => {
    dispatch(fetchRacesAsync(selectedSeason.toString()));
  }, [dispatch, selectedSeason]);

  const handleRaceSelect = (raceId) => {
    dispatch(selectRace(raceId));
  };

  const handleStageSelect = (stageId, event) => {
    event.stopPropagation(); // Prevent the race's onClick from firing
    dispatch(selectStage(stageId));
  };

  const handleSeasonChange = (e) => {
    setSelectedSeason(Number(e.target.value));
  };

  const toggleExpandRace = (raceId) => {
    if (expandedRaces.includes(raceId)) {
      setExpandedRaces(expandedRaces.filter((id) => id !== raceId));
    } else {
      setExpandedRaces([...expandedRaces, raceId]);
    }
  };

  // Utility function to group races by their start month
  const groupRacesByMonth = (races) => {
    return races.reduce((acc, race) => {
      const month = new Date(race.race_start_date).toLocaleString('default', { month: 'long' }).toUpperCase();
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(race);
      return acc;
    }, {});
  };

  // Sort races by race_start_date and group by month
  const sortedRaces = races.sort((a, b) => new Date(a.race_start_date) - new Date(b.race_start_date));
  const groupedRaces = groupRacesByMonth(sortedRaces);

  return (
    <div>
      <h2>Select a Race</h2>
      <label htmlFor="season-select">Season:</label>
      <select id="season-select" value={selectedSeason} onChange={handleSeasonChange}>
        <option value={2023}>2023</option>
        <option value={2024}>2024</option>
        <option value={2025}>2025</option> {/* Example of adding another year */}
      </select>
  
      {Object.entries(groupedRaces).length > 0 ? (
        Object.entries(groupedRaces).map(([month, races]) => (
          <div key={month}>
            <MonthHeading>{month}</MonthHeading>
            <List>
              {races.map((race) => (
                <ListItem key={race.id} onClick={() => handleRaceSelect(race.id)}>
                  <ExpandButton onClick={(e) => {
                    e.stopPropagation(); // Prevent race selection when toggling details
                    toggleExpandRace(race.id);
                  }}>
                    {expandedRaces.includes(race.id) ? '▼' : '►'}
                  </ExpandButton>
                  <RaceName>
                    {formatDate(race.race_start_date)} - {race.race_name}
                    {race.stages && race.stages.length > 0 && ` (${race.stages.length} Stages)`}
                  </RaceName>
                  {expandedRaces.includes(race.id) && (
                    <ul>
                      {race.stages && race.stages.map(stage => (
                        <li key={stage.id} onClick={(e) => {
                          e.stopPropagation(); // Prevent race selection
                          handleStageSelect(stage.id);
                        }}>{stage.name}</li>
                      ))}
                    </ul>
                  )}
                </ListItem>
              ))}
            </List>
          </div>
        ))
      ) : (
        <p>No races found for the selected season.</p>
      )}
    </div>
  );
  
}

export default RaceList;
