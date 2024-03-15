// IMPORTS
import React, { useState } from 'react';
import GPXProfile from './GPXProfile'; // Adjust the path as necessary
import GPXMap from './GPXMap'; // Adjust the path as necessary
import { useSelector, useDispatch } from 'react-redux';
import { setStageTitle } from '../../redux/actions/GPXActions';
import styled from 'styled-components';
import WaypointEditor from './WaypointEditor';
import SegmentEditor from './SegmentEditor';

const Container = styled.div`
  display: flex; /* Aligns sliders side by side */
  justify-content: center; /* Centers the sliders */
  width: 100%; /* Full width of the container */
`;

const SliderContainer = styled.div`
  width: 50%; /* Each slider takes up half of the container width */
  margin: auto; /* Center align the slider */
`;

const ComponentView = styled.div`
  width: 100%; /* Full width of the slider container */
  padding-top: 5%;
  position: relative; /* Child absolute positioning context */
`;

const GPXViz = () => {
  const dispatch = useDispatch();
  const stageTitle = useSelector(state => state.stageTitle || 'Unknown');
  const [gpxData, setGpxData] = useState(null); // State to hold GPX data
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(stageTitle);

  const [activeProfileMapComponent, setActiveProfileMapComponent] = useState('profile');
  const [activeWaypointSegmentComponent, setActiveWaypointSegmentComponent] = useState('waypoints');

  // Function to handle changes to GPX data
  const handleGPXData = (updatedData) => {
    setGpxData(updatedData);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    dispatch(setStageTitle(editedTitle));
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
      {isEditing && <button onClick={handleSaveClick}>Save</button>}
      <Container>
        <SliderContainer>
          <button onClick={() => setActiveProfileMapComponent('profile')}>Stage Profile</button>
          <button onClick={() => setActiveProfileMapComponent('map')}>Stage Map</button>
          <ComponentView>
            <div style={{ display: activeProfileMapComponent === 'profile' ? 'block' : 'none' }}>
              <GPXProfile />
            </div>
            <div style={{ display: activeProfileMapComponent === 'map' ? 'block' : 'none' }}>
              <GPXMap />
            </div>
          </ComponentView>
        </SliderContainer>
        <SliderContainer>
          <button onClick={() => setActiveWaypointSegmentComponent('waypoints')}>Waypoints</button>
          <button onClick={() => setActiveWaypointSegmentComponent('segments')}>Segments</button>
          <ComponentView>
            <div style={{ display: activeWaypointSegmentComponent === 'waypoints' ? 'block' : 'none' }}>
              <WaypointEditor gpxData={gpxData} onEdit={handleGPXData} />
            </div>
            <div style={{ display: activeWaypointSegmentComponent === 'segments' ? 'block' : 'none' }}>
              <SegmentEditor gpxData={gpxData} onEdit={handleGPXData} />
            </div>    
          </ComponentView>     
        </SliderContainer>
      </Container>
    </div>
  );
};

export default GPXViz;
