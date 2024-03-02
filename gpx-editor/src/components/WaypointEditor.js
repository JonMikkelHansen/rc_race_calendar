import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWaypoint, deleteWaypoint, addWaypoint } from '../redux/actions/GPXActions';
import styled from 'styled-components';


const EditorContainer = styled.div`
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

    // Function to find nearest trackpoint's elevation based on distance
    const findNearestTrackpointElevation = (waypointDistance) => {
        const closest = trackpoints.reduce((prev, curr) => {
            return Math.abs(curr.distanceFromStart - waypointDistance) < Math.abs(prev.distanceFromStart - waypointDistance) ? curr : prev;
        });
        return closest.elevation;
    };

    useEffect(() => {
        if (editWaypointId !== null) { // Only update elevation if in edit or create mode
            const nearestElevation = findNearestTrackpointElevation(distance);
            setElevation(nearestElevation);
        }
    }, [distance, editWaypointId, trackpoints]);

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
        resetForm();
        setEditWaypointId('new');
    };

    return (
        <EditorContainer>
            <h3>Waypoints (Points of interest)</h3>
            <WaypointList>
                {waypoints.map((waypoint) => (
                    <WaypointItem key={waypoint.id} onClick={() => setEditWaypointId(editWaypointId === waypoint.id ? null : waypoint.id)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span>{`${waypoint.distanceFromStart.toFixed(2)} km, ${waypoint.name}, ${waypoint.elevation} m`}</span>
                            <DeleteButton onClick={(e) => {
                                e.stopPropagation(); // Stops the delete button click from expanding the item
                                handleDeleteClick(waypoint.id);
                            }}>Delete</DeleteButton>
                        </div>
                        {editWaypointId === waypoint.id && (
                            <StyledForm
                              isActive={editWaypointId === waypoint.id}
                              onSubmit={(e) => {
                                  e.preventDefault(); // Prevents form submission in traditional manner
                                  // Handle form submission logic here
                                  setEditWaypointId(null); // Close the form upon submission
                              }}
                              style={{
                                  maxHeight: editWaypointId === waypoint.id ? "500px" : "0",
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
                                    defaultValue={waypoint.distanceFromStart} 
                                    onChange={(e) => setDistance(parseFloat(e.target.value))} 
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
