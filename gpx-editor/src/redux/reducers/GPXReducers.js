import { SET_MINY, SET_MAXY, SET_TOLERANCE } from '../actions/GPXActions';

const initialState = {
  minY: 0, // Initial value for minY
  maxY: 0, // Initial value for maxY
  tolerance: 0.00000067, // Initial value for tolerance
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
    default:
      return state;
  }
};

export default GPXReducer;
