import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addSegment, editSegment, deleteSegment } from '../redux/actions/GPXActions'; // Ensure correct import paths


export const SegmentEditor = () => {
    const trackpoints = useSelector(state => state.trackpoints);
    const segments = useSelector(state => state.segments);
    const dispatch = useDispatch();
    const [segmentName, setSegmentName] = useState('');
    const [startDistance, setStartDistance] = useState(0);
    const [endDistance, setEndDistance] = useState(0);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [startTrackpoint, setStartTrackpoint] = useState({});
    const [endTrackpoint, setEndTrackpoint] = useState({});

    useEffect(() => {
        if (trackpoints.length > 0) {
            const startTp = findNearestTrackpoint(startDistance);
            const endTp = findNearestTrackpoint(endDistance);
            setStartTrackpoint(startTp);
            setEndTrackpoint(endTp);
        }
    }, [startDistance, endDistance, trackpoints]);

    const findNearestTrackpoint = (distance) => {
        return trackpoints.reduce((prev, curr) => {
            return Math.abs(curr.distanceFromStart - distance) < Math.abs(prev.distanceFromStart - distance) ? curr : prev;
        }, trackpoints[0]); // Default to the first trackpoint if none is closer
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(addSegment({
            name: segmentName,
            startTrackpoint,
            endTrackpoint,
        }));
        resetForm();
    };

    const resetForm = () => {
        setSegmentName('');
        setStartDistance(0);
        setEndDistance(0);
        setIsFormVisible(false); // Optionally hide the form upon submission
    };

    // Sort segments by the start trackpoint's distanceFromStart
    const sortedSegments = segments.slice().sort((a, b) => a.startTrackpoint.distanceFromStart - b.startTrackpoint.distanceFromStart);

    return (
        <div>
            <h3>Create/Edit Segment</h3>
            <ul>
                {sortedSegments.map((segment, index) => {
                    // User-input values converted to km and formatted
                    const userInputStartKm = (segment.startDistance / 1000).toFixed(2);
                    const userInputEndKm = (segment.endDistance / 1000).toFixed(2);
                    // Nearest trackpoint values converted to km and formatted
                    const trackpointStartKm = (segment.startTrackpoint.distanceFromStart / 1000).toFixed(2);
                    const trackpointEndKm = (segment.endTrackpoint.distanceFromStart / 1000).toFixed(2);
                    // Calculating total distance based on user input
                    const totalDistanceKm = (Math.abs(segment.endDistance - segment.startDistance) / 1000).toFixed(2);

                    return (
                        <li key={index}>
                            {`${segment.name} - From ${userInputStartKm}km (${trackpointStartKm}km) to ${userInputEndKm}km (${trackpointEndKm}km) - Total distance: ${totalDistanceKm}km`}
                        </li>
                    );
                })}
            </ul>
            <button onClick={() => setIsFormVisible(!isFormVisible)}>Create Segment</button>
            {isFormVisible && (
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="Segment Name"
                    />
                    <input
                        type="number"
                        value={startDistance}
                        onChange={(e) => setStartDistance(parseFloat(e.target.value))}
                        placeholder="Start Distance (m)"
                    />
                    <input
                        type="number"
                        value={endDistance}
                        onChange={(e) => setEndDistance(parseFloat(e.target.value))}
                        placeholder="End Distance (m)"
                    />
                    <div>
                        Start Trackpoint: {startTrackpoint && startTrackpoint.lat ? `${startTrackpoint.lat}, ${startTrackpoint.lon}` : 'N/A'}
                    </div>
                    <div>
                        End Trackpoint: {endTrackpoint && endTrackpoint.lat ? `${endTrackpoint.lat}, ${endTrackpoint.lon}` : 'N/A'}
                    </div>
                    <button type="submit">Save Segment</button>
                </form>
            )}
        </div>
    );
};

export default SegmentEditor;
