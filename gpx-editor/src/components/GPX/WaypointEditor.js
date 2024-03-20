import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import { updateWaypoint, deleteWaypoint, addWaypoint, addWaypointAndTrackpoint } from '../../redux/actions/GPXActions';
import { interpolateTrackpointData } from '../../Utilities'; // Adjust the path as necessary

import styled from 'styled-components';


const EditorContainer = styled.div`
  width: 90%;
  padding: 20px;
  background-color: #f0f0f0;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const EditForm = styled.form`
  display: block; /* Changed from flex to block */
  padding: 10px;
  border-radius: 5px;
  transition: max-height 0.3s ease-out;
  overflow: hidden;
  background-color: transparent; /* Removed background color */
  position: relative; /* Positioned relative to place the delete button absolutely */
  padding-top: 40px; /* Give space for the delete button at the top */
  box-shadow: 0 4px 8px rgba(0,0,0,0.1); /* Optional: add shadow for depth */
`;

const WaypointInfo = styled.div`
  justifyContent: space-between; 
  alignItems: center;
  width: 100%;
  display: ${props => props.isActive ? 'none' : 'flex'}; // Use props to toggle height
`;  

const StyledForm = styled.form`
display: grid;
grid-template-columns: repeat(5, 1fr); /* Four columns of equal width */
grid-gap: 10px; /* Spacing between grid items */
align-items: top; /* Align items vertically */
width: 100%;
margin: 1em 2em 1em .1em;

/* Adjust the size of specific grid items if necessary */
.full-width {
  grid-column: 1 / -1; /* Makes the item take up the whole width */
}

.span-2 { /* Class to make an item span two columns */
    grid-column: span 2;
  }

.span-3 { /* Class to make an item span three columns */
  grid-column: span 3;
}

.span-4 { /* Class to make an item span all four columns */
  grid-column: span 4;
}

.span-down-3 {
  grid-row: span 3; /* Makes the item span two rows */
}

/* Style for labels to align with the inputs */
label {
  display: block;
  margin-bottom: 5px;
}

