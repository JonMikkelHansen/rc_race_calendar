'use strict';

module.exports = {
  async getCombinedGeoJSON(ctx) {
    try {
      const { id } = ctx.params;
      const stage = await strapi.entityService.findOne('api::stage.stage', id, {
        populate: ['GeoJSON_combined'],
      });

      if (!stage) {
        return ctx.notFound('Stage not found');
      }

      ctx.body = stage.GeoJSON_combined;
    } catch (error) {
      ctx.throw(500, `Internal Server Error: ${error.message}`);
    }
  },

  async getTrackpointsGeoJSON(ctx) {
    try {
      const { id } = ctx.params;
      const stage = await strapi.entityService.findOne('api::stage.stage', id, {
        populate: ['GeoJSON_trackpoints'],
      });

      if (!stage) {
        return ctx.notFound('Stage not found');
      }

      ctx.body = stage.GeoJSON_trackpoints;
    } catch (error) {
      ctx.throw(500, `Internal Server Error: ${error.message}`);
    }
  },

  async getWaypointsGeoJSON(ctx) {
    try {
      const { id } = ctx.params;
      const stage = await strapi.entityService.findOne('api::stage.stage', id, {
        populate: ['GeoJSON_waypoints'],
      });

      if (!stage) {
        return ctx.notFound('Stage not found');
      }

      ctx.body = stage.GeoJSON_waypoints;
    } catch (error) {
      ctx.throw(500, `Internal Server Error: ${error.message}`);
    }
  },
};
