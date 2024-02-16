'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::race.race', ({ strapi }) => ({
  // Override the default find method
  async find(ctx) {
    if (ctx.query.withStages) {
      // If withStages query parameter is present, perform custom population
      const entities = await strapi.entityService.findMany('api::race.race', {
        populate: {
          stages: {
            populate: {
              gpx: true, // Ensure this matches your relation field names
            },
          },
        },
      });
      const sanitizedEntities = entities.map(entity => strapi.entityService.sanitizeOutput(entity, ctx));
      return ctx.body = sanitizedEntities;
    } else {
      // Fallback to the standard find functionality
      return super.find(ctx);
    }
  },
}));
