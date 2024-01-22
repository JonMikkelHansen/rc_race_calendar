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
  // Base case
  if (points.length <= 2) {
    return points;
  }

  let maxDistance = 0;
  let index = 0;
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  for (let i = 1; i < points.length - 1; i++) {
    // Do not consider waypoints for removal
    if (points[i].isWaypoint) {
      continue;
    }

    const distance = perpendicularDistance(points[i], { start: firstPoint, end: lastPoint });
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance > tolerance) {
    const firstHalf = douglasPeucker(points.slice(0, index + 1), tolerance);
    const secondHalf = douglasPeucker(points.slice(index), tolerance);

    // Merge the arrays, ensuring no duplication of the middle point
    return [...firstHalf.slice(0, -1), ...secondHalf];
  } else {
    // Include all waypoints in the results
    return [firstPoint, ...points.filter(p => p.isWaypoint), lastPoint];
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

// Additional utility functions can be added as needed
