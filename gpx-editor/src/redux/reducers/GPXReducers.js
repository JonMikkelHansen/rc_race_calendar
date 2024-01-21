import { SET_MINY, SET_MAXY, SET_TOLERANCE, SET_TRACKPOINTS } from '../actions/GPXActions';

const initialState = {
  minY: 0,
  maxY: 0,
  tolerance: 0.00000067,
  trackpoints: [], // Add this line to hold the trackpoints
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
    default:
      return state;
  }
};

export default GPXReducer;
