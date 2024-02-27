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
    const [isFormVisible, setIsFormVisible] = useState(false);

    const findNearestTrackpointDistance = (distance) => {
        // Assuming distance is already in kilometers
        const nearest = trackpoints.reduce((prev, curr) => {
            return Math.abs(curr.distanceFromStart - parseFloat(distance)) < Math.abs(prev.distanceFromStart - parseFloat(distance)) ? curr : prev;
        }, trackpoints[0]);
        return nearest.distanceFromStart; // This returns the distance in kilometers for the nearest trackpoint
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addSegment({
            name: segmentName,
            startDistance: parseFloat(startDistance), // User's input in kilometers
            endDistance: parseFloat(endDistance), // User's input in kilometers
            // Not directly using startTrackpoint and endTrackpoint in payload anymore,
            // as we need to calculate and store the nearest trackpoint distances for accuracy verification
        }));
        resetForm();
    };

    const resetForm = () => {
        setSegmentName('');
        setStartDistance('');
        setEndDistance('');
        setIsFormVisible(false);
    };

    return (
        <div>
            <h3>Create/Edit Segment</h3>
            <button onClick={() => setIsFormVisible(!isFormVisible)}>
                {isFormVisible ? 'Cancel' : 'Create Segment'}
            </button>
            {isFormVisible && (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="Segment Name"
                    />
                    <input
                        type="text"
                        value={startDistance}
                        onChange={(e) => setStartDistance(e.target.value)}
                        placeholder="Start Distance (km)"
                    />
                    <input
                        type="text"
                        value={endDistance}
                        onChange={(e) => setEndDistance(e.target.value)}
                        placeholder="End Distance (km)"
                    />
                    <button type="submit">Save Segment</button>
                </form>
            )}
            <ul>
                {segments.map((segment, index) => (
                    <li key={index}>
                        {`${segment.name} - From ${segment.startDistance.toFixed(2)}km (${findNearestTrackpointDistance(segment.startDistance).toFixed(2)}km) to ${segment.endDistance.toFixed(2)}km (${findNearestTrackpointDistance(segment.endDistance).toFixed(2)}km) - Total distance: ${(Math.abs(segment.endDistance - segment.startDistance)).toFixed(2)}km`}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SegmentEditor;
