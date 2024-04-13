'use strict';

// Import the Strapi factory function for controllers
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::leaderboard.leaderboard', ({ strapi }) => ({
  // Extend the base `create` method
  async create(ctx) {
    // Log to indicate custom controller logic is running
    strapi.log.info('Custom create controller for leaderboard is running');

    // Invoke the default creation logic
    const response = await super.create(ctx);

    // Log the response to check what is being returned
    strapi.log.info('Leaderboard created:', JSON.stringify(response));

    // Return the response from the default create method
    return response;
  },
}));
