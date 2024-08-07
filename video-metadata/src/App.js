// src/App.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideo } from './store/videoSlice';
import VideoPlayer from './components/videoPlayer';
import './App.css';

const App = () => {
  const [videoId, setVideoId] = useState('');
  const dispatch = useDispatch();
  const video = useSelector((state) => state.video.item);
  const videoStatus = useSelector((state) => state.video.status);
  const error = useSelector((state) => state.video.error);

  const handleFetchVideo = () => {
    if (videoId) {
      dispatch(fetchVideo(videoId));
    }
  };

  const getVideoUrl = (video) => {
    if (video && video.playlist && video.playlist.length > 0) {
      const sources = video.playlist[0].sources;
      const mp4Source = sources.find(source => source.type === 'video/mp4' && source.label === '1080p');
      return mp4Source ? mp4Source.file : null;
    }
    return null;
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
      {videoStatus === 'succeeded' && video && (
        <div>
          <h3>{video.title}</h3>
          <VideoPlayer videoUrl={getVideoUrl(video)} />
        </div>
      )}
    </div>
  );
};

export default App;