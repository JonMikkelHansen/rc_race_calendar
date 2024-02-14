// IMPORTS
import React, { useState, useEffect } from 'react';
import GPXProfile from './GPXProfile'; // Ensure the path is correct based
import { fetchRaces } from './api'; // Ensure the path is correct based on your project structure
import { useSelector, useDispatch } from 'react-redux';
import { setStageTitle } from '../redux/actions/GPXActions';

// CONSTANTS
const GPXViz = () => {
    const dispatch = useDispatch();
    const stageTitle = useSelector(state => state.stageTitle || 'Unknown');
    // Component state
    const [simplifiedData, setSimplifiedData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(stageTitle);
    const [races, setRaces] = useState([]); // Add state to store races data

    useEffect(() => {
        // Fetch races data from Strapi and store it in component state
        const loadRaces = async () => {
            try {
                const data = await fetchRaces();
                setRaces(data); // Assuming this data is an array of races
            } catch (error) {
                console.error("Error fetching races data:", error);
            }
        };

        loadRaces();
    }, []); // This effect runs only once on component mount

    const handleInputChange = (action) => (e) => {
        dispatch(action(parseFloat(e.target.value)));
    };

    const handleEditClick = () => {
        setIsEditing(true); // Enter editing mode
    };

    const handleSaveClick = () => {
        setIsEditing(false); // Exit editing mode
        dispatch(setStageTitle(editedTitle)); // Dispatch the edited title to Redux
    };


    return (
        <div>
            <h2>Height Profile:&nbsp;
                {isEditing ? (
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                    />
                ) : (
                    <>
                        {stageTitle}
                        <button onClick={handleEditClick}>Edit</button>
                    </>
                )}
            </h2>
            {isEditing && (
                <button onClick={handleSaveClick}>Save</button>
            )}
            <GPXProfile />
            {/* Inputs and labels for showing/hiding trackpoints, waypoints, annotations, and adjusting settings */}
          
            <div>
            <h3>Races</h3>
              <ul>
                {races.map((race) => (
                  <li key={race.id}>
                    {race.race_name} - {race.race_start_date} to {race.race_end_date}
                  </li>
                ))}
              </ul>
        </div>
        </div>
    );
};

export default GPXViz;
