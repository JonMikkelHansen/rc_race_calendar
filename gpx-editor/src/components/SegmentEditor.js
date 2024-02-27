import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSegment, editSegment, deleteSegment } from '../redux/actions/GPXActions';

export const SegmentEditor = () => {
    const trackpoints = useSelector(state => state.trackpoints);
    const segments = useSelector(state => state.segments);
    const dispatch = useDispatch();
    const [segmentName, setSegmentName] = useState('');
    const [startDistance, setStartDistance] = useState('');
    const [endDistance, setEndDistance] = useState('');
    const [editingSegmentId, setEditingSegmentId] = useState(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    useEffect(() => {
        // Effect cleanup if form visibility changes
        if (!isFormVisible) {
            resetForm();
        }
    }, [isFormVisible]);

    const findNearestTrackpointDistance = (distanceKm) => {
        const nearest = trackpoints.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.distanceFromStart - parseFloat(distanceKm));
            const currDiff = Math.abs(curr.distanceFromStart - parseFloat(distanceKm));
            return currDiff < prevDiff ? curr : prev;
        }, trackpoints[0]);
        return nearest.distanceFromStart;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const segmentData = {
            id: editingSegmentId, // Preserve the ID if editing
            name: segmentName,
            startDistance: parseFloat(startDistance),
            endDistance: parseFloat(endDistance),
        };
        
        if (editingSegmentId) {
            dispatch(editSegment(editingSegmentId, segmentData));
        } else {
            dispatch(addSegment(segmentData));
        }
        setIsFormVisible(false);
    };

    const handleEditClick = (segmentId) => {
        const segmentToEdit = segments.find(segment => segment.id === segmentId);
        if (segmentToEdit) {
            setEditingSegmentId(segmentId);
            setSegmentName(segmentToEdit.name);
            setStartDistance(segmentToEdit.startDistance.toString());
            setEndDistance(segmentToEdit.endDistance.toString());
            setIsFormVisible(true);
        }
    };

    const handleDeleteClick = (segmentId) => {
        if (window.confirm("Are you sure you want to delete this segment?")) {
            dispatch(deleteSegment(segmentId));
        }
    };

    const resetForm = () => {
        setSegmentName('');
        setStartDistance('');
        setEndDistance('');
        setEditingSegmentId(null);
    };

    return (
        <div>
            <h3>Create/Edit Segment</h3>
            <button onClick={() => setIsFormVisible(!isFormVisible)}>
                {isFormVisible ? 'Cancel' : 'Create Segment'}
            </button>
            {isFormVisible && (
                <form onSubmit={handleSubmit}>
                    <input type="text" value={segmentName} onChange={(e) => setSegmentName(e.target.value)} placeholder="Segment Name" />
                    <input type="text" value={startDistance} onChange={(e) => setStartDistance(e.target.value)} placeholder="Start Distance (km)" />
                    <input type="text" value={endDistance} onChange={(e) => setEndDistance(e.target.value)} placeholder="End Distance (km)" />
                    <button type="submit">{editingSegmentId ? 'Update Segment' : 'Add Segment'}</button>
                </form>
            )}
            <ul>
                {segments.map((segment) => (
                    <li key={segment.id}>
                        {`${segment.name} - From ${segment.startDistance.toFixed(2)}km (${findNearestTrackpointDistance(segment.startDistance).toFixed(2)}km) to ${segment.endDistance.toFixed(2)}km (${findNearestTrackpointDistance(segment.endDistance).toFixed(2)}km) - Total distance: ${(Math.abs(segment.endDistance - segment.startDistance)).toFixed(2)}km`}
                        <button onClick={() => handleEditClick(segment.id)}>Edit</button>
                        <button onClick={() => handleDeleteClick(segment.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SegmentEditor;
