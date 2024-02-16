'use strict';

/**
 * race router
 */

const { createCoreRouter, createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::race.race', {
  config: {
    find: {
      auth: false,
    },
    findOne: {
      auth: false,
    },
    create: {
      auth: false,
    },
    update: {
      auth: false,
    },
    delete: {
      auth: false,
    },
  },
  routes: [ // Ensure the custom route is defined within a 'routes' array
    {
      method: 'GET',
      path: '/races-with-stages', // This custom path will handle the request
      handler: 'api::race.race.findWithStages', // Points to the custom controller method
      config: {
        auth: false, // Specifies authentication configuration; adjust as needed
      },
    },
  ],
});
