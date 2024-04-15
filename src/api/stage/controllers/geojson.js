'use strict';

module.exports = {

  // Add a method to find multiple Stage entities
  async find(ctx) {
    try {
      const entities = await strapi.entityService.findMany('api::stage.stage', ctx.query);
      ctx.body = entities;
    } catch (error) {
      ctx.throw(500, `Internal Server Error: ${error.message}`);
    }
  },

  // Add a method to find a single Stage entity by ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const entity = await strapi.entityService.findOne('api::stage.stage', id, ctx.query);
      if (!entity) {
        return ctx.notFound('Stage not found');
      }
      ctx.body = entity;
    } catch (error) {
      ctx.throw(500, `Internal Server Error: ${error.message}`);
    }
  },
  
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
