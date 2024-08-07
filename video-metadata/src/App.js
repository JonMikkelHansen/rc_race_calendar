// src/App.js
import React, { useState } from 'react';
import VideoPlayer from './components/VideoPlayer';
import './App.css';

const App = () => {
  const [videoId, setVideoId] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoStatus, setVideoStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handleFetchVideo = () => {
    if (videoId) {
      setVideoStatus('loading');
      fetch(`https://cdn.jwplayer.com/v2/media/${videoId}`)
        .then(response => response.json())
        .then(data => {
          if (data.playlist && data.playlist.length > 0) {
            const sources = data.playlist[0].sources;
            const mp4Source = sources.find(source => source.type === 'video/mp4' && source.label === '1080p');
            const videoUrl = mp4Source ? mp4Source.file : sources[0].file;
            setVideoUrl(videoUrl);
            setVideoTitle(data.playlist[0].title);
            setVideoStatus('succeeded');
          } else {
            setError('Video sources not found');
            setVideoStatus('failed');
          }
        })
        .catch(error => {
          setError('Error fetching video metadata: ' + error.message);
          setVideoStatus('failed');
        });
    }
  };

  return (
    <div className="App">
      <h1>Video Player App</h1>
      <input
        type="text"
        placeholder="Enter video ID"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />
      <button onClick={handleFetchVideo}>Fetch Video</button>
      {videoStatus === 'loading' && <div>Loading...</div>}
      {videoStatus === 'failed' && <div>Error: {error}</div>}
      {videoStatus === 'succeeded' && videoUrl && (
        <div>
          <h3>{videoTitle}</h3>
          <VideoPlayer videoUrl={videoUrl} />
        </div>
      )}
    </div>
  );
};

export default App;