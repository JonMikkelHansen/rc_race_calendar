// Utilities.js

/**
 * Calculates the Haversine distance between two points on the Earth.
 * @param lat1 {number} Latitude of the first point.
 * @param lon1 {number} Longitude of the first point.
 * @param lat2 {number} Latitude of the second point.
 * @param lon2 {number} Longitude of the second point.
 * @return {number} Distance in meters.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Douglas-Peucker simplification algorithm for reducing the number of points in a track.
 * @param points {Array} Array of track points.
 * @param tolerance {number} Tolerance value for simplification.
 * @returns {Array} Simplified array of track points.
 */
export function douglasPeucker(points, tolerance) {
  if (points.length <= 2) {
    return points;
  }

  let maxDistance = 0;
  let index = 0;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    const point = points[i];
    // Ensure that userCreated points are not considered for removal
    if (point.userCreated) continue;

    const distance = perpendicularDistance(point, { start: firstPoint, end: lastPoint });

    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > tolerance) {
    // Split the array into two at the index and recursively simplify
    const firstHalf = douglasPeucker(points.slice(0, index + 1), tolerance);
    const secondHalf = douglasPeucker(points.slice(index), tolerance);

    // Concatenate the results and ensure that waypoints and userCreated points are included
    const result = [...firstHalf.slice(0, -1), ...secondHalf];
    // Reinsert userCreated points which may have been removed
    const userCreatedPoints = points.filter(p => p.userCreated);
    userCreatedPoints.forEach(point => {
      if (!result.some(p => p.id === point.id)) {
        result.push(point);
      }
    });
    return result.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
  } else {
    // Return the endpoints and any waypoints or userCreated points in between
    const waypointsAndUserCreatedPoints = points.filter(p => p.isWaypoint || p.userCreated);
    return [firstPoint, ...waypointsAndUserCreatedPoints, lastPoint];
  }
}

/**
 * Calculates the perpendicular distance from a point to a line segment.
 * @param point {Object} Point object with latitude and longitude properties.
 * @param line {Object} Line object with start and end point properties.
 * @returns {number} Perpendicular distance in meters.
 */
export function perpendicularDistance(point, line) {
  const start = line.start;
  const end = line.end;
  const dx = end.lon - start.lon;
  const dy = end.lat - start.lat;
  const denominator = dx * dx + dy * dy;

  if (denominator === 0) {
    return calculateHaversineDistance(
      point.lat,
      point.lon,
      start.lat,
      start.lon
    );
  }

  const t = ((point.lon - start.lon) * dx + (point.lat - start.lat) * dy) / denominator;

  if (t < 0) {
    return calculateHaversineDistance(
      point.lat,
      point.lon,
      start.lat,
      start.lon
    );
  } else if (t > 1) {
    return calculateHaversineDistance(
      point.lat,
      point.lon,
      end.lat,
      end.lon
    );
  } else {
    const closestPoint = {
      lon: start.lon + t * dx,
      lat: start.lat + t * dy,
    };
    return calculateHaversineDistance(
      point.lat,
      point.lon,
      closestPoint.lat,
      closestPoint.lon
    );
  }
}

/**
 * Interpolates lat, lon, and elevation for a given distance from start, based on surrounding trackpoints.
 * @param {number} distance - The distance from the start for which to interpolate the trackpoint data.
 * @param {Array} trackpoints - An array of trackpoints, each with lat, lon, distanceFromStart, and elevation properties.
 * @return {Object} An object containing interpolated lat, lon, and elevation values.
 */
export const interpolateTrackpointData = (distance, trackpoints) => {
  if (!trackpoints.length) {
    console.log("Interpolation called with empty trackpoints array.");
    return null; // Guard clause for empty trackpoints array
  }

  // Sort a copy of the trackpoints to avoid mutating the original array
  const sortedTrackpoints = [...trackpoints].sort((a, b) => a.distanceFromStart - b.distanceFromStart);
  console.log("Interpolation called with distance:", distance);
  console.log("Sorted trackpoints:", sortedTrackpoints);

  const maxDistance = sortedTrackpoints[sortedTrackpoints.length - 1].distanceFromStart;
  if (distance >= maxDistance) {
    // Return the last trackpoint data directly if distance is at or beyond the last trackpoint
    const { lat, lon, elevation } = sortedTrackpoints[sortedTrackpoints.length - 1];
    console.log("Using last trackpoint data for interpolation.");
    return { lat: lat, lon: lon, elevation };
  }

  let before = sortedTrackpoints[0], after = sortedTrackpoints[1];

  for (let i = 1; i < sortedTrackpoints.length; i++) {
    if (sortedTrackpoints[i].distanceFromStart >= distance) {
      before = sortedTrackpoints[i - 1];
      after = sortedTrackpoints[i];
      break;
    }
  }

  console.log("Before trackpoint:", before);
  console.log("After trackpoint:", after);

  if (before.distanceFromStart === after.distanceFromStart) {
    console.log("Identical before and after distances, returning before's data.");
    // Cannot interpolate between two points at the same distance; return before's data
    return {
      lat: Number(before.lat.toFixed(6)),
      lon: Number(before.lon.toFixed(6)),
      elevation: Number(before.elevation.toFixed(1))
    };
  }

  const ratio = (distance - before.distanceFromStart) / (after.distanceFromStart - before.distanceFromStart);
  console.log("Interpolation ratio:", ratio);

  const lat = before.lat + ratio * (after.lat - before.lat);
  const lon = before.lon + ratio * (after.lon - before.lon);
  const elevation = before.elevation + ratio * (after.elevation - before.elevation);

  // Check if the interpolated values are numbers
  if (Number.isNaN(lat) || Number.isNaN(lon) || Number.isNaN(elevation)) {
    console.error("Interpolation failed, received NaN values.");
  }

  console.log("Interpolated lat:", lat);
  console.log("Interpolated lon:", lon);
  console.log("Interpolated elevation:", elevation);

  return {
    lat: Number.isFinite(lat) ? Number(lat.toFixed(6)) : 0, // Default to 0 if NaN
    lon: Number.isFinite(lon) ? Number(lon.toFixed(6)) : 0, // Default to 0 if NaN
    elevation: Number.isFinite(elevation) ? Number(elevation.toFixed(1)) : 0 // Default to 0 if NaN
  };
};

/**
 * Formats a date string into a more readable format with a day suffix.
 * @param {string} dateString - The date string to format.
 * @return {string} The formatted date string.
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { month: 'short', day: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
  const day = date.getDate();
  let daySuffix;

  switch (day) {
    case 1:
    case 21:
    case 31:
      daySuffix = 'st';
      break;
    case 2:
    case 22:
      daySuffix = 'nd';
      break;
    case 3:
    case 23:
      daySuffix = 'rd';
      break;
    default:
      daySuffix = 'th';
  }

  return formattedDate.replace(new RegExp(` ${day}`), ` ${day}${daySuffix}`);
}