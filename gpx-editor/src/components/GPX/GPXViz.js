// IMPORTS
import React, { useState, useEffect } from 'react';
import GPXProfile from './GPXProfile'; // Ensure the path is correct based
import GPXMap from './GPXMap'; // Ensure the path is correct based
import { useSelector, useDispatch } from 'react-redux';
import { setStageTitle } from '../../redux/actions/GPXActions';
import styled from 'styled-components';


const SliderContainer = styled.div`
    width: 50%; /* Takes up half of the screen width */
    margin: auto; /* Center align the slider */
`;

const ComponentView = styled.div`
    width: 100%; /* Full width of the slider container */
    padding-top: 5%; 
    position: relative; /* Child absolute positioning context */
`;

const ActiveComponent = styled.div`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
`;


// CONSTANTS
const GPXViz = () => {
    const dispatch = useDispatch();
    const stageTitle = useSelector(state => state.stageTitle || 'Unknown');
    // Component state
    const [simplifiedData, setSimplifiedData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(stageTitle);
    const [activeComponent, setActiveComponent] = useState('profile');

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
            <SliderContainer>
                <button onClick={() => setActiveComponent('profile')}>Stage Profile</button>
                <button onClick={() => setActiveComponent('map')}>Stage Map</button>
                <ComponentView>
                    <div style={{ display: activeComponent === 'profile' ? 'block' : 'none' }}>
                        <GPXProfile />
                    </div>
                    <div style={{ display: activeComponent === 'map' ? 'block' : 'none' }}>
                        <GPXMap />
                    </div>
                </ComponentView>
            </SliderContainer>
            {/* Inputs and labels for showing/hiding trackpoints, waypoints, annotations, and adjusting settings */}
          
            <div>
        </div>
        </div>
    );
};

export default GPXViz;
