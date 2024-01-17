import React from 'react';
import axios from 'axios';

const GPXSave = ({ gpxData }) => {
  const handleSave = async () => {
    try {
      // Convert gpxData to a format suitable for saving (if necessary)
      // Make an API call to save the data in Strapi
      const response = await axios.post('http://localhost:1337/api/gpx', gpxData);
      console.log('Save successful:', response);
      // Additional logic based on the response
    } catch (error) {
      console.error('Error saving GPX data:', error);
      // Error handling logic
    }
  };

  return (
    <div>
      <button onClick={handleSave}>Save GPX</button>
    </div>
  );
};

export default GPXSave;
