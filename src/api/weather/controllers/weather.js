const axios = require('axios');

module.exports = {
  async findOne(ctx) {
    try {
      const { lat, lon, timestamp } = ctx.query;

      // Convert human-readable timestamp to UNIX time
      const date = new Date(timestamp);
      const unixTimestamp = Math.floor(date.getTime() / 1000);

      const apiKey = process.env.OPENWEATHER_API_KEY;
      const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${unixTimestamp}&appid=${apiKey}&units=metric`;

      const response = await axios.get(url);
      ctx.body = response.data;
    } catch (error) {
      console.error(error);
      ctx.body = { message: error.message };
      ctx.status = error.response?.status || 500;
    }
  },
};
