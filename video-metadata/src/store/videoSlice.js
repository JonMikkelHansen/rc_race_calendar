// src/store/videoSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';

export const fetchVideo = createAsyncThunk('video/fetchVideo', async (videoId) => {
  const response = await axiosInstance.get(`/media/${videoId}`);
  return response.data;
});

const videoSlice = createSlice({
  name: 'video',
  initialState: {
    item: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideo.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVideo.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.item = action.payload;
      })
      .addCase(fetchVideo.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default videoSlice.reducer;