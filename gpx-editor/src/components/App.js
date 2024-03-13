import React, { useState } from 'react';
import RaceList from './RaceList';
import GPXUploader from './GPXUploader';
import GPXViz from './GPXViz';
import WaypointEditor from './WaypointEditor';
import SegmentEditor from './SegmentEditor';
import GPXSave from './GPXSave'; // Import GPXSave component

function App() {
  const [gpxData, setGpxData] = useState(null);

  const handleGPXData = (data) => {
    setGpxData(data);
  };

  return (
    <div className="App">
      <RaceList />
      <h2>Road Code GPX Editor</h2>
      <GPXUploader onGPXData={handleGPXData} />
      {gpxData && (
        <>
          <GPXViz gpxData={gpxData} />
          <WaypointEditor gpxData={gpxData} onEdit={handleGPXData} />
          <SegmentEditor gpxData={gpxData} onEdit={handleGPXData} />
          <GPXSave /> {/* Add Save GPX component here */}
        </>
      )}
    </div>
  );
}

export default App;
