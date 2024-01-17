// src/redux/reducers/index.js

import { combineReducers } from 'redux';
import GPXReducer from './GPXReducers'; // Import your reducers here

const rootReducer = combineReducers({
  GPXReducer, // Add your reducers here
});

export default rootReducer;
