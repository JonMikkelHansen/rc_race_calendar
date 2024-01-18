import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { useSelector, useDispatch } from 'react-redux';
import { setTolerance, setMinY, setMaxY } from '../redux/actions/GPXActions'; // Make sure setMaxY is imported
import { douglasPeucker } from '../Utilities';

const GPXViz = ({ gpxData }) => {
  const dispatch = useDispatch();
  const reduxTolerance = useSelector(state => state.tolerance);
  const reduxMinY = useSelector(state => state.minY);
  const reduxMaxY = useSelector(state => state.maxY); // Y-max state
  const [simplifiedData, setSimplifiedData] = useState([]);
  const [initialYSet, setInitialYSet] = useState(false);

  useEffect(() => {
    if (!gpxData.tracks?.[0].segments?.[0] || initialYSet) {
      return;
    }

    const originalTrackPoints = gpxData.tracks[0].segments[0];
    const simplifiedTrackPoints = douglasPeucker(originalTrackPoints, reduxTolerance);
    setSimplifiedData(simplifiedTrackPoints);

    // Set initial minY and maxY values
    const elevations = originalTrackPoints.map(p => p.elevation);
    const lowestElevation = Math.floor(Math.min(...elevations) / 100) * 100;
    const highestElevation = Math.ceil(Math.max(...elevations) / 100) * 100;
    dispatch(setMinY(lowestElevation));
    dispatch(setMaxY(highestElevation));
    setInitialYSet(true);
  }, [gpxData, reduxTolerance, dispatch, initialYSet]);

  // Tolerance change handler
  const handleToleranceChange = (e) => {
    dispatch(setTolerance(parseFloat(e.target.value)));
  };

  // MinY change handler
  const handleMinYChange = (e) => {
    dispatch(setMinY(Number(e.target.value)));
  };

  // MaxY change handler
  const handleMaxYChange = (e) => {
    dispatch(setMaxY(Number(e.target.value)));
  };

  const labels = simplifiedData.map((_, index) => index);
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
        max: reduxMaxY, // Set the maximum value of the Y-axis
      },
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
    </div>
  );
};

export default GPXViz;
