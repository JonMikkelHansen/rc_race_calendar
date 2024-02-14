import axios from 'axios';

// Example correction in api.js
const BASE_URL = process.env.REACT_APP_STRAPI_BASE_URL; // Ensure this matches your .env file

export const fetchRaces = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/races`);
    // Map over the data array to transform it into a simpler array of objects
    return response.data.data.map(item => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch (error) {
    console.error("Failed to fetch races:", error);
    throw error;
  }
};

