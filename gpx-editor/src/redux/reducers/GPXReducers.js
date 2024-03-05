import { 
  FETCH_RACES_SUCCESS, SELECT_RACE, SELECT_STAGE,
  SET_MINY, SET_MAXY, SET_TOLERANCE, SET_TENSION, 
  SET_TRACKPOINTS, ADD_TRACKPOINT, SET_WAYPOINTS, ADD_WAYPOINT, DELETE_WAYPOINT, UPDATE_WAYPOINT, ADD_SEGMENT, EDIT_SEGMENT, DELETE_SEGMENT,
  SET_SHOW_TRACKPOINTS, SET_SHOW_WAYPOINTS, SET_SHOW_ANNOTATIONS,
  SET_STAGE_TITLE // Import the new action type
} from '../actions/GPXActions';


const initialState = {
  races: [],
  selectedRace: null,
  selectedStage: null,
  minY: 0,
  maxY: 0,
  tolerance: 100,
  tension: 0.2,
  trackpoints: [],
  waypoints: [],
  segments: [],
  showTrackpoints: false,
  showWaypoints: true,
  showAnnotations: false,
  stageTitle: '', // Initialize stageTitle as an empty string  
};

const GPXReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_RACES_SUCCESS:
      return { ...state, races: [...action.payload] };
    case SELECT_RACE:
      return { ...state, selectedRace: action.payload }; // Reset selectedStage when a new race is selected
    case SELECT_STAGE:
      return { ...state, selectedStage: action.payload };
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
    case ADD_TRACKPOINT:
      const newTrackpointsArray = [...state.trackpoints, action.payload];
      newTrackpointsArray.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
      return { ...state, trackpoints: newTrackpointsArray };
    case SET_WAYPOINTS:
      return { ...state, waypoints: action.payload };
    case ADD_WAYPOINT:
      return { ...state, waypoints: [...state.waypoints, action.payload] };
    case DELETE_WAYPOINT:
      return { ...state, waypoints: state.waypoints.filter(wp => wp.id !== action.payload) };
    case UPDATE_WAYPOINT:
      return { ...state, waypoints: state.waypoints.map(wp => wp.id === action.payload.id ? action.payload : wp) };
    case ADD_SEGMENT:
      return {
        ...state,
        segments: [...state.segments, action.payload],
      };
    case EDIT_SEGMENT:
      const updatedSegments = state.segments.map(segment =>
        segment.id === action.payload.segmentId ? { ...segment, ...action.payload.updatedSegment } : segment
      );
      return {
        ...state,
        segments: updatedSegments,
      };
    case DELETE_SEGMENT:
      return {
        ...state,
        segments: state.segments.filter(segment => segment.id !== action.payload),
      };
    case SET_SHOW_TRACKPOINTS:
      return { ...state, showTrackpoints: action.payload };
    case SET_SHOW_WAYPOINTS:
      return { ...state, showWaypoints: action.payload };
    case SET_SHOW_ANNOTATIONS:
      return { ...state, showAnnotations: action.payload };
    case SET_STAGE_TITLE: // New case for setting the stage title
      return { ...state, stageTitle: action.payload };
    default:
      return state;
  }
};

export default GPXReducer;
