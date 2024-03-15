import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/common/Header';
import Tabs from './components/common/Tabs'; // Note: We'll modify Tabs.js to include the tabs functionality
import RaceList from './components/RaceList';
import GPXUploader from './components/GPX/GPXUploader';
import GPXViz from './components/GPX/GPXViz';
import WaypointEditor from './components/GPX/WaypointEditor';
import SegmentEditor from './components/GPX/SegmentEditor';
import GPXSave from './components/GPXSave';

function App() {
  const [gpxData, setGpxData] = useState(null);
  const [activeTab, setActiveTab] = useState('GPX'); // Added state to manage active tab

  const handleGPXData = (data) => {
    setGpxData(data);
  };

  return (
    <Router>
      <div className="App">
        <Header />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'Race' && <RaceList />}
        {activeTab === 'GPX' && (
          <>
            <GPXUploader onGPXData={handleGPXData} />
            {gpxData && (
              <>
                <GPXViz gpxData={gpxData} />
                <WaypointEditor gpxData={gpxData} onEdit={handleGPXData} />
                <SegmentEditor gpxData={gpxData} onEdit={handleGPXData} />
                <GPXSave /> {/* GPX Save component */}
              </>
            )}
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
