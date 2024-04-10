'use strict';

module.exports = {
  routes: [
    // ... your other route configurations for 'api::stage.stage'
    
    // Custom routes for GeoJSON data
    {
      method: 'GET',
      path: '/stages/:id/geojson/combined',
      handler: 'geojson.getCombinedGeoJSON',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/stages/:id/geojson/trackpoints',
      handler: 'geojson.getTrackpointsGeoJSON',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/stages/:id/geojson/waypoints',
      handler: 'geojson.getWaypointsGeoJSON',
      config: {
        auth: false,
      },
    },
  ],
};
