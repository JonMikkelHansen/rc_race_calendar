import React from 'react';
import { useSelector } from 'react-redux';

const GPXSave = () => {
  const stageTitle = useSelector(state => state.stageTitle);
  const trackpoints = useSelector(state => state.trackpoints);
  const waypoints = useSelector(state => state.waypoints);
  const segments = useSelector(state => state.segments);

  /* *********************
    HANDLE SAVE FUNCTIONS
  ********************* */
  const handleSaveGPX = () => {
    try {
      if (!trackpoints || trackpoints.length === 0) {
        throw new Error('No trackpoints available to save.');
      }
      const xmlString = generateGPXString(trackpoints, waypoints, stageTitle);
      downloadFile(xmlString, 'trackpoints.gpx', 'application/gpx+xml');
    } catch (error) {
      console.error('Error saving GPX data:', error);
      // Error handling logic
    }
  };

  const handleSaveGeoJSONTrackpoints = () => {
    const geoJsonString = generateGeoJSONString(trackpoints, null, stageTitle);
    downloadFile(geoJsonString, 'trackpoints.geojson', 'application/geo+json');
  };

  const handleSaveGeoJSONWaypoints = () => {
    const geoJsonString = generateGeoJSONString(null, waypoints, stageTitle);
    downloadFile(geoJsonString, 'waypoints.geojson', 'application/geo+json');
  };

  const handleSaveGeoJSONCombined = () => {
    const geoJsonString = generateGeoJSONString(trackpoints, waypoints, stageTitle);
    downloadFile(geoJsonString, 'combined.geojson', 'application/geo+json');
  };


  /* ********************* 
    GENERATE THE STRINGS
  ********************* */
  
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

  const generateGeoJSONString = (trackpoints, waypoints, stageTitle) => {
    let features = [];

    if (trackpoints && trackpoints.length > 0) {
      const trackFeature = {
        "type": "Feature",
        "properties": { 
          "name": stageTitle, 
          "desc": "Trackpoints" 
        },
        "geometry": {
          "type": "LineString",
          "coordinates": trackpoints.map(tp => [
            tp.lon, 
            tp.lat,
            tp.elevation // Including elevation as the third element in the coordinate array
          ])
        }
      };
      features.push(trackFeature);
    }

    if (waypoints && waypoints.length > 0) {
      waypoints.forEach((waypoint, index) => {
        const waypointFeature = {
          "type": "Feature",
          "properties": {
            "name": waypoint.name,
            "desc": waypoint.description || '',
            "ele": waypoint.elevation || 0,
            "distanceFromStart": waypoint.distanceFromStart || 0
          },
          "geometry": {
            "type": "Point",
            "coordinates": [waypoint.lon, waypoint.lat]
          }
        };
        features.push(waypointFeature);
      });
    }

    const geoJson = {
      "type": "FeatureCollection",
      "features": features
    };

    return JSON.stringify(geoJson, null, 2); // Pretty print JSON
  };

  /* *********************
    DOWNLOAD FUNCTIONS 
  ********************* */

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  /* *********************
    RENDER COMPONENT
  ********************* */

  return (
    <div>
      <h2>GPX Data</h2>
      <button onClick={handleSaveGPX}>Save GPX</button>  
      <h2>GeoJSON Data</h2>
      <button onClick={handleSaveGeoJSONTrackpoints}>Save GeoJSON - Trackpoints</button>
      <button onClick={handleSaveGeoJSONWaypoints}>Save GeoJSON - Waypoints</button>
      <button onClick={handleSaveGeoJSONCombined}>Save GeoJSON - Combined</button>
    </div>
  );
};

export default GPXSave;
