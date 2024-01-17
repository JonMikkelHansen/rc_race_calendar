import React from 'react';

const GPXViz = ({ gpxData }) => {
  if (!gpxData) {
    return <div>Loading or no data available...</div>;
  }

  // Placeholder content, replace with actual visualization later
  return (
    <div>
      <h2>GPX Visualization</h2>
      <p>Data is loaded, but visualization is not yet implemented.</p>
    </div>
  );
};

export default GPXViz;
