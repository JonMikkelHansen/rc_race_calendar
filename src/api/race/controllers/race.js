// Path: /src/api/race/controllers/race.js

'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::race.race', ({ strapi }) => ({
  // The default 'find' behavior is automatically available; no need to redefine it here
  // unless you have specific modifications. Since we want the default '/races' endpoint
  // to work without changes, we don't include a custom 'find' method override.

  // Custom method to fetch races with their stages
  async findWithStages(ctx) {
    // Modify the query to ensure stages are populated
    ctx.query.populate = { stages: true }; // This ensures stages are populated in the response
    const result = await super.find(ctx); // Call the base 'find' method with the modified context
    return result;
  },
}));
