import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import { PlusCircle } from 'react-feather'; // Make sure to add this
import { updateWaypoint, deleteWaypoint, addWaypointAndTrackpoint, setMinYManual, setMaxYManual } from '../../redux/actions/GPXActions';
import { interpolateTrackpointData } from '../../Utilities'; // Adjust the path as necessary

import styled from 'styled-components';

// Styled components for the UI
const EditorContainer = styled.div`
  width: 90%;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const EditForm = styled.form`
  display: block;
  padding: 10px;
  border-radius: 5px;
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  background-color: transparent;
  position: relative;
  padding-top: 40px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
`;

const WaypointInfo = styled.div`
  justify-content: space-between; 
  align-items: center;
  width: 100%;
  display: ${props => props.isActive ? 'none' : 'flex'};
`;

const StyledForm = styled.form`
display: grid;
grid-template-columns: repeat(5, 1fr);
grid-gap: 10px;
align-items: top;
width: 100%;
margin: 1em 2em 1em .1em;

.full-width {
  grid-column: 1 / -1;
}

.span-2 {
  grid-column: span 2;
}

.span-3 {
  grid-column: span 3;
}

.span-4 {
  grid-column: span 4;
}

.span-down-3 {
  grid-row: span 3;
}

label {
  display: block;
  margin-bottom: 5px;
}

input, textarea, select {
  width: 92%;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

select{
  width: 100%;
}

button {
  justify-self: start;
}

max-height: ${props => props.isActive ? '500px' : '0'};
`;

const FormInput = styled.input`
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const FormTextarea = styled.textarea`
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 12em;
`;

const WaypointList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  max-height: 400px;
`;

const WaypointItem = styled.li`
  background-color: #333;
  color: #fff;
  margin: 2px 0;
  padding: 5px 10px;
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;

  &:hover {
    background-color: #444;
  }
`;

const CreateButton = styled.button`
  padding: 10px 20px;
  border: none;
  color: white;
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center; // Ensure items are aligned inline

  &:hover {
    background-color: ${props => props.primary ? '#0056b3' : '#5a6268'};
  }
  svg {
    margin-right: 5px; // Add some spacing between the icon and text
  }
`;

const CancelButton = styled(CreateButton)`
  background-color: #dc3545;
  &:hover {
    background-color: #c82333;
  }
`;

const DeleteButton = styled.button`
  background-color: #dc3545;
  border: none;
  color: white;
  padding: 3px 6px;
  margin-left: 10px;
  font-size: 0.7rem;
  border-radius: 3px;
  cursor: pointer;

  &:hover {
    background-color: #c82333;
  }
`;

const SaveButton = styled.button`
  background-color: #00ff6a;
  color: #000;
  font-family: 'Libre Franklin', sans-serif;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #00e65d;
  }
