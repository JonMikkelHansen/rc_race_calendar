// src/redux/reducers/index.js

import { combineReducers } from 'redux';
import GPXReducer from './reducers/GPXReducers'; // Import your reducers here

const rootReducer = combineReducers({
  GPXReducer, // Add your reducers here
});

export default rootReducer;
