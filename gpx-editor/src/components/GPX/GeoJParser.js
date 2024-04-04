// GeoJParser.js

/**
 * Converts trackpoints array to GeoJSON LineString FeatureCollection.
 * @param {Array} trackpoints - The trackpoints array.
 * @return {Object} GeoJSON FeatureCollection of LineString.
 */
export const createTrackpointGeoJSON = (trackpoints) => {
    // Assuming trackpoints is a flat array of trackpoint objects
    const features = [{
        type: 'Feature',
        geometry: {
            type: 'LineString',
            coordinates: trackpoints.map(tp => [tp.lon, tp.lat, tp.elevation])
        },
        properties: {}
    }];

    return {
        type: 'FeatureCollection',
        features
    };
};


/**
 * Converts waypoints array to GeoJSON Point FeatureCollection.
 * Each waypoint can also have a "type" property.
 * @param {Array} waypoints - The waypoints array.
 * @return {Object} GeoJSON FeatureCollection of Points.
 */
export const createWaypointGeoJSON = (waypoints) => {
    const features = waypoints.map(wp => ({
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [wp.lon, wp.lat, wp.elevation]
        },
        properties: {
            name: wp.name,
            description: wp.description,
            type: wp.type // Include the waypoint type in properties
        }
    }));

    return {
        type: 'FeatureCollection',
        features
    };
};

/**
 * Combines trackpoint and waypoint GeoJSON into a single FeatureCollection.
 * This is useful for applications that need to process or display both
 * types of data together.
 * @param {Object} trackpointGeoJSON - GeoJSON object for trackpoints.
 * @param {Object} waypointGeoJSON - GeoJSON object for waypoints.
 * @return {Object} Combined GeoJSON FeatureCollection.
 */
export const combineGeoJSON = (trackpointGeoJSON, waypointGeoJSON) => {
    // Merge the features from both GeoJSON objects into one array
    const combinedFeatures = [...trackpointGeoJSON.features, ...waypointGeoJSON.features];

    return {
        type: 'FeatureCollection',
        features: combinedFeatures
    };
};
