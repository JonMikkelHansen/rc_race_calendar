import { 
  SET_MINY, SET_MAXY, SET_TOLERANCE, SET_TENSION, 
  SET_TRACKPOINTS, SET_WAYPOINTS, ADD_WAYPOINT, DELETE_WAYPOINT, UPDATE_WAYPOINT,
  SET_SHOW_TRACKPOINTS, SET_SHOW_WAYPOINTS, SET_SHOW_ANNOTATIONS // Import the new action types
} from '../actions/GPXActions';

const initialState = {
  minY: 0,
  maxY: 0,
  tolerance: 100,
  tension: 0,
  trackpoints: [],
  waypoints: [],
  showTrackpoints: false, // Default state for trackpoints visibility
  showWaypoints: true, // Default state for waypoints visibility
  showAnnotations: false, // Default state for annotations visibility
};

const GPXReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MINY:
      return { ...state, minY: action.payload };
    case SET_MAXY:
      return { ...state, maxY: action.payload };
    case SET_TOLERANCE:
      return { ...state, tolerance: action.payload };
    case SET_TENSION:
      return { ...state, tension: action.payload };
    case SET_TRACKPOINTS:
      return { ...state, trackpoints: action.payload };
    case SET_WAYPOINTS:
      return { ...state, waypoints: action.payload };
    case ADD_WAYPOINT:
      return { ...state, waypoints: [...state.waypoints, action.payload] };
    case DELETE_WAYPOINT:
      return { ...state, waypoints: state.waypoints.filter(wp => wp.id !== action.payload) };
    case UPDATE_WAYPOINT:
      return { ...state, waypoints: state.waypoints.map(wp => wp.id === action.payload.id ? action.payload : wp) };
    case SET_SHOW_TRACKPOINTS:
      return { ...state, showTrackpoints: action.payload };
    case SET_SHOW_WAYPOINTS:
      return { ...state, showWaypoints: action.payload };
    case SET_SHOW_ANNOTATIONS:
      return { ...state, showAnnotations: action.payload };
    default:
      return state;
  }
};

export default GPXReducer;
