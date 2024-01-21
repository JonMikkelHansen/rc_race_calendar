import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useSelector, useDispatch } from 'react-redux';
import { setTolerance, setMinY, setMaxY } from '../redux/actions/GPXActions';
import { douglasPeucker, calculateHaversineDistance } from '../Utilities';

const GPXViz = ({ gpxData }) => {
  const dispatch = useDispatch();
  const reduxTolerance = useSelector(state => state.tolerance);
  const reduxMinY = useSelector(state => state.minY);
  const reduxMaxY = useSelector(state => state.maxY);
  const [simplifiedData, setSimplifiedData] = useState([]);
  const [waypoints, setWaypoints] = useState([]);
  const [initialYSet, setInitialYSet] = useState(false);

  useEffect(() => {
    if (gpxData.tracks) {
      let allTrackPoints = [];
      let elevations = [];
      let totalDistance = 0; // in meters initially

      gpxData.tracks.forEach(track => {
        track.segments.forEach(segment => {
          let lastLat = null;
          let lastLon = null;

          const simplifiedSegment = douglasPeucker(segment, reduxTolerance).map(point => {
            if (lastLat !== null && lastLon !== null) {
              totalDistance += calculateHaversineDistance(lastLat, lastLon, point.latitude, point.longitude);
            }

            lastLat = point.latitude;
            lastLon = point.longitude;

            return { 
              ...point, 
              distanceFromStart: totalDistance / 1000 // Convert to kilometers
            };
          });

          allTrackPoints.push(...simplifiedSegment);
          elevations.push(...simplifiedSegment.map(p => p.elevation));
        });
      });

      setSimplifiedData(allTrackPoints);

      if (!initialYSet && elevations.length > 0) {
        const lowestElevation = Math.floor(Math.min(...elevations) / 100) * 100;
        const highestElevation = Math.ceil(Math.max(...elevations) / 100) * 100;
        dispatch(setMinY(lowestElevation));
        dispatch(setMaxY(highestElevation));
        setInitialYSet(true);
      }
    }

    // Parsing and filtering waypoints
    if (gpxData.waypoints) {
      let totalDistance = 0;
      let lastLat = null;
      let lastLon = null;

      const filteredWaypoints = gpxData.waypoints.filter(wp => !wp.name.startsWith("KM"));
      const waypointsWithDistance = filteredWaypoints.map(wp => {
        if (lastLat !== null && lastLon !== null) {
          totalDistance += calculateHaversineDistance(lastLat, lastLon, wp.latitude, wp.longitude);
        }

        lastLat = wp.latitude;
        lastLon = wp.longitude;

        return {
          ...wp,
          distanceFromStart: totalDistance / 1000 // Convert to kilometers
        };
      });

      setWaypoints(waypointsWithDistance);
    }
  }, [gpxData, reduxTolerance, dispatch, initialYSet]);

  const handleToleranceChange = (e) => {
    dispatch(setTolerance(parseFloat(e.target.value)));
  };

  const handleMinYChange = (e) => {
    dispatch(setMinY(Number(e.target.value)));
  };

  const handleMaxYChange = (e) => {
    dispatch(setMaxY(Number(e.target.value)));
  };

  const labels = simplifiedData.map(point => point.distanceFromStart.toFixed(2));
  const elevationData = simplifiedData.map(point => point.elevation);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Elevation',
      data: elevationData,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.9,
    }]
  };

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
            Name: {wp.name}, Elevation: {wp.elevation}m, Distance: {wp.distanceFromStart.toFixed(2)}km
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GPXViz;
