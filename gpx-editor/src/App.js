import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/common/Header';
import Tabs from './components/common/Tabs';
import RaceList from './components/RaceList';
import GPXUploader from './components/GPX/GPXUploader';
import GPXViz from './components/GPX/GPXViz';
import WaypointEditor from './components/GPX/WaypointEditor';
import SegmentEditor from './components/GPX/SegmentEditor';
import GPXSave from './components/GPXSave';

function App() {
  const [gpxData, setGpxData] = useState(null);
  const [activeTab, setActiveTab] = useState('GPX'); // 'GPX' tab is active by default

  const handleGPXData = (data) => {
    setGpxData(data);
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div style={{ display: activeTab === 'Race' ? 'block' : 'none' }}>
          <RaceList /> 
        </div>
        <div style={{ display: activeTab === 'GPX' ? 'block' : 'none' }}>
          <GPXUploader onGPXData={handleGPXData} />
          {gpxData && (
            <>
              <GPXViz gpxData={gpxData} />
            </>
          )}
        </div>
        <div style={{ display: activeTab === 'Save' ? 'block' : 'none' }}>
          <GPXSave />
        </div>
      </div>
    </Router>
  );
}

export default App;
