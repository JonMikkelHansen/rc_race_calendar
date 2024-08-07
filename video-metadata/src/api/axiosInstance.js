// src/api/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://cdn.jwplayer.com/v2', // Direct endpoint
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;