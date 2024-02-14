'use strict';

/**
 * gpx service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::gpx.gpx');
