module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Add custom static file middleware
  {
    name: 'custom::static-files',
    config: {
      publicPath: '/video-metadata',
      directory: 'video-metadata',
    },
  },
];