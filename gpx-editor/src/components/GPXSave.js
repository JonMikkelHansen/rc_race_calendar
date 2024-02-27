import React from 'react';
import { useSelector } from 'react-redux';

const GPXSave = () => {
  const stageTitle = useSelector(state => state.stageTitle);
  const trackpoints = useSelector(state => state.trackpoints);
  const waypoints = useSelector(state => state.waypoints);
  const segments = useSelector(state => state.segments);

  const handleSave = () => {
    try {
      if (!trackpoints || trackpoints.length === 0) {
        throw new Error('No trackpoints available to save.');
      }
      const xmlString = generateGPXString(trackpoints, waypoints, stageTitle);
      downloadGPX(xmlString);
    } catch (error) {
      console.error('Error saving GPX data:', error);
      // Error handling logic
    }
  };

  const generateGPXString = (trackpoints, waypoints, stageTitle) => {
    // Generate GPX XML string using the trackpoints and waypoints
    let gpxXML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<gpx creator="Road Code Race Centre - https://www.roadcode.cc"
     xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
     xmlns="http://www.topografix.com/GPX/1/1"
     xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
    <metadata>
        <name>${stageTitle}</name>
        <desc></desc>
        <author>
            <name>Road Code Race Centre</name>
        </author>
        <bounds minlat="43.04877" maxlat="43.38282" minlon="11.21950" maxlon="11.61873"/>
    </metadata>`;

    // Add waypoints
    waypoints.forEach((waypoint) => {
      gpxXML += `
    <wpt lat="${waypoint.latitude}" lon="${waypoint.longitude}">
        <name>${waypoint.name}</name>
        <desc>${waypoint.description || ''}</desc>
        <ele>${waypoint.elevation || 0}</ele>
    </wpt>`;
    });
    
    gpxXML += `
    <trk>
        <src>Edited and refined by the good people at Road Code - based on original data from race vendor</src>
        <name>${stageTitle}</name>
        <trkseg>`;
      
    // Modify trackpoints to include segment information
    trackpoints.forEach((trackpoint, index) => {
      const segmentIds = segments.filter(segment => 
          segment.trackpointIndices.includes(index)).map(segment => segment.id);

      gpxXML += `<trkpt lat="${trackpoint.latitude}" lon="${trackpoint.longitude}">\n`;
      gpxXML += `   <ele>${trackpoint.elevation || 0}</ele>\n`;           
              // If the trackpoint belongs to any segment, include that information
              if (segmentIds.length > 0) {
                  gpxXML += `   <extensions>\n`;
                  gpxXML += `      <roadcode:segments>${segmentIds.join(',')}</roadcode:segments>\n`;
                  gpxXML += `   </extensions>\n`;
              }
      gpxXML += `</trkpt>\n`;
  });
    
    gpxXML += `
        </trkseg>
    </trk>
</gpx>`;
      
    return gpxXML;
  };

  const downloadGPX = (xmlString) => {
    const blob = new Blob([xmlString], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'trackpoints.gpx';
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div>
      <button onClick={handleSave}>Save GPX</button>
    </div>
  );
};

export default GPXSave;
