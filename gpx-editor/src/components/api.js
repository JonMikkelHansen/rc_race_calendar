import axios from 'axios';

const BASE_URL = process.env.REACT_APP_STRAPI_BASE_URL;

// Fetch races filtered by season, without breaking existing functionality
export const fetchRaces = async (season) => {
  try {
    // Adjust to use params object for clarity and maintainability
    const response = await axios.get(`${BASE_URL}/api/races`, {
      params: {
        'filters[season]': season,
        'pagination[pageSize]': 100,
        'populate': 'stages', // Populate stages but not GPX by default to avoid breaking changes
      }
    });
    // Process and return races with nested stages (GPX files not populated by default to keep the original functionality)
    return response.data.data.map(item => ({
      id: item.id,
      ...item.attributes,
      stages: item.attributes.stages?.data.map(stage => ({
        id: stage.id,
        ...stage.attributes,
        // GPX population can be optionally added here if needed for specific views
      })) || [],
    }));
  } catch (error) {
    console.error("Failed to fetch races:", error);
    throw error;
  }
};

// Fetch all races to extract seasons, no change needed here as it doesn't require stages or GPX
export const fetchRacesForSeasons = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/races?pagination[pageSize]=1000`); // No change in this call
    return response.data.data.map(item => ({
      id: item.id,
      ...item.attributes,
    }));
  } catch (error) {
    console.error("Failed to fetch races for seasons extraction:", error);
    throw error;
  }
};



