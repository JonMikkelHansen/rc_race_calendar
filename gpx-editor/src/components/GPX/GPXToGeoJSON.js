// GPXToGeoJSON.js

/**
 * Converts an array of waypoints to a GeoJSON object.
 * @param {Array} waypoints - The array of waypoints to convert.
 * @return {Object} GeoJSON object.
 */
export function createWaypointGeoJSON(waypoints) {
    const features = waypoints.map(waypoint => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [waypoint.lon, waypoint.lat],
      },
      properties: {
        id: waypoint.id,
        name: waypoint.name,
        description: waypoint.description,
        elevation: waypoint.elevation,
        distanceFromStart: waypoint.distanceFromStart,
        type: waypoint.type,
        secondaryType: waypoint.secondaryType,
        createdAt: waypoint.createdAt,
        userCreated: waypoint.userCreated,
      },
    }));
  
    return {
      type: 'FeatureCollection',
      features,
    };
  }
  
  /**
   * Converts an array of trackpoints to a GeoJSON object.
   * @param {Array} trackpoints - The array of trackpoints to convert.
   * @return {Object} GeoJSON object.
   */
  export function createTrackpointGeoJSON(trackpoints) {
    const features = trackpoints.map(trackpoint => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: trackpoint.coordinates,
      },
      properties: {
        id: trackpoint.id,
        elevation: trackpoint.elevation,
        distanceFromStart: trackpoint.distanceFromStart,
        userCreated: trackpoint.userCreated,
      },
    }));
  
    return {
      type: 'FeatureCollection',
      features,
    };
  }