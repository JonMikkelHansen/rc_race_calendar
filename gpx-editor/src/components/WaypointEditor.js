import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateWaypoint } from '../redux/actions/GPXActions'; // Import the action

export const WaypointEditor = ({ waypoint }) => {
  const [name, setName] = useState(waypoint?.name || '');
  const [description, setDescription] = useState(waypoint?.description || '');
  const [height, setHeight] = useState(waypoint?.elevation || 0);
  const [distance, setDistance] = useState((waypoint?.distanceFromStart / 1000) || 0);

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedWaypoint = { 
      ...waypoint, 
      name, 
      description, 
      elevation: height, 
      distanceFromStart: distance * 1000 // Convert back to meters
    };
    
    // Dispatch action to update waypoint in store
    dispatch(updateWaypoint(updatedWaypoint));
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form inputs for editing waypoint details */}
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
      <input type="number" value={height} onChange={(e) => setHeight(parseFloat(e.target.value))} />
      <input type="number" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} />
      <button type="submit">Save Changes</button>
    </form>
  );
};

export default WaypointEditor;
