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

// Keep existing actions for minY and maxY
export const SET_MINY = 'SET_MINY';
export const SET_MAXY = 'SET_MAXY';

export const setMinY = (minY) => ({
  type: SET_MINY,
  payload: minY,
});

export const setMaxY = (maxY) => ({
  type: SET_MAXY,
  payload: maxY,
});


//ADDING TRACKPOINTS ARRAY
export const SET_TRACKPOINTS = 'SET_TRACKPOINTS';

// Action creator for setting trackpoints
export const setTrackpoints = (trackpoints) => ({
  type: SET_TRACKPOINTS,
  payload: trackpoints,
});



// ADDING WAYPOINTS
export const SET_WAYPOINTS = 'SET_WAYPOINTS';
export const ADD_WAYPOINT = 'ADD_WAYPOINT';
export const DELETE_WAYPOINT = 'DELETE_WAYPOINT';
export const UPDATE_WAYPOINT = 'UPDATE_WAYPOINT';

export const setWaypoints = (waypoints) => ({
  type: SET_WAYPOINTS,
  payload: waypoints,
});

export const addWaypoint = (waypoint) => ({
  type: ADD_WAYPOINT,
  payload: waypoint,
});

export const deleteWaypoint = (waypointId) => ({
  type: DELETE_WAYPOINT,
  payload: waypointId,
});

export const updateWaypoint = (waypoint) => ({
  type: UPDATE_WAYPOINT,
  payload: waypoint,
});