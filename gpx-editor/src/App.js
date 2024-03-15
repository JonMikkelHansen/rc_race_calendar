import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/common/Header';
import RaceList from './components/RaceList';
import GPXUploader from './components/GPX/GPXUploader';
import GPXViz from './components/GPX/GPXViz';
import WaypointEditor from './components/GPX/WaypointEditor';
import SegmentEditor from './components/GPX/SegmentEditor';
import GPXSave from './components/GPXSave'; // Import GPXSave component

function App() {
  const [gpxData, setGpxData] = useState(null);

  const handleGPXData = (data) => {
    setGpxData(data);
  };

  return (
    <Router>
      <div className="App">
        <Header />
        {/*<RaceList /> */}
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
    </Router>

  );
}

export default App;
