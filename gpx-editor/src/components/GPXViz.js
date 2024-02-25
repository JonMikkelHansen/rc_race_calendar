// IMPORTS
import React, { useState, useEffect } from 'react';
import GPXProfile from './GPXProfile'; // Ensure the path is correct based
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
            <h2>Stage:&nbsp;
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
        </div>
        </div>
    );
};

export default GPXViz;
