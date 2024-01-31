import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWaypoint, deleteWaypoint } from '../redux/actions/GPXActions'; // Assume deleteWaypoint action exists

export const WaypointEditor = () => {
    const waypoints = useSelector(state => state.waypoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart)); // Sorting waypoints by distance
    const dispatch = useDispatch();
    const [editWaypointId, setEditWaypointId] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [elevation, setElevation] = useState(0);
    const [distance, setDistance] = useState(0); // Distance in kilometers for UI

    const handleEditClick = (waypoint) => {
        setEditWaypointId(waypoint.id);
        setName(waypoint.name);
        setDescription(waypoint.description || '');
        setElevation(waypoint.elevation || 0);
        setDistance(waypoint.distanceFromStart / 1000 || 0); // Convert meters to kilometers
    };

    const handleDeleteClick = (waypointId) => {
        const isConfirmed = window.confirm("Are you sure you want to delete this waypoint?");
        if (isConfirmed) {
            dispatch(deleteWaypoint(waypointId));
            // Reset form if the deleted waypoint was being edited
            if (waypointId === editWaypointId) {
                resetForm();
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(updateWaypoint({
            id: editWaypointId,
            name,
            description,
            elevation,
            distanceFromStart: distance * 1000, // Convert back to meters
        }));
        resetForm();
    };

    const resetForm = () => {
        setEditWaypointId(null);
        setName('');
        setDescription('');
        setElevation(0);
        setDistance(0);
    };

    return (
        <div>
            <h3>Edit Waypoints</h3>
            <ul>
                {waypoints.map((waypoint) => (
                    <li key={waypoint.id}>
                        {`${(waypoint.distanceFromStart / 1000).toFixed(2)} km, ${waypoint.name}, ${waypoint.elevation}m `}
                        <button onClick={() => handleEditClick(waypoint)}>Edit</button>
                        <button onClick={() => handleDeleteClick(waypoint.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            {editWaypointId && (
                <form onSubmit={handleSubmit}>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Waypoint Name" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                    <input type="number" value={elevation} onChange={(e) => setElevation(parseFloat(e.target.value))} placeholder="Elevation" />
                    <input type="number" step="0.01" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} placeholder="Distance from Start (km)" />
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={resetForm}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default WaypointEditor;
