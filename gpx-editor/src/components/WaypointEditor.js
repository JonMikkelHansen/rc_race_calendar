import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWaypoint } from '../redux/actions/GPXActions';

export const WaypointEditor = () => {
  const waypoints = useSelector(state => state.waypoints); // Assuming 'waypoints' is the correct path in your Redux store
  const [selectedWaypointId, setSelectedWaypointId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [elevation, setElevation] = useState(0);
  const [distance, setDistance] = useState(0); // Distance in kilometers for UI

  const dispatch = useDispatch();

  const selectWaypoint = (waypointId) => {
    const waypoint = waypoints.find(wp => wp.id === waypointId);
    if (waypoint) {
      setSelectedWaypointId(waypointId);
      setName(waypoint.name);
      setDescription(waypoint.description);
      setElevation(waypoint.elevation);
      setDistance(waypoint.distanceFromStart / 1000); // Convert meters to kilometers
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedWaypointId == null) return;

    const updatedWaypoint = {
      id: selectedWaypointId,
      name,
      description,
      elevation,
      distanceFromStart: distance * 1000 // Convert back to meters for storage
    };
    
    dispatch(updateWaypoint(updatedWaypoint));
    // Optionally, clear the form or give feedback to the user
  };

  return (
    <div>
      <h3>Edit Waypoints</h3>
      <div>
        <label>Select Waypoint:</label>
        <select onChange={(e) => selectWaypoint(e.target.value)} value={selectedWaypointId || ''}>
          <option value="">Select a waypoint...</option>
          {waypoints.map((waypoint) => (
            <option key={waypoint.id} value={waypoint.id}>
              {waypoint.name}
            </option>
          ))}
        </select>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Waypoint Name" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
        <input type="number" value={elevation} onChange={(e) => setElevation(parseFloat(e.target.value))} placeholder="Elevation" />
        <input type="number" step="0.01" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} placeholder="Distance from Start (km)" />
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default WaypointEditor;
