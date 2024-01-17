import React from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const GPXViz = ({ gpxData }) => {
  if (!gpxData || !gpxData.tracks || !gpxData.tracks[0].segments || !gpxData.tracks[0].segments[0]) {
    return <div>No track data available.</div>;
  }

  const trackPoints = gpxData.tracks[0].segments[0];
  const labels = trackPoints.map((_, index) => index); // Index as placeholder labels
  const elevationData = trackPoints.map(point => point.elevation);

  const data = {
    labels: labels,
    datasets: [{
      label: 'Elevation',
      data: elevationData,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  return (
    <div>
      <h2>Height Profile</h2>
      <Line data={data} />
    </div>
  );
};

export default GPXViz;
