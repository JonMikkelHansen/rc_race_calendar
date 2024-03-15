// Actions for fetching an selecting races and stages
import { fetchRaces, fetchRacesForSeasons } from '../../components/api';
import { v4 as uuidv4 } from 'uuid';
import { interpolateTrackpointData } from '../../Utilities'; // Adjust the path as necessary

export const FETCH_RACES_SUCCESS = 'FETCH_RACES_SUCCESS';
export const SET_SEASONS = 'SET_SEASONS'; // New action type for setting seasons
export const SELECT_RACE = 'SELECT_RACE';
export const SELECT_STAGE = 'SELECT_STAGE';

// Existing action types and creators

export const SET_TOLERANCE = 'SET_TOLERANCE';
export const setTolerance = (tolerance) => ({
  type: SET_TOLERANCE,
  payload: tolerance,
});

export const SET_TENSION = 'SET_TENSION';
export const setTension = (tension) => ({
  type: SET_TENSION,
  payload: tension,
});

export const SET_MINY = 'SET_MINY';
export const setMinY = (minY) => ({
  type: SET_MINY,
  payload: minY,
});

export const SET_MAXY = 'SET_MAXY';
export const setMaxY = (maxY) => ({
  type: SET_MAXY,
  payload: maxY,
});

export const SET_TRACKPOINTS = 'SET_TRACKPOINTS';
export const setTrackpoints = (trackpoints) => ({
  type: SET_TRACKPOINTS,
  payload: trackpoints,
});

export const SET_WAYPOINTS = 'SET_WAYPOINTS';
export const setWaypoints = (waypoints) => ({
  type: SET_WAYPOINTS,
  payload: waypoints,
});

export const ADD_WAYPOINT = 'ADD_WAYPOINT';
export const addWaypoint = (waypoint) => ({
  type: ADD_WAYPOINT,
  payload: { ...waypoint, id: uuidv4() }, // Generate a unique ID for the waypoint
});

export const DELETE_WAYPOINT = 'DELETE_WAYPOINT';
export const deleteWaypoint = (waypointId) => ({
  type: DELETE_WAYPOINT,
  payload: waypointId,
});

export const UPDATE_WAYPOINT = 'UPDATE_WAYPOINT';
export const updateWaypoint = (waypoint) => {
  return (dispatch, getState) => {
    const { trackpoints } = getState();
    const interpolatedData = interpolateTrackpointData(waypoint.distanceFromStart, trackpoints);
    
    // Update the waypoint with interpolated data
    const updatedWaypoint = {
      ...waypoint,
      lat: interpolatedData.lat,
      lon: interpolatedData.lon,
      elevation: interpolatedData.elevation,
    };
    
    dispatch({
      type: UPDATE_WAYPOINT,
      payload: updatedWaypoint,
    });
    
    // Find and update the corresponding trackpoint
    const trackpointIndex = trackpoints.findIndex(tp => tp.waypointID === waypoint.id);
    if (trackpointIndex !== -1) {
      const updatedTrackpoint = {
        ...trackpoints[trackpointIndex],
        latitude: interpolatedData.lat,
        longitude: interpolatedData.lon,
        elevation: interpolatedData.elevation,
        distanceFromStart: waypoint.distanceFromStart,
      };
      
      // Update the trackpoint in the Redux store
      const newTrackpoints = [...trackpoints];
      newTrackpoints[trackpointIndex] = updatedTrackpoint;
      dispatch(setTrackpoints(newTrackpoints));
    }
  };
};


export const ADD_TRACKPOINT = 'ADD_TRACKPOINT';


