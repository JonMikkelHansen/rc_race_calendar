import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRacesAsync, selectRace, selectStage } from '../redux/actions/GPXActions.js'; // Ensure these actions are imported
import { formatDate } from '../Utilities.js'; // Ensure this utility function is correctly imported

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
  const selectedRace = useSelector((state) => state.selectedRace);
  const [selectedSeason, setSelectedSeason] = useState(new Date().getFullYear());
  const [expandedRaces, setExpandedRaces] = useState([]);

  useEffect(() => {
    console.log('Fetching races for season:', selectedSeason);
    dispatch(fetchRacesAsync(selectedSeason.toString()));
  }, [dispatch, selectedSeason]);

  console.log('Current races from state:', races); // Add this to see what's in the state

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
    handleRaceSelect(raceId); // Select the race
    setExpandedRaces(prevExpanded => 
      prevExpanded.includes(raceId)
        ? prevExpanded.filter(id => id !== raceId)
        : [...prevExpanded, raceId]
    );
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
        Object.entries(groupedRaces).map(([month, monthRaces]) => (
          <div key={month}>
            <h3>{month}</h3>
            {monthRaces.map((race) => (
              <div key={race.id}>
                <div 
                  onClick={() => toggleExpandRace(race.id)}
                  style={{ 
                    cursor: 'pointer',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '4px',
                    border: race.id === selectedRace ? '2px solid #007bff' : '1px solid #ddd'
                  }}
                >
                  {race.race_name} ({new Date(race.race_start_date).toLocaleDateString()})
                  {race.stages?.length > 0 && ` - ${race.stages.length} stages`}
                </div>
                
                {expandedRaces.includes(race.id) && race.stages && (
                  <div style={{ marginLeft: '20px', marginBottom: '8px' }}>
                    {race.stages.map((stage) => (
                      <div 
                        key={stage.id}
                        onClick={(e) => handleStageSelect(stage.id, e)}
                        style={{ 
                          cursor: 'pointer',
                          padding: '4px',
                          margin: '2px 0',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e0e0e0'
                        }}
                      >
                        Stage {stage.stage_number}: {stage.stage_name}
                        {stage.stage_date && ` (${new Date(stage.stage_date).toLocaleDateString()})`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      ) : (
        <p>No races found for the selected season.</p>
      )}
    </div>
  );
}

export default RaceList;
