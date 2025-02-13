import axios from 'axios';

const BASE_URL = process.env.REACT_APP_STRAPI_BASE_URL || 'http://localhost:1337';

export const fetchRaces = async (season) => {
  try {
    console.log('Making request to:', `${BASE_URL}/api/races`);
    const params = {
      'filters[season]': season,
      'pagination[pageSize]': 100,
      'populate': '*',  // Change this to populate all relations
    };
    
    console.log('With params:', params);
    
    const response = await axios.get(`${BASE_URL}/api/races`, { params });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Raw response:', response.data);
    
    if (!response.data.data) {
      console.error('Unexpected response structure:', response.data);
      throw new Error('Invalid response structure from API');
    }
    
    const processedRaces = response.data.data.map(item => {
      console.log('Processing race:', item); // Debug log
      if (!item.attributes) {
        console.error('Race item missing attributes:', item);
        return null;
      }
      return {
        id: item.id,
        ...item.attributes,
        stages: item.attributes.stages?.data?.map(stage => ({
          id: stage.id,
          ...stage.attributes
        })) || []
      };
    });
    
    // Filter out any null values from malformed items
    const validRaces = processedRaces.filter(race => race !== null);
    
    console.log('Processed races:', validRaces);
    return validRaces;
  } catch (error) {
    console.error("Failed to fetch races:", error);
    console.error("Error details:", error.response?.data || error.message);
    if (error.response) {
      console.error("Status code:", error.response.status);
      console.error("Headers:", error.response.headers);
    }
    throw error;
  }
};