`;

// Main component function
export const WaypointEditor = () => {
  const waypoints = useSelector(state => state.waypoints.sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (a.createdAt) {
      return -1;
    } else if (b.createdAt) {
      return 1;
    }
    return a.distanceFromStart - b.distanceFromStart;
  }));

  const trackpoints = useSelector((state) => state.trackpoints);
  const minYManual = useSelector(state => state.minYManual);
  const maxYManual = useSelector(state => state.maxYManual);
  const dispatch = useDispatch();

  const [editWaypointId, setEditWaypointId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [elevation, setElevation] = useState(0);
  const [distance, setDistance] = useState(0);
  const [inputDistance, setInputDistance] = useState(0);
  const maxDistance = trackpoints[trackpoints.length - 1]?.distanceFromStart || 0;
  const [type, setType] = useState('');
  const [secondaryType, setSecondaryType] = useState('');
  const [elevationEdited, setElevationEdited] = useState(false);

  // Reset secondary type if primary type is not 'Climb'
  useEffect(() => {
    if (type !== 'climb') {
      setSecondaryType('');
    }
  }, [type]);

  const logUserCreatedTrackpoints = () => {
    const userCreatedTrackpoints = trackpoints.filter(tp => tp.userCreated);
    console.log("User Created Trackpoints:", userCreatedTrackpoints);
  };

  const findNearestTrackpointElevation = (distance) => {
    const maxDistance = trackpoints[trackpoints.length - 1]?.distanceFromStart || 0;
    if (distance === maxDistance) {
      return trackpoints[trackpoints.length - 1].elevation;
    }
    const sortedTrackpoints = trackpoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
    let before = sortedTrackpoints[0];
    let after = sortedTrackpoints[sortedTrackpoints.length - 1];
    for (const trackpoint of sortedTrackpoints) {
      if (trackpoint.distanceFromStart <= distance) {
        before = trackpoint;
      }
      if (trackpoint.distanceFromStart > distance) {
        after = trackpoint;
        break;
      }
    }
    const distanceRatio = (distance - before.distanceFromStart) / (after.distanceFromStart - before.distanceFromStart);
    const elevationDiff = after.elevation - before.elevation;
    const interpolatedElevation = before.elevation + distanceRatio * elevationDiff;
    return Number(interpolatedElevation.toFixed(1));
  };

  useEffect(() => {
    if (editWaypointId !== null && !isNaN(distance)) {
      const interpolatedElevation = findNearestTrackpointElevation(parseFloat(distance));
      setElevation(interpolatedElevation);
    }
  }, [distance, editWaypointId, trackpoints]);

  useEffect(() => {
    logUserCreatedTrackpoints();
  }, [trackpoints]);

  const handleEditClick = (waypoint) => {
    if (editWaypointId !== waypoint.id) {
      setEditWaypointId(waypoint.id);
      setName(waypoint.name);
      setDescription(waypoint.description || '');
      setElevation(waypoint.elevation || 0);
      setDistance(waypoint.distanceFromStart);
      setType(waypoint.type || "null");
      setSecondaryType(waypoint.secondaryType || 'null');
    }
  };

  const handleDeleteClick = (waypointId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this waypoint?");
    if (isConfirmed) {
      dispatch(deleteWaypoint(waypointId));
      if (waypointId === editWaypointId) {
        resetForm();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalElevation = elevationEdited ? elevation : findNearestTrackpointElevation(distance);
    const waypointData = {
      id: editWaypointId,
      name,
      description,
      elevation: finalElevation,
      distanceFromStart: distance,
      type,
      secondaryType,
      elevationEdited,
    };
    if (editWaypointId) {
      dispatch(updateWaypoint(waypointData));
    } else {
      dispatch(addWaypointAndTrackpoint(waypointData));
    }
    resetForm();
  };

  const resetForm = () => {
    setEditWaypointId(null);
    setName('');
    setDescription('');
    setElevation(0);
    setDistance(0);
    setType('null');
    setSecondaryType('null');
    setElevationEdited(false);
  };

  const handleAddClick = () => {
    const interpolatedData = trackpoints.length > 0 ? interpolateTrackpointData(0, trackpoints) : { lat: 0, lon: 0, elevation: 0 };
    const newWaypoint = {
      name: '',
      description: '',
      lat: interpolatedData.lat,
      lon: interpolatedData.lon,
      elevation: interpolatedData.elevation,
      distanceFromStart: 0,
      createdAt: new Date().toISOString(),
      userCreated: true,
    };
    dispatch(addWaypointAndTrackpoint(newWaypoint));
    resetForm();
  };

  const handleElevationChange = (e) => {
    const newElevation = parseFloat(e.target.value);
    if (!isNaN(newElevation)) {
      setElevation(newElevation);
      setElevationEdited(true);
    }
  };

  const handleDistanceChange = (e) => {
    const newValue = e.target.value;
    if (newValue === '') {
      setInputDistance('');
    } else {
      const newDistance = parseFloat(newValue);
      if (!isNaN(newDistance)) {
        if (newDistance >= 0 && newDistance <= maxDistance) {
          setInputDistance(newDistance);
          setDistance(newDistance);
          if (!elevationEdited) {
            const interpolatedData = interpolateTrackpointData(newDistance, trackpoints);
            setElevation(interpolatedData.elevation);
          }
        } else {
          alert("Distance cannot be greater than the last trackpoint.");
          setInputDistance(maxDistance);
          setDistance(maxDistance);
          const interpolatedData = interpolateTrackpointData(maxDistance, trackpoints);
          if (interpolatedData) {
            setElevation(interpolatedData.elevation);
          }
        }
      }
    }
  };

  return (
    <EditorContainer>
      <h3>Keypoints</h3>
      <CreateButton onClick={handleAddClick}><PlusCircle size={16} />Create waypoint</CreateButton>
      <WaypointList>
        {waypoints.map((waypoint) => (
          <WaypointItem key={waypoint.id} onClick={() => handleEditClick(waypoint)}>
            {editWaypointId === waypoint.id ? (
              <StyledForm isActive={true} onSubmit={handleSubmit}>
                <div className='span-3'>
                  <label htmlFor="name">Name</label>
                  <FormInput id="name" type="text" defaultValue={waypoint.name} onChange={(e) => setName(e.target.value)} placeholder="Keypoint Name" />
                </div>
                <div className='span-2'>
                  <label htmlFor="name">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value)}>
                    <option value="null">Select a type</option>
                    <option value="start">Start</option>
                    <option value="climb">Climb</option>
                    <option value="sprint">Sprint</option>
                    <option value="scenario">Scenario</option>
                    <option value="other">Other</option>
                    <option value="end">End</option>
                  </select>
                </div>
                <div className='span-3 span-down-3'>
                  <FormTextarea id='description' type="textarea" defaultValue={waypoint.description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                </div>
                <div className={`span-2 ${type !== 'climb' ? 'greyed-out' : ''}`}>
                  <label htmlFor="secondaryType">Marker Type</label>
                  <select
                    id="markerType"
                    value={secondaryType}
                    onChange={(e) => setSecondaryType(e.target.value)}
                    disabled={type !== 'climb'}
                  >
                    <option value="">Select Marker Type</option>
                    <option value="cat1">Category 1</option>
                    <option value="cat2">Category 2</option>
                    <option value="cat3">Category 3</option>
                    <option value="cat4">Category 4</option>
                    <option value="catHC">Hors Catégorie (HC)</option>
                    <option value="catCC">Cima Coppi (CC)</option>
                  </select>
                </div>
                <div className='span-2'>
                  <label htmlFor="elevation">Elevation (m)</label>
                  <FormInput id="elevation" type="number" value={elevation.toString()} onChange={handleElevationChange} placeholder="Elevation (m)" />
                </div>
                <div className='span-2'>
                  <label htmlFor="distance">Distance from start (km)</label>
                  <FormInput id="distance" type="number" value={distance.toString()} onChange={handleDistanceChange} placeholder="Distance from Start (km)" />
                </div>
                <CancelButton type="button" onClick={(e) => {
                  e.stopPropagation();
                  setEditWaypointId(null);
                }}>Cancel</CancelButton>
                <SaveButton primary type="submit">Save Changes</SaveButton>
              </StyledForm>
            ) : (
              <div>
                <span>{`${waypoint.distanceFromStart.toFixed(2)} km, ${waypoint.name}, ${waypoint.elevation} m`}</span>
              </div>
            )}
            <DeleteButton onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(waypoint.id);
            }}>Delete</DeleteButton>
          </WaypointItem>
        ))}
      </WaypointList>
    </EditorContainer>
  );
};

export default WaypointEditor;