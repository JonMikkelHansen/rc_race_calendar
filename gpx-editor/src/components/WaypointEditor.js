import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateWaypoint, deleteWaypoint, addWaypoint } from '../redux/actions/GPXActions';

export const WaypointEditor = () => {
    const waypoints = useSelector(state => state.waypoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart));
    const trackpoints = useSelector(state => state.trackpoints); // Accessing trackpoints from the Redux store
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
        <div>
            <h3>Edit Waypoints</h3>
            <ul>
                {waypoints.map((waypoint) => (
                    <li key={waypoint.id}>
                        {`${waypoint.distanceFromStart.toFixed(2)}km, ${waypoint.name}, ${waypoint.elevation}m `}
                        <button onClick={() => handleEditClick(waypoint)}>Edit</button>
                        <button onClick={() => handleDeleteClick(waypoint.id)}>Delete</button>
                    </li>
                ))}
                <li><button onClick={handleAddClick}>Create waypoint</button></li>
            </ul>
            {((editWaypointId !== null && editWaypointId !== undefined) || name !== '' || description !== '' || elevation !== 0 || distance !== 0) && (
                <form onSubmit={handleSubmit}>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Waypoint Name" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                    <input type="number" value={elevation} onChange={(e) => setElevation(parseFloat(e.target.value))} placeholder="Elevation (m)" />
                    <input type="number" value={distance} onChange={(e) => setDistance(parseFloat(e.target.value))} placeholder="Distance from Start (m)" />
                    <button type="submit">Save Changes</button>
                    <button type="button" onClick={resetForm}>Cancel</button>
                </form>
            )}
        </div>
    );
};

export default WaypointEditor;
