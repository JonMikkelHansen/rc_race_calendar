import React, { useState } from 'react';
import { parseStandardGPX, parseCustomGPX } from './GPXParser';

const GPXUploader = ({ onGPXData }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a GPX file first.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const xmlDoc = new DOMParser().parseFromString(text, "application/xml");
      let waypoints;
    
      // Check if the GPX file contains <extensions>
      const hasExtensions = xmlDoc.getElementsByTagName("extensions").length > 0;
    
      if (hasExtensions) {
        waypoints = parseCustomGPX(xmlDoc); // For GPX files with extensions
      } else {
        waypoints = parseStandardGPX(xmlDoc); // For standard GPX files
      }
    
      onGPXData(waypoints);
    };
    reader.readAsText(selectedFile);
  };

  return (
    <div>
      <input type="file" accept=".gpx" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload GPX</button>
    </div>
  );
};

export default GPXUploader;
