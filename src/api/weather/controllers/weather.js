const axios = require('axios');

module.exports = {
  async findOne(ctx) {
    try {
      const { lat, lon, timestamp } = ctx.query;

      // Convert human-readable timestamp to UNIX time
      const date = new Date(timestamp);
      const unixTimestamp = Math.floor(date.getTime() / 1000);

      // API key from environment variables
      const apiKey = process.env.OPENWEATHER_API_KEY;

      // Constructing the URL based on the documentation format
      const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${unixTimestamp}&appid=${apiKey}&units=metric`;

      // Making the API call
      const response = await axios.get(url);
      ctx.body = response.data;
    } catch (error) {
      console.error('API call failed:', error.message);
      ctx.body = { message: 'Failed to retrieve weather data', details: error.message };
      ctx.status = error.response ? error.response.status : 500;
    }
  },
};