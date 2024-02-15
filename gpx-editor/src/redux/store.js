// store.js or wherever you configure your Redux store
import { createStore, applyMiddleware, compose } from 'redux';
import { thunk } from 'redux-thunk'; // Ensure this import is correct
import rootReducer from './reducers/GPXReducers'; // Adjust the path as needed

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk))
);

export default store;
