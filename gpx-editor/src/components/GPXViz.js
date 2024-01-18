import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { douglasPeucker } from '../Utilities'; // Import the douglasPeucker function from Utilities.js

const GPXViz = ({ gpxData }) => {
  const [fullData, setFullData] = useState([]);
  const [simplifiedData, setSimplifiedData] = useState([]);
  const [tolerance, setTolerance] = useState('0.00000067'); // Initial tolerance value as a string

  useEffect(() => {
    if (!gpxData || !gpxData.tracks || !gpxData.tracks[0].segments || !gpxData.tracks[0].segments[0]) {
      return;
    }

    const trackPoints = gpxData.tracks[0].segments[0];

    // Perform Douglas-Peucker simplification on the track points
    const simplifiedTrackPoints = douglasPeucker(trackPoints, Number(tolerance));

    // Set full and simplified data
    setFullData(trackPoints);
    setSimplifiedData(simplifiedTrackPoints);
  }, [gpxData, tolerance]);

  console.log('Number of full data points:', fullData.length);
  console.log('Number of simplified data points:', simplifiedData.length);

  const labels = simplifiedData.map((_, index) => index); // Index as placeholder labels
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

  return (
    <div>
      <h2>Height Profile</h2>
      <Line data={data} />
      <label>Tolerance:</label>
      <input
        type="number"
        step="0.0000001"
        value={tolerance}
        onChange={(e) => setTolerance(e.target.value)}
      />
    </div>
  );
};

export default GPXViz;
