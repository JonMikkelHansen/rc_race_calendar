'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const { fetchGoogleSheetData } = require('../services/fetch-google-sheets');

module.exports = createCoreController('api::leaderboard.leaderboard', ({ strapi }) => ({
  async create(ctx) {
    const response = await super.create(ctx);
    if (response.result) {
      await fetchGoogleSheetData(response.result, { strapi });
    }
    return response;
  },
}));
