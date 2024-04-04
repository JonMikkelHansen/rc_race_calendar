'use strict';

const axios = require('axios');
const moment = require('moment'); // You might need to install moment (npm install moment)

module.exports = {
  async findOne(ctx) {
    const { lat, lon, dt } = ctx.query; // Assume dt is a Unix timestamp
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    // Convert the current date and the input date to start of day for comparison
    const currentDate = moment().startOf('day');
    const inputDate = moment.unix(dt).startOf('day');
    
    let url;

    // Check if the input date is within the next 7 days (for forecast)
    if (inputDate.isBetween(currentDate, moment().add(7, 'days'), null, '[]')) {
      url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      // Forecast API call (OpenWeatherMap doesn't allow specifying a day for future forecasts in the free tier,
      // you'll need to filter the desired day client-side from the daily array in the response)
    } else if (inputDate.isBefore(currentDate)) {
      // Historical data might require a different API or a premium OpenWeatherMap account
      ctx.body = { error: "Historical data fetching requires a premium account" };
      return;
    } else {
      ctx.body = { error: "Can only fetch weather up to 7 days in advance" };
      return;
    }

    try {
      const response = await axios.get(url);
      // If fetching forecast data, filter for the specific date here before sending response
      ctx.body = response.data;
    } catch (error) {
      console.error('Failed to fetch weather data', error);
      ctx.body = { message: 'Failed to fetch weather data', error };
      ctx.status = 500;
    }
  },
};
