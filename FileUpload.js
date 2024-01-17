// FileUpload.js
import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      if (!selectedFile) {
        alert('Please select a GPX file first.');
        return;
      }

      const formData = new FormData();
      formData.append('files', selectedFile);

      // Replace with your Strapi backend URL
      const strapiUrl = 'http://localhost:1337';

      // Make a POST request to upload the GPX file
      await axios.post(`${strapiUrl}/upload`, formData);

      // Handle success or display a message to the user
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <input type="file" accept=".gpx" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload GPX</button>
    </div>
  );
};

export default FileUpload;
