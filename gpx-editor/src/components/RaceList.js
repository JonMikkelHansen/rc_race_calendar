import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import { fetchRacesAsync, selectRace, selectStage } from '../redux/actions/GPXActions.js';
import { formatDate } from '../Utilities.js';

// Styled components
const MonthHeading = styled.h3`
  font-family: Libre Franklin, sans-serif;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  margin-bottom: .5rem
`;

const List = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  font-family: Libre Franklin, sans-serif;
  font-size: .8rem;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
`;

const RaceName = styled.span`
  // Additional styling for the race name if needed
`;

function RaceList() {
  const dispatch = useDispatch();
  const races = useSelector((state) => state.races) || [];
  const selectedRace = useSelector((state) => state.selectedRace);
  const [selectedSeason, setSelectedSeason] = useState(2024);
  const [expandedRaces, setExpandedRaces] = useState([]);

  useEffect(() => {
    console.log('Fetching races for season:', selectedSeason);
    dispatch(fetchRacesAsync(selectedSeason.toString()));
  }, [dispatch, selectedSeason]);

  console.log('Current races from state:', races);

  const handleRaceSelect = (raceId) => {
    dispatch(selectRace(raceId));
  };

  const handleStageSelect = (stageId, event) => {
    event.stopPropagation();
    dispatch(selectStage(stageId));
  };

  const handleSeasonChange = (e) => {
    setSelectedSeason(Number(e.target.value));
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
        <option value={2025}>2025</option>
      </select>
  
      {Object.entries(groupedRaces).length > 0 ? (
        Object.entries(groupedRaces).map(([month, monthRaces]) => (
          <div key={month}>
            <h3>{month}</h3>
            {monthRaces.map((race) => (
              <div key={race.id}>
                <div 
                  onClick={() => handleRaceSelect(race.id)}
                  style={{ 
                    cursor: 'pointer',
                    padding: '8px',
                    backgroundColor: '#f5f5f5',
                    marginBottom: '4px',
                    border: race.id === selectedRace ? '2px solid #007bff' : '1px solid #ddd'
                  }}
                >
                  {race.race_name} ({formatDate(race.race_start_date)})
                </div>
                
                {race.stages && race.stages.length > 0 && (
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
                        {stage.stage_date && ` (${formatDate(stage.stage_date)})`}
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