export const addWaypointAndTrackpoint = (waypointData) => {
  return (dispatch, getState) => {
    const { trackpoints } = getState();
    const newWaypointID = uuidv4(); // Generate a unique ID for the new waypoint
    const firstTrackpoint = trackpoints[0] || { lat: 0, lon: 0, elevation: 0 };
    
    // Create a new waypoint at the position of the first trackpoint
    const newWaypoint = {
      ...waypointData,
      id: newWaypointID, // Use the same ID for waypoint
    };
    
    dispatch({
      type: ADD_WAYPOINT,
      payload: newWaypoint,
    });
    
    // Optionally, add a corresponding trackpoint if it doesn't exist
    const newTrackpoint = {
      ...waypointData,
      id: uuidv4(), // Assign a new ID to ensure uniqueness
      waypointID: newWaypointID, // Link to the new waypoint
      isWaypoint: true,
    };
    
    dispatch({
      type: ADD_TRACKPOINT,
      payload: newTrackpoint,
    });
  };
};

export const ADD_SEGMENT = 'ADD_SEGMENT';
export const addSegment = ({ name, startDistance, endDistance }) => {
  return (dispatch, getState) => {
    const { trackpoints } = getState(); // Assuming you have access to trackpoints here
    const trackpointIndices = trackpoints.reduce((acc, { distanceFromStart }, index) => {
      if (distanceFromStart >= startDistance && distanceFromStart <= endDistance) {
        acc.push(index);
      }
      return acc;
    }, []);

    dispatch({
      type: ADD_SEGMENT,
      payload: {
        id: uuidv4(),
        name,
        startDistance,
        endDistance,
        trackpointIndices,
      },
    });
  };
};

export const EDIT_SEGMENT = 'EDIT_SEGMENT';
export const editSegment = (segmentId, { name, startDistance, endDistance }) => {
  return (dispatch, getState) => {
    const { trackpoints } = getState(); // Accessing trackpoints from state
    const trackpointIndices = trackpoints.reduce((acc, { distanceFromStart }, index) => {
      if (distanceFromStart >= startDistance && distanceFromStart <= endDistance) {
        acc.push(index);
      }
      return acc;
    }, []);

    dispatch({
      type: EDIT_SEGMENT,
      payload: {
        segmentId,
        updatedSegment: {
          name,
          startDistance,
          endDistance,
          trackpointIndices,
        },
      },
    });
  };
};

export const DELETE_SEGMENT = 'DELETE_SEGMENT';
export const deleteSegment = (segmentId) => ({
  type: DELETE_SEGMENT,
  payload: segmentId,
});


export const SET_SHOW_TRACKPOINTS = 'SET_SHOW_TRACKPOINTS';
export const setShowTrackpoints = (show) => ({
  type: SET_SHOW_TRACKPOINTS,
  payload: show,
});

export const SET_SHOW_WAYPOINTS = 'SET_SHOW_WAYPOINTS';
export const setShowWaypoints = (show) => ({
  type: SET_SHOW_WAYPOINTS,
  payload: show,
});

export const SET_SHOW_ANNOTATIONS = 'SET_SHOW_ANNOTATIONS';
export const setShowAnnotations = (show) => ({
  type: SET_SHOW_ANNOTATIONS,
  payload: show,
});


export const SET_STAGE_TITLE = 'SET_STAGE_TITLE'; // New action type
export const setStageTitle = (title) => ({
  type: SET_STAGE_TITLE,
  payload: title,
});



// Async action creator for fetching races
export const fetchRacesAsync = (season) => async (dispatch) => {
  try {
    const races = await fetchRaces(season); // Make sure this call uses the season parameter correctly
    dispatch({ type: FETCH_RACES_SUCCESS, payload: races });
  } catch (error) {
    console.error("Error fetching races:", error);
    // Potentially dispatch an error action here
  }
};

// New action creator for fetching all seasons
export const fetchAllSeasons = () => async (dispatch) => {
  try {
    const races = await fetchRacesForSeasons();
    const seasons = Array.from(new Set(races.map(race => race.season))).sort((a, b) => a - b);
    dispatch({ type: SET_SEASONS, payload: seasons });
  } catch (error) {
    console.error("Error fetching all seasons:", error);
    // Handle error
  }
};

// Action creators for selecting a race and a stage
export const selectRace = (raceId) => ({
  type: SELECT_RACE,
  payload: raceId,
});

export const selectStage = (stageId) => ({
  type: SELECT_STAGE,
  payload: stageId,
});
