import { fetchRaces } from '../../components/api';
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

export const SET_TRACKPOINT_GEOJSON = 'SET_TRACKPOINT_GEOJSON';
export const setTrackpointGeoJSON = (geojson) => ({
  type: SET_TRACKPOINT_GEOJSON,
  payload: geojson,
});

export const SET_WAYPOINT_GEOJSON = 'SET_WAYPOINT_GEOJSON';
export const setWaypointGeoJSON = (geojson) => ({
  type: SET_WAYPOINT_GEOJSON,
  payload: geojson,
});

export const UPDATE_WAYPOINT_GEOJSON = 'UPDATE_WAYPOINT_GEOJSON';

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
  payload: { ...waypoint, id: uuidv4(), type: waypoint.type },
});

export const DELETE_WAYPOINT = 'DELETE_WAYPOINT';
export const deleteWaypoint = (waypointId) => {
  return (dispatch, getState) => {
    const { waypoints } = getState();
    const updatedWaypoints = waypoints.filter(wp => wp.id !== waypointId);
    const newWaypointGeoJSON = createWaypointGeoJSON(updatedWaypoints);

    dispatch({
      type: DELETE_WAYPOINT,
      payload: waypointId,
    });

    dispatch({
      type: UPDATE_WAYPOINT_GEOJSON,
      payload: newWaypointGeoJSON,
    });
  };
};

export const UPDATE_WAYPOINT = 'UPDATE_WAYPOINT';
export const updateWaypoint = (waypoint) => {
  return (dispatch, getState) => {
    const { trackpoints, waypoints } = getState();
    
    let finalElevation = waypoint.elevation;
    if (!waypoint.elevationEdited) {
      const interpolatedData = interpolateTrackpointData(waypoint.distanceFromStart, trackpoints);
      finalElevation = interpolatedData.elevation;
    }

    const updatedWaypoint = {
      ...waypoint,
      elevation: finalElevation,
    };

    dispatch({
      type: UPDATE_WAYPOINT,
      payload: updatedWaypoint,
    });

    const updatedWaypoints = waypoints.map(wp => wp.id === updatedWaypoint.id ? updatedWaypoint : wp);
    const newWaypointGeoJSON = createWaypointGeoJSON(updatedWaypoints);
    dispatch({
      type: UPDATE_WAYPOINT_GEOJSON,
      payload: newWaypointGeoJSON,
    });

    const trackpointIndex = trackpoints.findIndex(tp => tp.waypointID === waypoint.id);
    if (trackpointIndex !== -1) {
      const updatedTrackpoint = {
        ...trackpoints[trackpointIndex],
        lat: waypoint.lat ?? trackpoints[trackpointIndex].lat,
        lon: waypoint.lon ?? trackpoints[trackpointIndex].lon,
        elevation: finalElevation,
        distanceFromStart: waypoint.distanceFromStart,
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
    const newWaypointID = uuidv4();
    
    const interpolatedData = interpolateTrackpointData(waypointData.distanceFromStart, trackpoints);
    const newWaypoint = {
      ...waypointData,
      id: newWaypointID,
      lat: interpolatedData.lat,
      lon: interpolatedData.lon,
    };

    dispatch({
      type: ADD_WAYPOINT,
      payload: newWaypoint,
    });

    const newTrackpoint = {
      ...waypointData,
      id: uuidv4(),
      waypointID: newWaypointID,
      isWaypoint: true,
      lat: interpolatedData.lat,
      lon: interpolatedData.lon,
    };

    dispatch({
      type: ADD_TRACKPOINT,
      payload: newTrackpoint,
    });

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
    const { trackpoints } = getState();
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
    const { trackpoints } = getState();
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