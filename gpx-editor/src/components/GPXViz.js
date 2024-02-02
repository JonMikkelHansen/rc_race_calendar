import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useSelector, useDispatch } from 'react-redux';
import { setTolerance, setTension, setMinY, setMaxY } from '../redux/actions/GPXActions';
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
    const waypoints = useSelector(state => state.waypoints);
    const trackpoints = useSelector(state => state.trackpoints);
    const [simplifiedData, setSimplifiedData] = useState([]);
    const [initialYSet, setInitialYSet] = useState(false);
    const [annotations, setAnnotations] = useState([]);
    const [maxDistanceKm, setMaxDistanceKm] = useState(null);
    const [showOnlyWaypoints, setShowOnlyWaypoints] = useState(false);


    useEffect(() => {
      dispatch(setTolerance(100)); // Initial tolerance set to 100
      dispatch(setTension(0)); // Initial tension set to 0
        if (trackpoints.length > 0) {
            // Simplify trackpoints using Douglas-Peucker algorithm
            const simplifiedTrackPoints = douglasPeucker(trackpoints, reduxTolerance);
            setSimplifiedData(simplifiedTrackPoints);

            const maxDistance = (Math.max(...simplifiedTrackPoints.map(tp => tp.distanceFromStart)) / 1000).toFixed(2);
            setMaxDistanceKm(maxDistance);
        }

        // Prepare annotations for waypoints
        setAnnotations(waypoints.map(waypoint => ({
            type: 'line',
            mode: 'vertical',
            scaleID: 'x',
            value: (waypoint.distanceFromStart / 1000).toFixed(2),
            borderColor: 'red',
            borderWidth: 1,
            borderDash: [5, 5],
            label: {
                enabled: true,
                content: waypoint.name,
            },
        })));

        if (!initialYSet && trackpoints.length > 0) {
          const elevations = trackpoints.map(p => p.elevation);
          const lowestElevation = Math.floor(Math.min(...elevations) / 100) * 100;
          let highestElevation = Math.ceil(Math.max(...elevations) / 100) * 100;
          highestElevation = Math.max(highestElevation, 1000); // Ensure max elevation is at least 1000
          dispatch(setMinY(lowestElevation));
          dispatch(setMaxY(highestElevation));
          setInitialYSet(true);
      }
    }, [trackpoints, reduxTolerance, dispatch, initialYSet, waypoints]);

    const handleInputChange = (actionCreator) => (e) => {
        dispatch(actionCreator(parseFloat(e.target.value)));
    };

    const data = {
      labels: simplifiedData.map(point => (point.distanceFromStart / 1000).toFixed(1)),
      datasets: [{
        label: 'Elevation',
        data: simplifiedData.map(point => point.elevation),
        fill: true,
        borderColor: 'rgb(75, 192, 192)',
        tension: reduxTension,
        pointRadius: simplifiedData.map(point => (point.isWaypoint && showOnlyWaypoints) ? 5 : 3), // Change 0 to 1 or any other value that suits your needs
        pointBackgroundColor: simplifiedData.map(point => (point.isWaypoint && showOnlyWaypoints) ? 'red' : 'rgb(75, 192, 192)'),
      }]
    };

    const options = {
        scales: {
            y: { min: reduxMinY, max: reduxMaxY },
            x: { 
                title: { display: true, text: 'Distance (kilometers)' },
                max: maxDistanceKm,
            }
        },
        plugins: {
            annotation: {
                annotations: annotations,
            },
        },
    };

    return (
        <div>
            <h2>Height Profile</h2>
            <Line data={data} options={options} />
            <div>
            <button onClick={() => setShowOnlyWaypoints(prevState => !prevState)}>
                Toggle Waypoints
            </button>
            </div>
            <div>
                <label>Tolerance:</label>
                <input
                    type="number"
                    step="0.0000001"
                    value={reduxTolerance}
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
                    value={reduxTension}
                    onChange={handleInputChange(setTension)}
                />
            </div>
            <div>
                <label>Maximum Elevation (step of 50):</label>
                <input
                    type="number"
                    step="50"
                    value={reduxMaxY}
                    onChange={handleInputChange(setMaxY)}
                />
            </div>
            <div>
                <label>Minimum Elevation (step of 50):</label>
                <input
                    type="number"
                    step="50"
                    value={reduxMinY}
                    onChange={handleInputChange(setMinY)}
                />
            </div>
        </div>
    );
};

export default GPXViz;
