import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWaypoint, deleteWaypoint, addWaypoint } from '../redux/actions/GPXActions';
import styled from 'styled-components';


const EditorContainer = styled.div`
  width: 33.3%;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-top: 5px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  margin-top: 5px;
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  max-height: ${props => props.isActive ? '500px' : '0'}; // Use props to toggle height
`;

const FormInput = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const FormTextarea = styled.textarea`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const WaypointList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto; // Allows scrolling if the list gets too long
  max-height: 400px; // Adjust based on available space; makes the list scrollable
`;

const WaypointItem = styled.li`
  background-color: #333; // Darker background for contrast
  color: #fff;
  margin: 2px 0; // Reduced margin
  padding: 5px 10px; // Reduced padding
  font-family: 'Libre Franklin', sans-serif;
  font-size: 0.8rem; // Smaller font size
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:hover {
    background-color: #444; // Slightly lighter on hover to indicate interactivity
  }
`;

// Adjusted buttons for compact styling
const Button = styled.button`
  padding: 10px 20px;
  border: none;
  color: white;
  background-color: ${props => props.primary ? '#007bff' : '#6c757d'};
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: ${props => props.primary ? '#0056b3' : '#5a6268'};
  }
`;

const CancelButton = styled(Button)`
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

const VibrantButton = styled.button`
  background-color: #00ff6a; // Example vibrant color
  color: #000; // Dark text for contrast
  font-family: 'Libre Franklin', sans-serif;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #00e65d; // A slightly darker shade for hover state
  }