/* Optional: Style for the input and textarea elements */
input, textarea, select {
  width: 92%; /* Make input fields take up the full width of their grid column */
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

select{
  width: 100%;
}

/* Button styling */
button {
  justify-self: start; /* Align buttons to the start of their grid column */
}
  max-height: ${props => props.isActive ? '500px' : '0'}; // Use props to toggle height
`;

const FormInput = styled.input`
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const FormTextarea = styled.textarea`
  padding: 0.5em
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 12em;
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
  align-items: flex-start;
  cursor: pointer;

  &:hover {
    background-color: #444; // Slightly lighter on hover to indicate interactivity
  }
`;

// Adjusted buttons for compact styling
const CreateButton = styled.button`
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
    const waypoints = useSelector(state => state.waypoints.sort((a, b) => {
      // Check if both waypoints have a createdAt timestamp
      if (a.createdAt && b.createdAt) {
        // Both waypoints have a timestamp, so sort by timestamp descending (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (a.createdAt) {
        // Only waypoint a has a timestamp, so it should come before b
        return -1;
      } else if (b.createdAt) {
        // Only waypoint b has a timestamp, so a should come before b
        return 1;
      }
      // Neither waypoint has a timestamp, or other sorting logic if needed
      return a.distanceFromStart - b.distanceFromStart;
    }));
    // Correctly fetch trackpoints from the Redux store
    const trackpoints = useSelector((state: { trackpoints: any }) => state.trackpoints); // Assuming trackpoints are stored in the Redux state under 'trackpoints'
    const dispatch = useDispatch();
    const [editWaypointId, setEditWaypointId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [elevation, setElevation] = useState(0);
    const [distance, setDistance] = useState(0); // Distance should remain in the unit it is used in the UI
    // Calculate maxDistance here to make it accessible throughout the component
    // Add this new state to keep track of the input value independently
    const [inputDistance, setInputDistance] = useState(0);
    const maxDistance = trackpoints[trackpoints.length - 1]?.distanceFromStart || 0;
    const [type, setType] = useState('');

    const logUserCreatedTrackpoints = () => {
        const userCreatedTrackpoints = trackpoints.filter(tp => tp.userCreated);
        console.log("User Created Trackpoints:", userCreatedTrackpoints);
    };

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
  
    useEffect(() => {
      logUserCreatedTrackpoints();
  }, [trackpoints]); // Assuming trackpoints are a dependency
  

    const handleEditClick = (waypoint) => {
      if (editWaypointId !== waypoint.id) {
        setEditWaypointId(waypoint.id);
        setName(waypoint.name);
        setDescription(waypoint.description || '');
        setElevation(waypoint.elevation || 0);
        setDistance(waypoint.distanceFromStart); // Keeping the distance as is without converting
        setType(waypoint.type || "null");
      }else{

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
      const waypointData = {
        id: editWaypointId, // No longer 'new', it should be the actual ID of the waypoint
        name,
        description,
        elevation: elevation,
        distanceFromStart: distance,
        type,
      };
    
      // Dispatch the updated action creator
      dispatch(updateWaypoint(waypointData));
      resetForm();
    };

    const resetForm = () => {
        setEditWaypointId(null);
        setName('');
        setDescription('');
        setElevation(0);
        setDistance(0);
        setType('null');
    };

    const handleAddClick = () => {
        // Use UUID to generate a unique ID for the new waypoint
        console.log("Trackpoints Array Before Interpolation:", trackpoints);
    
        // Assuming a distance of 0 for the new waypoint, interpolate the initial trackpoint data
        const interpolatedData = trackpoints.length > 0 ? interpolateTrackpointData(0, trackpoints) : { lat: 0, lon: 0, elevation: 0 };
    
        console.log("Interpolated Trackpoint Data:", interpolatedData); // Debug log

        // Prepare the new waypoint data with the interpolated trackpoint data
        const newWaypoint = {
            name: '', // Default to an empty name
            description: '', // Default to an empty description            
            latitude: interpolatedData.lat,
            longitude: interpolatedData.lon,
            elevation: interpolatedData.elevation,
            distanceFromStart: 0,
            createdAt: new Date().toISOString(), // Add a timestamp
            userCreated: true,
        };
        // Dispatch the action to add the new waypoint to the Redux store
        // Assuming you have an action creator that accepts this waypoint object
        dispatch(addWaypointAndTrackpoint(newWaypoint));

        // Log to see if the action was dispatched
        console.log("Dispatched new waypoint:", newWaypoint);

        // Reset form and prepare UI for entering details of the new waypoint
        setName('');
        setDescription('');
        setElevation(interpolatedData.elevation);
        setDistance(0);
    };

    // Add this handler function
    const handleDistanceChange = (e) => {
      const newDistance = parseFloat(e.target.value);
      if (!isNaN(newDistance) && newDistance >= 0 && newDistance <= maxDistance) {
        setDistance(newDistance); // Update the distance state
        setInputDistance(newDistance); // Update the input distance state
        // Call interpolateTrackpointData to get the interpolated elevation
        const interpolatedData = interpolateTrackpointData(newDistance, trackpoints);
        if (interpolatedData) {
          setElevation(interpolatedData.elevation); // Update the elevation state with the interpolated value
        }
      }
    };

    return (
      <EditorContainer>
          <h3>Waypoints (Points of interest)</h3>
          <CreateButton onClick={handleAddClick}>Create waypoint</CreateButton>
          <WaypointList>
            {waypoints.map((waypoint) => (
              <WaypointItem
                key={waypoint.id}
                onClick={() => handleEditClick(waypoint)} // Call handleEditClick with the waypoint
              >
                {editWaypointId === waypoint.id ? (
                          <StyledForm
                            isActive={true} // Always true because we're not toggling it closed anymore
                            onSubmit={handleSubmit}
                            
                          > 
                            <div className='span-3'>
                              <label htmlFor="name">Name</label>
                              <FormInput 
                                  id="name"
                                  type="text" 
                                  defaultValue={waypoint.name} 
                                  onChange={(e) => setName(e.target.value)} 
                                  placeholder="Waypoint Name" 
                              />
                            </div>
                            <div className='span-2'>
                              <label htmlFor="name">Type</label>
                              <select value={type} onChange={(e) => setType(e.target.value)}>
                                <option value="null">Select a type</option>
                                <option value="climb">Climb</option>
                                <option value="sprint">Sprint</option>
                                <option value="scenic">Scenic</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                            <div className='span-3 span-down-3'>
                                <FormTextarea 
                                    id='description'
                                    type="textarea"
                                    defaultValue={waypoint.description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Description" 
                                />
                             </div>
                             <div className='span-2'>
                              <label htmlFor="elevation">Elevation (m)</label>
                                <FormInput 
                                  id="elevation"
                                  type="number" 
                                  value={elevation.toString()} 
                                  onChange={(e) => {
                                    const newElevation = parseFloat(e.target.value);
                                    if (!isNaN(newElevation)) {
                                      setElevation(newElevation); // Update elevation only if the input is a number
                                    }
                                  }} 
                                  placeholder="Elevation (m)" 
                                />
                              </div>
                              <div className='span-2'>
                                <label htmlFor="distance">Distance from start (km)</label>
                                <FormInput 
                                  id="distance"
                                  type="number" 
                                  value={distance.toString()}
                                  onChange={(e) => {
                                    const newDistance = parseFloat(e.target.value);
                                    setInputDistance(newDistance); // Update the inputDistance state as the user types
                                    if (!isNaN(newDistance)) {
                                      if (newDistance <= maxDistance) {
                                        setDistance(newDistance); // Update distance only if within the allowed range
                                        const interpolatedData = interpolateTrackpointData(newDistance, trackpoints);
                                        setElevation(interpolatedData.elevation); // Update elevation with interpolated value
                                      } else {
                                        alert("Distance cannot be greater than the last trackpoint.");
                                        setInputDistance(maxDistance); // Reset input distance if it exceeds maxDistance
                                        setDistance(maxDistance); // Ensure distance state is also set to maxDistance
                                        const interpolatedData = interpolateTrackpointData(maxDistance, trackpoints);
                                        setElevation(interpolatedData.elevation); // Update elevation with interpolated value at maxDistance
                                      }
                                    }
                                  }}
                                  placeholder="Distance from Start (km)" 
                                />
                              </div>

                                <CancelButton type="button" onClick={(e) => {
                                    e.stopPropagation(); // Prevent click from bubbling up to the WaypointItem's onClick
                                    setEditWaypointId(null); // Collapse the form without saving changes
                                }}>Cancel</CancelButton>
                                <SaveButton primary type="submit">Save Changes</SaveButton>
                            </StyledForm>
                        ) : (
                          // Display waypoint information when it's not in edit mode
                          <div>
                            <span>{`${waypoint.distanceFromStart.toFixed(2)} km, ${waypoint.name}, ${waypoint.elevation} m`}</span>
                          </div>
                        )}
                        <DeleteButton
                          onClick={(e) => {
                            e.stopPropagation(); // Stop click from bubbling up to the WaypointItem's onClick
                            handleDeleteClick(waypoint.id);
                          }}
                        >
                          Delete
                        </DeleteButton>
                      </WaypointItem>
                ))}
            </WaypointList>
        </EditorContainer>
    );
};



export default WaypointEditor;
