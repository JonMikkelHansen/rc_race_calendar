import axios from 'axios';

const BASE_URL = process.env.REACT_APP_STRAPI_BASE_URL || 'http://localhost:1337';

// Create an axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 5000, // 5 second timeout
});

// Maximum number of retries
const MAX_RETRIES = 2;

// Races API functions
export const fetchRaces = async (season, retryCount = 0) => {
  try {
    const params = {
      'filters[season]': season,
      'pagination[pageSize]': 100,
      'populate[stages][sort]': ['stage_number:asc'],
      'populate': '*'
    };
    
    const response = await api.get('/api/races', { params });
    
    if (!response.data.data) {
      console.error('Unexpected response structure:', response.data);
      throw new Error('Invalid response structure from API');
    }
    
    const processedRaces = response.data.data.map(item => {
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
    
    const validRaces = processedRaces.filter(race => race !== null);
    return validRaces;
  } catch (error) {
    console.error("Failed to fetch races:", error);
    throw error;
  }
};

// Stages API functions
export const fetchStages = async (raceId, retryCount = 0) => {
  try {
    console.log(`Fetching stages for race ${raceId}, attempt ${retryCount + 1}`);
    const response = await api.get('/api/stages', {
      params: {
        'filters[race][id][$eq]': raceId,
        'sort': 'stage_number:asc',
        'populate': ['stage_title', 'stage_number', 'stage_date', 'stage_start', 'stage_finish']
      }
    });
    
    console.log('Stages response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(`Attempt ${retryCount + 1} failed:`, error);
    
    if (retryCount < MAX_RETRIES && (
        error.code === 'ECONNABORTED' || 
        error.code === 'ERR_NETWORK' || 
        !error.response || 
        error.response.status >= 500)) {
      console.log(`Retrying... Attempt ${retryCount + 2}`);
      // Wait for (retryCount + 1) * 1000 milliseconds before retrying
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
      return fetchStages(raceId, retryCount + 1);
    }
    
    throw error;
  }
};

// Export the api instance
export default api;