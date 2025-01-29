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
  {
    name: 'custom::static-files',
    config: {
      enabled: true,
      publicPath: '/video-metadata',
      directory: 'video-metadata',
    },
  },
];