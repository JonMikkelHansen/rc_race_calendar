// Actions for fetching and selecting races and stages
import { fetchRaces, fetchRacesForSeasons } from '../../components/api';
import { v4 as uuidv4 } from 'uuid';
import { interpolateTrackpointData } from '../../Utilities'; // Adjust the path as necessary
import { createWaypointGeoJSON } from '../../components/GPX/GeoJParser'; // Ensure correct import path

/*************************************
    SELECTING SEASON, RACE AND STAGE
*************************************/

export const FETCH_RACES_SUCCESS = 'FETCH_RACES_SUCCESS';
export const SET_SEASONS = 'SET_SEASONS'; // New action type for setting seasons
export const SELECT_RACE = 'SELECT_RACE';
export const SELECT_STAGE = 'SELECT_STAGE';

export const fetchRacesAsync = (season) => async (dispatch) => {
  try {
    const races = await fetchRaces(season); // Ensure fetchRaces is implemented correctly
    dispatch({ type: FETCH_RACES_SUCCESS, payload: races });
  } catch (error) {
    console.error("Error fetching races:", error);
    // Potential place for dispatching an error action
  }
};

// Action creator for selecting a race
export const selectRace = (raceId) => ({
  type: SELECT_RACE,
  payload: raceId,
});

// Action creator for selecting a stage
export const selectStage = (stageId) => ({
  type: SELECT_STAGE,
  payload: stageId,
});

/*************************************
    SETTING VARIABLES FOR CHART DATA
*************************************/

export const SET_STAGE_TITLE = 'SET_STAGE_TITLE'; // New action type
export const setStageTitle = (title) => ({
  type: SET_STAGE_TITLE,
  payload: title,
});

export const SET_TOLERANCE = 'SET_TOLERANCE';
export const setTolerance = (tolerance) => ({
  type: SET_TOLERANCE,
  payload: tolerance,
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

export const SET_MINY_MANUAL = 'SET_MINY_MANUAL';
export const setMinYManual = (minY) => ({
  type: SET_MINY_MANUAL,
  payload: minY,
});

export const SET_MAXY_MANUAL = 'SET_MAXY_MANUAL';
export const setMaxYManual = (maxY) => ({
  type: SET_MAXY_MANUAL,
  payload: maxY,
});

export const RESET_MINY_MAXY_MANUAL = 'RESET_MINY_MAXY_MANUAL';
export const resetMinYMaxYManual = () => ({
  type: RESET_MINY_MAXY_MANUAL,
});

/*****************************
  CREATING GEOJSON OBJECTS
******************************/

// CREATING TRACKPOINT GEOJSON OBJECT
export const SET_TRACKPOINT_GEOJSON = 'SET_TRACKPOINT_GEOJSON';
export const setTrackpointGeoJSON = (geojson) => ({
  type: SET_TRACKPOINT_GEOJSON,
  payload: geojson,
});

//CREATING WAYPOINT GEOJSON OBJECT
export const SET_WAYPOINT_GEOJSON = 'SET_WAYPOINT_GEOJSON';
export const setWaypointGeoJSON = (geojson) => ({
  type: SET_WAYPOINT_GEOJSON,
  payload: geojson,
});

export const UPDATE_WAYPOINT_GEOJSON = 'UPDATE_WAYPOINT_GEOJSON'; // New action type

/*************************************
  CREATING TRACKPOINTS AND WAYPOINTS
*************************************/

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
  payload: { ...waypoint, id: uuidv4(), type: waypoint.type }, // Generate a unique ID for the waypoint
});

export const DELETE_WAYPOINT = 'DELETE_WAYPOINT';
export const deleteWaypoint = (waypointId) => ({
  type: DELETE_WAYPOINT,
  payload: waypointId,
});

export const UPDATE_WAYPOINT = 'UPDATE_WAYPOINT';
export const updateWaypoint = (waypoint) => {
  return (dispatch, getState) => {
    const { trackpoints, waypoints } = getState();

    // Calculate new lat, lon, and elevation based on the distanceFromStart
    const interpolatedData = interpolateTrackpointData(waypoint.distanceFromStart, trackpoints);

    const updatedWaypoint = {
      ...waypoint,
      lat: interpolatedData.lat,
      lon: interpolatedData.lon,
      elevation: waypoint.elevationEdited ? waypoint.elevation : interpolatedData.elevation, // Use manually edited elevation if available
    };

    dispatch({
      type: UPDATE_WAYPOINT,
      payload: updatedWaypoint,
    });

    // Update the waypointGeoJSON
    const updatedWaypoints = waypoints.map(wp => wp.id === updatedWaypoint.id ? updatedWaypoint : wp);
    const newWaypointGeoJSON = createWaypointGeoJSON(updatedWaypoints);
    dispatch({
      type: UPDATE_WAYPOINT_GEOJSON,
      payload: newWaypointGeoJSON,
    });

    // Update the corresponding trackpoint if it exists
    const trackpointIndex = trackpoints.findIndex(tp => tp.waypointID === updatedWaypoint.id);
    if (trackpointIndex !== -1) {
      const updatedTrackpoint = {
        ...trackpoints[trackpointIndex],
        lat: updatedWaypoint.lat,
        lon: updatedWaypoint.lon,
        elevation: updatedWaypoint.elevation,
        distanceFromStart: updatedWaypoint.distanceFromStart,
      };

      const newTrackpoints = [...trackpoints];
      newTrackpoints[trackpointIndex] = updatedTrackpoint;

      dispatch(setTrackpoints(newTrackpoints));
    }
  };
};

export const ADD_TRACKPOINT = 'ADD_TRACKPOINT';

export const addWaypointAndTrackpoint = (waypointData) => {
  return (dispatch, getState) => {
    const { waypoints, trackpoints } = getState();
    const newWaypointID = uuidv4(); // Generate a unique ID for the new waypoint

    // Calculate lat, lon, and elevation for the new waypoint
    const interpolatedData = interpolateTrackpointData(waypointData.distanceFromStart, trackpoints);
    const newWaypoint = {
      ...waypointData,
      ...interpolatedData, // Add lat, lon, and elevation to waypoint data
      id: newWaypointID, // Use the same ID for waypoint
    };

    dispatch({
      type: ADD_WAYPOINT,
      payload: newWaypoint,
    });

    // Optionally, add a corresponding trackpoint if it doesn't exist
    const newTrackpoint = {
      ...waypointData,
      ...interpolatedData, // Add lat, lon, and elevation to trackpoint data
      id: uuidv4(), // Assign a new ID to ensure uniqueness
      waypointID: newWaypointID, // Link to the new waypoint
      isWaypoint: true,
    };

    dispatch({
      type: ADD_TRACKPOINT,
      payload: newTrackpoint,
    });

    // Update waypointGeoJSON
    const updatedWaypoints = [...waypoints, newWaypoint];
    const newWaypointGeoJSON = createWaypointGeoJSON(updatedWaypoints);
    dispatch({
      type: UPDATE_WAYPOINT_GEOJSON,
      payload: newWaypointGeoJSON,
    });
  };
};

/*************************************
  CREATING AND EDITING SEGMENTS
*************************************/

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