import React, { useState } from 'react';
import GPXUploader from './GPXUploader';
import GPXViz from './GPXViz';
import WaypointEditor from './WaypointEditor';
import GPXSave from './GPXSave'; // Import GPXSave component

function App() {
  const [gpxData, setGpxData] = useState(null);

  const handleGPXData = (data) => {
    setGpxData(data);
  };

  return (
    <div className="App">
      <h1>GPX Data Manager</h1>
      <GPXUploader onGPXData={handleGPXData} />
      {gpxData && (
        <>
          <GPXViz gpxData={gpxData} />
          <WaypointEditor gpxData={gpxData} onEdit={handleGPXData} />
          <GPXSave /> {/* Add Save GPX component here */}
        </>
      )}
    </div>
  );
}

export default App;
