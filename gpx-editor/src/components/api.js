import axios from 'axios';

const BASE_URL = process.env.REACT_APP_STRAPI_BASE_URL;

// Fetch races filtered by season
export const fetchRaces = async (season) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/races?filters[season]=${season}&pagination[pageSize]=100`);
    return response.data.data.map(item => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch (error) {
    console.error("Failed to fetch races:", error);
    throw error;
  }
};

// Fetch all races to extract seasons
export const fetchRacesForSeasons = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/races?pagination[pageSize]=1000`); // Adjust as necessary
    return response.data.data.map(item => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch (error) {
    console.error("Failed to fetch races for seasons extraction:", error);
    throw error;
  }
};
