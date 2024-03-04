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
    const distance = perpendicularDistance(point, { start: firstPoint, end: lastPoint });

    if (distance > maxDistance && !point.isWaypoint) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > tolerance) {
    // Split the array into two at the index and recursively simplify
    const firstHalf = douglasPeucker(points.slice(0, index + 1), tolerance);
    const secondHalf = douglasPeucker(points.slice(index), tolerance);

    // Concatenate the results and ensure that waypoints are included
    return [...firstHalf.slice(0, -1), ...secondHalf];
  } else {
    // Return the endpoints and any waypoints in between
    const waypoints = points.filter(p => p.isWaypoint);
    return [firstPoint, ...waypoints, lastPoint];
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
  const dx = end.longitude - start.longitude;
  const dy = end.latitude - start.latitude;
  const denominator = dx * dx + dy * dy;

  if (denominator === 0) {
    return calculateHaversineDistance(
      point.latitude,
      point.longitude,
      start.latitude,
      start.longitude
    );
  }

  const t = ((point.longitude - start.longitude) * dx + (point.latitude - start.latitude) * dy) / denominator;

  if (t < 0) {
    return calculateHaversineDistance(
      point.latitude,
      point.longitude,
      start.latitude,
      start.longitude
    );
  } else if (t > 1) {
    return calculateHaversineDistance(
      point.latitude,
      point.longitude,
      end.latitude,
      end.longitude
    );
  } else {
    const closestPoint = {
      longitude: start.longitude + t * dx,
      latitude: start.latitude + t * dy,
    };
    return calculateHaversineDistance(
      point.latitude,
      point.longitude,
      closestPoint.latitude,
      closestPoint.longitude
    );
  }
}


/**
 * Interpolates lat, lon, and elevation for a given distance from start, based on surrounding trackpoints.
 * @param {number} distance - The distance from the start for which to interpolate the trackpoint data.
 * @param {Array} trackpoints - An array of trackpoints, each with lat, lon, distanceFromStart, and elevation properties.
 * @return {Object} An object containing interpolated lat, lon, and elevation values.
 */
const interpolateTrackpointData = (distance, trackpoints) => {
  if (!trackpoints.length) return null; // Guard clause for empty trackpoints array

  const maxDistance = trackpoints[trackpoints.length - 1].distanceFromStart;
  if (distance >= maxDistance) {
      // Return the last trackpoint data directly if distance is at or beyond the last trackpoint
      const { lat, lon, elevation } = trackpoints[trackpoints.length - 1];
      return { lat, lon, elevation };
  }

  const sortedTrackpoints = trackpoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
  let before = sortedTrackpoints[0], after = sortedTrackpoints[1];

  for (let i = 1; i < sortedTrackpoints.length; i++) {
      if (sortedTrackpoints[i].distanceFromStart >= distance) {
          before = sortedTrackpoints[i - 1];
          after = sortedTrackpoints[i];
          break;
      }
  }

  const ratio = (distance - before.distanceFromStart) / (after.distanceFromStart - before.distanceFromStart);
  const lat = before.lat + ratio * (after.lat - before.lat);
  const lon = before.lon + ratio * (after.lon - before.lon);
  const elevation = before.elevation + ratio * (after.elevation - before.elevation);

  return {
      lat: Number(lat.toFixed(6)), // Adjust the precision as needed
      lon: Number(lon.toFixed(6)),
      elevation: Number(elevation.toFixed(1))
  };
};


// Additional utility functions can be added as needed
