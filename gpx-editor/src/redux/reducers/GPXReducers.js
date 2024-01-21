import { SET_MINY, SET_MAXY, SET_TOLERANCE, SET_TRACKPOINTS, SET_WAYPOINTS, ADD_WAYPOINT, DELETE_WAYPOINT, UPDATE_WAYPOINT } from '../actions/GPXActions';

const initialState = {
  minY: 0,
  maxY: 0,
  tolerance: 0.00000067,
  trackpoints: [], // Add this line to hold the trackpoints
  waypoints: [],
};

const GPXReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MINY:
      return {
        ...state,
        minY: action.payload,
      };
    case SET_MAXY:
      return {
        ...state,
        maxY: action.payload,
      };
    case SET_TOLERANCE:
      return {
        ...state,
        tolerance: action.payload,
      };
    case SET_TRACKPOINTS: // Handle setting trackpoints
      return {
        ...state,
        trackpoints: action.payload,
      };
    case SET_WAYPOINTS:
      return {
        ...state,
        waypoints: action.payload,
      };
    case ADD_WAYPOINT:
      return {
        ...state,
        waypoints: [...state.waypoints, action.payload],
      };
    case DELETE_WAYPOINT:
      return {
        ...state,
        waypoints: state.waypoints.filter(wp => wp.id !== action.payload),
      };
    case UPDATE_WAYPOINT:
      return {
        ...state,
        waypoints: state.waypoints.map(wp => wp.id === action.payload.id ? action.payload : wp),
      };
    default:
      return state;
  }
};

export default GPXReducer;
