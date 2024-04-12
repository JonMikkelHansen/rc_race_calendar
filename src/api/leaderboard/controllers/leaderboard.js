'use strict';

/**
 * leaderboard controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { fetchGoogleSheetData } = require('../services/fetch-google-sheets');  // Ensure correct path

module.exports = createCoreController('api::leaderboard.leaderboard', ({ strapi }) => ({
  // Extending the default create method
  async create(ctx) {
    // First, execute the standard create operation using the default controller logic
    const response = await super.create(ctx);

    // Then, invoke your custom function to fetch data from Google Sheets
    // and update the newly created leaderboard entry
    if (response.result) {
      await fetchGoogleSheetData(response.result, { strapi });
    }

    // Return the response including the updated leaderboard entry
    return response;
  },
}));
