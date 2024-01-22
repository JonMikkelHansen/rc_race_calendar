import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useSelector, useDispatch } from 'react-redux';
import { setTolerance, setTension, setMinY, setMaxY } from '../redux/actions/GPXActions';
import { douglasPeucker } from '../Utilities';

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
  const [showOnlyWaypoints, setShowOnlyWaypoints] = useState(false);

  useEffect(() => {
    if (trackpoints.length > 0) {
      // Apply Douglas-Peucker algorithm considering waypoints
      const simplifiedTrackPoints = douglasPeucker(trackpoints, reduxTolerance);
      setSimplifiedData(simplifiedTrackPoints);

      if (!initialYSet) {
        const elevations = simplifiedTrackPoints.map(p => p.elevation);
        const lowestElevation = Math.floor(Math.min(...elevations) / 100) * 100;
        const highestElevation = Math.ceil(Math.max(...elevations) / 100) * 100;
        dispatch(setMinY(lowestElevation));
        dispatch(setMaxY(highestElevation));
        setInitialYSet(true);
      }
    }
  }, [trackpoints, reduxTolerance, dispatch, initialYSet]);

  const handleToleranceChange = (e) => {
    dispatch(setTolerance(parseFloat(e.target.value)));
  };

  const handleTensionChange = (e) => {
    dispatch(setTension(parseFloat(e.target.value)));
  };

  const handleMinYChange = (e) => {
    dispatch(setMinY(Number(e.target.value)));
  };

  const handleMaxYChange = (e) => {
    dispatch(setMaxY(Number(e.target.value)));
  };

  const toggleWaypoints = () => {
    setShowOnlyWaypoints(!showOnlyWaypoints);
  };

  const data = {
    labels: simplifiedData.map(point => (point.distanceFromStart / 1000).toFixed(1)),
    datasets: [{
      label: 'Elevation',
      data: simplifiedData.map(point => point.elevation),
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: reduxTension,
      pointRadius: simplifiedData.map(point => point.isWaypoint || !showOnlyWaypoints ? 3 : 0),
      // Adjust point radius based on waypoint status and toggle state
    }]
  };

  const labels = simplifiedData.map(point => (point.distanceFromStart / 1000).toFixed(1));
  const elevationData = simplifiedData.map(point => point.elevation);

  const options = {
    scales: {
      y: {
        min: reduxMinY,
        max: reduxMaxY,
      },
      x: {
        title: {
          display: true,
          text: 'Distance (kilometers)'
        }
      }
    },
  };

  return (
    <div>
      <h2>Height Profile</h2>
      <Line data={data} options={options} />
      <button onClick={toggleWaypoints}>
        {showOnlyWaypoints ? "Show All Points" : "Show Only Waypoints"}
      </button>
      <div>
        <label>Tolerance:</label>
        <input
          type="number"
          step="0.0000001"
          value={reduxTolerance}
          onChange={handleToleranceChange}
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
          onChange={handleTensionChange}
        />
      </div>
      <div>
        <label>Minimum Elevation (step of 50):</label>
        <input
          type="number"
          step="50"
          value={reduxMinY}
          onChange={handleMinYChange}
        />
      </div>
      <div>
        <label>Maximum Elevation (step of 50):</label>
        <input
          type="number"
          step="50"
          value={reduxMaxY}
          onChange={handleMaxYChange}
        />
      </div>
      <h3>Waypoints</h3>
      <ul>
        {waypoints.map((wp, index) => (
          <li key={index}>
            {wp.name}, Elevation: {wp.elevation}m, Distance: {(wp.distanceFromStart / 1000).toFixed(2)}km
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GPXViz;
