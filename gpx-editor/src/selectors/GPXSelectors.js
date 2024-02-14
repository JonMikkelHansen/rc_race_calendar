// selectors/GPXSelectors.js

import { createSelector } from 'reselect';
import { douglasPeucker } from '../Utilities'; // Adjust the import path as necessary

// Basic state access
export const getTrackpoints = state => state.trackpoints;
export const getWaypoints = state => state.waypoints;
export const getYmin = state => state.Ymin;
export const getYmax = state => state.Ymax;
export const getTolerance = state => state.tolerance;
export const getTension = state => state.tension;
export const getStageTitle = state => state.stageTitle;
export const getShowTrackpoints = state => state.showTrackpoints;
export const getShowWaypoints = state => state.showWaypoints;
export const getShowAnnotations = state => state.showAnnotations;

// Derived data selectors
export const getTotalDistance = createSelector(
  [getTrackpoints],
  trackpoints => trackpoints.reduce((total, point) => total + point.distanceFromStart, 0)
);

export const getSimplifiedTrackpoints = createSelector(
  [getTrackpoints, getTolerance],
  (trackpoints, tolerance) => douglasPeucker(trackpoints, tolerance)
);

export const getVisibleWaypoints = createSelector(
  [getWaypoints],
  waypoints => waypoints.filter(waypoint => waypoint.isVisible)
);

export const getElevationBounds = createSelector(
  [getTrackpoints],
  (trackpoints) => {
    const elevations = trackpoints.map(p => p.elevation);
    return {
      minY: Math.min(...elevations),
      maxY: Math.max(...elevations),
    };
  }
);

// Example of a more complex selector that combines multiple pieces of state
export const getProfileChartData = createSelector(
  [getSimplifiedTrackpoints, getVisibleWaypoints, getShowTrackpoints, getShowWaypoints],
  (simplifiedTrackpoints, visibleWaypoints, showTrackpoints, showWaypoints) => {
    // This is a placeholder for how you might combine these pieces of state into a single
    // data structure suitable for plotting in a chart. Adjust according to your actual data structure and requirements.
    return simplifiedTrackpoints.map(point => ({
      x: point.distanceFromStart / 1000, // Example conversion to km
      y: point.elevation,
      isWaypoint: showWaypoints && visibleWaypoints.some(waypoint => waypoint.id === point.id),
      showTrackpoint: showTrackpoints,
    }));
  }
);
