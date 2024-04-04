// Path: src/api/weather/controllers/weather.js

'use strict';

const axios = require('axios');

module.exports = {
  async findOne(ctx) {
    const { lat, lon, timestamp } = ctx.query;
    const apiKey = process.env.OPENWEATHER_API_KEY; // Ensure this is set in your environment variables
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
      const response = await axios.get(url);
      ctx.body = response.data;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      ctx.body = { message: 'Failed to fetch weather data', error: error.message };
      ctx.status = 500;
    }
  },
};
