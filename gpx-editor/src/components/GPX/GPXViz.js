import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStageTitle } from '../../redux/actions/GPXActions';
import styled from 'styled-components';
import { Edit, Save, BarChart2, TrendingUp, Globe, Map } from 'react-feather'; // Feather icons
import GPXProfile from './GPXProfile';
import GPXProfile_D3 from './GPXProfile_D3';
import GPXProfile_3D from './GPXProfile_3D';
import GPXMap from './GPXMap';
import GPXChartControls from './GPXChartControls';
import WaypointEditor from './WaypointEditor';
import SegmentEditor from './SegmentEditor';

const Container = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
`;

// Styled components for the "Stage" title and its actions
const StageTitleContainer = styled.div`
  background-color: #2c2f33;
  color: #ffffff;
  padding: 10px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  margin-bottom: 10px;
  button {
    padding: 10px 15px;
    cursor: pointer;
    background-color: #2c2f33;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease;
    svg {
      margin-left: 8px;
      height: 16px; // Adjusted size for the icons
    }
    &.active {
      background-color: #7289da;
    }
  }
`;

const StageName = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

const FileName = styled.span`
  flex-grow: 2;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: white;
  display: flex;
  align-items: center;
`;

const SaveButton = styled(EditButton)``;

const Input = styled.input`
  background: #40444b;
  border: none;
  color: white;
  padding: 5px;
  border-radius: 4px;
`;

const LeftPane = styled.div`
  width: 48%;
  margin-right: 2%;
  box-sizing: border-box;
`;

const RightPane = styled.div`
  width: 48%;
  margin-left: 2%;
  box-sizing: border-box;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 10px;
  button {
    padding: 10px 15px;
    cursor: pointer;
    background-color: #2c2f33;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    display: flex;
    align-items: center;
    transition: background-color 0.3s ease;
    svg {
      margin-left: 8px;
      height: 16px; // Adjusted size for the icons
    }
    &.active {
      background-color: #7289da;
    }
  }
`;

const ComponentView = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
`;

const ComponentContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const GPXViz = () => {
  const dispatch = useDispatch();
  const stageTitle = useSelector(state => state.stageTitle || 'Unknown');
  const [gpxData, setGpxData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(stageTitle);
  const [activeProfileMapComponent, setActiveProfileMapComponent] = useState('profile');
  const [activeWaypointSegmentComponent, setActiveWaypointSegmentComponent] = useState('waypoints');

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    dispatch(setStageTitle(editedTitle));
  };

  const handleGPXData = (updatedData) => {
    setGpxData(updatedData);
  };

  useEffect(() => {
    // Trigger resize to refresh D3 graph when D3 profile is active
    if (activeProfileMapComponent === 'd3profile') {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 250); // A slight delay to ensure the container is loaded
    }
  }, [activeProfileMapComponent]);

  return (
    <div>
      <Container>
        <LeftPane>
        <StageTitleContainer>
      {isEditing ? (
        <>
          <StageName>Stage:</StageName>
          <input type="text" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
          <button onClick={handleSaveClick}><Save /></button>
        </>
      ) : (
        <>
          <StageName>Stage:</StageName>
          <span>{stageTitle}</span>
          <button onClick={handleEditClick}><Edit /></button>
        </>
      )}
    </StageTitleContainer>
          <ButtonRow>
            <button 
              onClick={() => setActiveProfileMapComponent('profile')}
              className={activeProfileMapComponent === 'profile' ? 'active' : ''}
            >
              Stage Profile (Chart.js) <TrendingUp />
            </button>
            <button 
              onClick={() => setActiveProfileMapComponent('d3profile')}
              className={activeProfileMapComponent === 'd3profile' ? 'active' : ''}
            >
              Stage Profile (D3) <BarChart2 />
            </button>
            <button 
              onClick={() => setActiveProfileMapComponent('3dprofile')}
              className={activeProfileMapComponent === '3dprofile' ? 'active' : ''}
            >
              Stage Profile (3D) <Globe />
            </button>
            <button 
              onClick={() => setActiveProfileMapComponent('map')}
              className={activeProfileMapComponent === 'map' ? 'active' : ''}
            >
              Stage Map <Map />
            </button>
          </ButtonRow>
          <ComponentView>
            <ComponentContent style={{ display: activeProfileMapComponent === 'profile' ? 'block' : 'none' }}>
              <GPXProfile />
            </ComponentContent>
            <ComponentContent style={{ display: activeProfileMapComponent === 'd3profile' ? 'block' : 'none' }}>
              <GPXProfile_D3 />
            </ComponentContent>
            <ComponentContent style={{ display: activeProfileMapComponent === '3dprofile' ? 'block' : 'none' }}>
              <GPXProfile_3D />
            </ComponentContent>
            <ComponentContent style={{ display: activeProfileMapComponent === 'map' ? 'block' : 'none' }}>
              <GPXMap />
            </ComponentContent>
          </ComponentView>
          <GPXChartControls />
        </LeftPane>
        <RightPane>
          <ButtonRow>
            <button 
              onClick={() => setActiveWaypointSegmentComponent('waypoints')}
              className={activeWaypointSegmentComponent === 'waypoints' ? 'active' : ''}
            >
              Waypoints
            </button>
            <button 
              onClick={() => setActiveWaypointSegmentComponent('segments')}
              className={activeWaypointSegmentComponent === 'segments' ? 'active' : ''}
            >
              Segments
            </button>
          </ButtonRow>
          <ComponentView>
            <ComponentContent style={{ display: activeWaypointSegmentComponent === 'waypoints' ? 'block' : 'none' }}>
              <WaypointEditor gpxData={gpxData} onEdit={handleGPXData} />
            </ComponentContent>
            <ComponentContent style={{ display: activeWaypointSegmentComponent === 'segments' ? 'block' : 'none' }}>
              <SegmentEditor gpxData={gpxData} onEdit={handleGPXData} />
            </ComponentContent>
          </ComponentView>
        </RightPane>
      </Container>
    </div>
  );
};

export default GPXViz;