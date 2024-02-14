// GPXProfile.js
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { douglasPeucker } from '../Utilities'; // Adjust the path as necessary
import { setMinY, setMaxY, setTolerance, setTension, setShowTrackpoints, setShowWaypoints, setShowAnnotations  } from '../redux/actions/GPXActions'; // Adjust the path as necessary
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

//REGISTERS
Chart.register(...registerables, annotationPlugin);


const GPXProfile = () => {
    const dispatch = useDispatch();
    // Redux state selectors
    const reduxTolerance = useSelector(state => state.tolerance);
    const reduxTension = useSelector(state => state.tension);
    const reduxMinY = useSelector(state => state.minY);
    const reduxMaxY = useSelector(state => state.maxY);
    const trackpoints = useSelector(state => state.trackpoints);
    const waypoints = useSelector(state => state.waypoints);
    const showTrackpoints = useSelector(state => state.showTrackpoints);
    const showWaypoints = useSelector(state => state.showWaypoints);
    const showAnnotations = useSelector(state => state.showAnnotations);
    const minY = useSelector(state => state.minY);
    const maxY = useSelector(state => state.maxY);
    const [simplifiedData, setSimplifiedData] = useState([]);
    const [maxDistanceKm, setMaxDistanceKm] = useState(null);

    useEffect(() => {
        // Default settings initialization
        if (reduxTolerance === undefined) {
            dispatch(setTolerance(100));
        }
        if (reduxTension === undefined) {
            dispatch(setTension(0));
        }
        if (reduxMaxY === undefined) {
            dispatch(setMaxY(1000));
        }
    }, [dispatch, reduxTolerance, reduxTension, reduxMaxY]);

    useEffect(() => {
        // Simplify trackpoints based on tolerance and set up chart data
        if (trackpoints.length > 0) {
            const simplifiedTrackPoints = douglasPeucker(trackpoints, reduxTolerance);
            const dataWithWaypointInfo = simplifiedTrackPoints.map(point => ({
                x: point.distanceFromStart / 1000,
                y: point.elevation,
                isWaypoint: waypoints.some(wp => wp.id === point.waypointID)
            }));
            setSimplifiedData(dataWithWaypointInfo);

            const maxDistance = simplifiedTrackPoints.reduce((max, p) => Math.max(max, p.distanceFromStart), 0) / 1000;
            setMaxDistanceKm(maxDistance.toFixed(2));
        }
    }, [trackpoints, reduxTolerance, waypoints]);

    useEffect(() => {
        // Adjust Y-axis scale based on elevation data
        const elevations = trackpoints.map(p => p.elevation);
        if (elevations.length > 0) {
            const minY = Math.floor(Math.min(...elevations) / 100) * 100;
            let maxY = Math.ceil(Math.max(...elevations) / 100) * 100;
            maxY = Math.max(maxY, 1000);
            dispatch(setMinY(minY));
            dispatch(setMaxY(maxY));
        }
    }, [trackpoints, dispatch]);

    const handleInputChange = (action) => (e) => {
        dispatch(action(parseFloat(e.target.value)));
    };
    
    const handleCheckboxChange = (action) => (e) => {
        dispatch(action(e.target.checked));
    };

    const data = {
        datasets: [{
            label: 'Elevation',
            data: simplifiedData,
            showLine: true,
            fill: {
                target: 'origin',
                above: 'rgba(75, 192, 192, 0.2)',
            },
            borderColor: 'rgb(75, 192, 192)',
            tension: reduxTension,
            pointRadius: simplifiedData.map(point => 
                point.isWaypoint && showWaypoints ? 4 : showTrackpoints ? 2 : 0),
            pointBackgroundColor: simplifiedData.map(point => 
                point.isWaypoint && showWaypoints ? 'red' : 'rgb(75, 192, 192)'),
        }]
    };

    const options = {
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                title: { display: true, text: 'Elevation' },
                min: reduxMinY,
                max: reduxMaxY,
            },
            x: {
                type: 'linear',
                position: 'bottom',
                title: { display: true, text: 'Distance (km)' },
                max: maxDistanceKm,
            },
        },
        elements: {
            line: {
                tension: 0,
            },
        },
        plugins: {
            annotation: {
                annotations: {
                    fillBelowZero: {
                        type: 'box',
                        xMin: 0,
                        xMax: maxDistanceKm,
                        yMin: 0,
                        yMax: reduxMinY,
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderWidth: 0,
                    },
                    // Dynamically generated annotations for waypoints
                    ...waypoints.filter(waypoint => waypoint.isWaypoint).map(waypoint => ({
                        type: 'line',
                        mode: 'vertical',
                        scaleID: 'x',
                        value: waypoint.distanceFromStart / 1000,
                        borderColor: 'rgba(255, 0, 0, 0.5)',
                        borderWidth: 1,
                        borderDash: [5, 5],
                    })),
                },
            },
        },
    };

    return (
        <div>
        <Line data={data} options={options} />
        <div>
            <input
                type="checkbox"
                checked={showTrackpoints}
                onChange={handleCheckboxChange(setShowTrackpoints)}
            /> Show Trackpoints
            <input
                type="checkbox"
                checked={showWaypoints}
                onChange={handleCheckboxChange(setShowWaypoints)}
                style={{ marginLeft: '10px' }}
            /> Show Waypoints
            <input
                type="checkbox"
                checked={showAnnotations}
                onChange={handleCheckboxChange(setShowAnnotations)}
                style={{ marginLeft: '10px' }}
            /> Show Annotations
        </div>
        <div style={{ marginTop: '10px' }}>
            Tolerance: 
            <input
                type="number"
                value={reduxTolerance || 100}
                onChange={handleInputChange(setTolerance)}
                style={{ marginLeft: '5px' }}
            />
            Tension: 
            <input
                type="number"
                value={reduxTension || 0}
                onChange={handleInputChange(setTension)}
                step="0.1"
                min="0"
                max="1"
                style={{ marginLeft: '10px' }}
            />
            Min Y: 
            <input
                type="number"
                value={reduxMinY}
                onChange={handleInputChange(setMinY)}
                step="50"
                style={{ marginLeft: '10px' }}
            />
            Max Y: <input
                type="number"
                value={reduxMaxY}
                onChange={handleInputChange(setMaxY)}
                step="50"
                style={{ marginLeft: '10px' }}
            />
        </div>
    </div>
    );
};

export default GPXProfile;