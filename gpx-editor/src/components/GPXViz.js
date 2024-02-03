import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useSelector, useDispatch } from 'react-redux';
import {
  setTolerance, setTension, setMinY, setMaxY, setStageTitle,
  setShowTrackpoints, setShowWaypoints, setShowAnnotations
} from '../redux/actions/GPXActions';
import { Chart, registerables } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { douglasPeucker } from '../Utilities';

Chart.register(...registerables, annotationPlugin);

const GPXViz = () => {
    const dispatch = useDispatch();
    const reduxTolerance = useSelector(state => state.tolerance);
    const reduxTension = useSelector(state => state.tension);
    const reduxMinY = useSelector(state => state.minY);
    const reduxMaxY = useSelector(state => state.maxY);
    const stageTitle = useSelector(state => state.stageTitle || 'Unknown');
    const trackpoints = useSelector(state => state.trackpoints);
    const waypoints = useSelector(state => state.waypoints);
    const showTrackpoints = useSelector(state => state.showTrackpoints);
    const showWaypoints = useSelector(state => state.showWaypoints);
    const showAnnotations = useSelector(state => state.showAnnotations);
    const [simplifiedData, setSimplifiedData] = useState([]);
    const [maxDistanceKm, setMaxDistanceKm] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // Add editing state
    const [editedTitle, setEditedTitle] = useState(stageTitle); // Add edited title state    

    useEffect(() => {
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

    const handleEditClick = () => {
      setIsEditing(true); // Enter editing mode
    };

    const handleSaveClick = () => {
        setIsEditing(false); // Exit editing mode
        dispatch(setStageTitle(editedTitle)); // Dispatch the edited title to Redux
    };

    const handleCheckboxChange = (action) => (e) => {
        dispatch(action(e.target.checked));
    };

    const data = {
      datasets: [{
          label: 'Elevation',
          data: simplifiedData,
          showLine: true,
          fill: false,
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
            y: { min: reduxMinY, max: reduxMaxY },
            x: {
                type: 'linear',
                position: 'bottom',
                title: { display: true, text: 'Distance (km)' },
                max: maxDistanceKm,
            }
        },
        elements: {
            line: {
                tension: 0 // Ensures lines are straight
            }
        },
    };
    
    return (
      <div>
      <h2>Height Profile:&nbsp;
          {isEditing ? ( // Render input field when editing
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
          ) : (
            <>
              {stageTitle}
              <button onClick={handleEditClick}>Edit</button>
            </>
          )}
    </h2>
    {isEditing && (
        <button onClick={handleSaveClick}>Save</button> // Render save button in editing mode
    )}
            <Line data={data} options={options} />
            <div>
                <input
                    id="showTrackpoints"
                    type="checkbox"
                    checked={showTrackpoints}
                    onChange={handleCheckboxChange(setShowTrackpoints)}
                />
                <label htmlFor="showTrackpoints">Trackpoints</label>
                <input
                    id="showWaypoints"
                    type="checkbox"
                    checked={showWaypoints}
                    onChange={handleCheckboxChange(setShowWaypoints)}
                />
                <label htmlFor="showWaypoints">Waypoints</label>
                <input
                    id="showAnnotations"
                    type="checkbox"
                    checked={showAnnotations}
                    onChange={handleCheckboxChange(setShowAnnotations)}
                />
                <label htmlFor="showAnnotations">Annotations</label>
            </div>
            <div>
                <label>Tolerance:</label>
                <input
                    type="number"
                    step="0.0000001"
                    value={reduxTolerance || 100}
                    onChange={handleInputChange(setTolerance)}
                />
            </div>
            <div>
                <label>Tension:</label>
                <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={reduxTension || 0}
                    onChange={handleInputChange(setTension)}
                />
            </div>
            <div>
                <label>Maximum Elevation (step of 50):</label>
                <input
                    type="number"
                    step="10"
                    value={reduxMaxY || 1000}
                    onChange={handleInputChange(setMaxY)}
                />
            </div>
            <div>
                <label>Minimum Elevation (step of 50):</label>
                <input
                    type="number"
                    step="10"
                    value={reduxMinY}
                    onChange={handleInputChange(setMinY)}
                />
            </div>
        </div>
    );
};

export default GPXViz;
