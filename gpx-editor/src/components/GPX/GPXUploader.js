import React, { useState } from 'react';
import styled from 'styled-components';
import { Upload, File } from 'react-feather';
import { parseStandardGPX, parseCustomGPX } from './GPXParser';

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px;
  font-family: 'Libre Franklin', sans-serif;
  background-color: #f4f4f9;
  border-radius: 8px;
  width: 400px;  /* Fixed width */
  margin: auto;
`;

const Header = styled.h2`
  font-size: 18px;
  color: #333;
  margin-bottom: 10px;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Input = styled.input`
  display: none;
`;

const Label = styled.label`
  background-color: #6c757d;
  color: #fff;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #5a6268;
  }
`;

const Button = styled.button`
  background-color: #28a745;
  color: #fff;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: #218838;
  }
`;

const Filename = styled.span`
  font-size: 14px;
  color: #333;
  margin-right: 10px;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center; /* Center text */
  flex: 1; /* Take available space */
`;

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
      const xmlDoc = new DOMParser().parseFromString(text, 'application/xml');
      let waypoints;

      // Check if the GPX file contains <extensions>
      const hasExtensions = xmlDoc.getElementsByTagName('extensions').length > 0;

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
    <Container>
      <Header>Upload GPX file</Header>
      <InputWrapper>
        <Label htmlFor="gpx-upload">
          <File size={16} style={{ marginRight: '5px' }} />
          Choose File
        </Label>
        <Input type="file" accept=".gpx" id="gpx-upload" onChange={handleFileChange} />
        <Filename>{selectedFile ? selectedFile.name : "No file selected"}</Filename>
        <Button onClick={handleUpload}>
          Upload
          <Upload size={16} style={{ marginLeft: '5px' }} />
        </Button>
      </InputWrapper>
    </Container>
  );
};

export default GPXUploader;