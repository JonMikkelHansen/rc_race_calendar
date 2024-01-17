// src/redux/store.js

import { createStore, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk'; // Import 'thunk' correctly
import rootReducer from './reducers/GPXReducers';

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;