`;

export const WaypointEditor = () => {
    const waypoints = useSelector(state => state.waypoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart));
    // Correctly fetch trackpoints from the Redux store
    const trackpoints = useSelector((state: { trackpoints: any }) => state.trackpoints); // Assuming trackpoints are stored in the Redux state under 'trackpoints'
    const dispatch = useDispatch();
    const [editWaypointId, setEditWaypointId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [elevation, setElevation] = useState(0);
    const [distance, setDistance] = useState(0); // Distance should remain in the unit it is used in the UI
    // Calculate maxDistance here to make it accessible throughout the component
    const maxDistance = trackpoints[trackpoints.length - 1]?.distanceFromStart || 0;

    const findNearestTrackpointElevation = (distance) => {
        // First, determine the maximum allowed distance from the last trackpoint
        const maxDistance = trackpoints[trackpoints.length - 1]?.distanceFromStart || 0;
        
        // If the given distance is equal to maxDistance, return the elevation of the last trackpoint directly
        if (distance === maxDistance) {
            return trackpoints[trackpoints.length - 1].elevation;
        }
    
        // Ensure trackpoints are sorted by distanceFromStart for interpolation
        const sortedTrackpoints = trackpoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
    
        let before = sortedTrackpoints[0];
        let after = sortedTrackpoints[sortedTrackpoints.length - 1];
    
        for (const trackpoint of sortedTrackpoints) {
            if (trackpoint.distanceFromStart <= distance) {
                before = trackpoint;
            }
            if (trackpoint.distanceFromStart > distance) {
                after = trackpoint;
                break; // Found the immediate next trackpoint, exit the loop
            }
        }
    
        // Interpolate elevation if not exactly at maxDistance
        const distanceRatio = (distance - before.distanceFromStart) / (after.distanceFromStart - before.distanceFromStart);
        const elevationDiff = after.elevation - before.elevation;
        const interpolatedElevation = before.elevation + distanceRatio * elevationDiff;
    
        // Ensure the elevation is in meters with max one decimal place
        return Number(interpolatedElevation.toFixed(1));
    };
  

    useEffect(() => {
        // Only update elevation if in edit or create mode and distance is a number
        if (editWaypointId !== null && !isNaN(distance)) {
            const interpolatedElevation = findNearestTrackpointElevation(parseFloat(distance));
            setElevation(interpolatedElevation);
        }
    }, [distance, editWaypointId, trackpoints]); // Ensure trackpoints is included in the dependency array if it could change
  

    const handleEditClick = (waypoint) => {
        setEditWaypointId(waypoint.id);
        setName(waypoint.name);
        setDescription(waypoint.description || '');
        setElevation(waypoint.elevation || 0);
        setDistance(waypoint.distanceFromStart); // Keeping the distance as is without converting
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
        const waypointData = {
            id: editWaypointId === 'new' ? undefined : editWaypointId,
            name,
            description,
            elevation,
            distanceFromStart: distance, // Keeping the unit consistent with the UI and data model
        };
        if (editWaypointId === 'new') {
            dispatch(addWaypoint(waypointData));
        } else {
            dispatch(updateWaypoint(waypointData));
        }
        resetForm();
    };

    const resetForm = () => {
        setEditWaypointId(null);
        setName('');
        setDescription('');
        setElevation(0);
        setDistance(0);
    };

    const handleAddClick = () => {
        // Define the basic structure for a new waypoint
        const waypointData = {
          name: '',
          description: '',
          distanceFromStart: 0,
          elevation: trackpoints[0]?.elevation || 0, // Default to the first trackpoint's elevation
        };
      
        // Dispatch the action to add the waypoint and the corresponding trackpoint
        dispatch(addWaypoint(waypointData));
      
        // Reset form and prepare for a new waypoint entry
        resetForm();
    };

    return (
      <EditorContainer>
          <h3>Waypoints (Points of interest)</h3>
          <WaypointList>
              {waypoints.map((waypoint) => (
                  <WaypointItem key={waypoint.id} onClick={() => {
                      // Only set editWaypointId if it is not already set to this waypoint's ID
                      if (editWaypointId !== waypoint.id) {
                          setEditWaypointId(waypoint.id);
                          setName(waypoint.name);
                          setDescription(waypoint.description || '');
                          setElevation(waypoint.elevation || 0);
                          setDistance(waypoint.distanceFromStart);
                      }
                  }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <span>{`${waypoint.distanceFromStart.toFixed(2)} km, ${waypoint.name}, ${waypoint.elevation} m`}</span>
                          <DeleteButton onClick={(e) => {
                              e.stopPropagation(); // Prevents the delete click from triggering the item's onClick
                              handleDeleteClick(waypoint.id);
                          }}>Delete</DeleteButton>
                      </div>
                      {editWaypointId === waypoint.id && (
                          <StyledForm
                            isActive={true} // Always true because we're not toggling it closed anymore
                            onSubmit={handleSubmit}
                            style={{
                                maxHeight: "500px", // Always showing when active
                                overflow: "hidden",
                                transition: "max-height 0.3s ease-out"
                            }}
                          >
                                <FormInput 
                                    type="text" 
                                    defaultValue={waypoint.name} 
                                    onChange={(e) => setName(e.target.value)} 
                                    placeholder="Waypoint Name" 
                                />
                                <FormTextarea 
                                    defaultValue={waypoint.description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Description" 
                                />
                                <FormInput 
                                    type="number" 
                                    defaultValue={waypoint.elevation} 
                                    onChange={(e) => setElevation(parseFloat(e.target.value))} 
                                    placeholder="Elevation (m)" 
                                />
                                <FormInput 
                                    type="number" 
                                    value={distance.toString()} 
                                    onChange={(e) => {
                                        const newDistance = parseFloat(e.target.value);

                                        if (!isNaN(newDistance)) {
                                            if (newDistance <= maxDistance) {
                                                setDistance(newDistance);
                                                const interpolatedElevation = findNearestTrackpointElevation(newDistance);
                                                setElevation(interpolatedElevation);
                                            } else {
                                                // Option 1: Reset to max distance (uncomment the line below to use this option)
                                                setDistance(maxDistance);

                                                // Option 2: Display a warning message to the user (not shown here, implementation depends on your UI framework)

                                                // Prevent the update by not setting the state, effectively ignoring the input
                                                // Optionally, provide feedback to the user here
                                                alert("Distance cannot be greater than the last trackpoint.");
                                            }
                                        }
                                    }}
                                    placeholder="Distance from Start (km)" 
                                />

                                <VibrantButton primary type="submit">Save Changes</VibrantButton>
                                <CancelButton type="button" onClick={(e) => {
                                    e.stopPropagation(); // Prevent click from bubbling up to the WaypointItem's onClick
                                    setEditWaypointId(null); // Collapse the form without saving changes
                                }}>Cancel</CancelButton>
                            </StyledForm>
                        )}
                    </WaypointItem>
                ))}
            </WaypointList>
            <Button onClick={() => setEditWaypointId('new')}>Create waypoint</Button>
        </EditorContainer>
    );
    
};

export default WaypointEditor;
