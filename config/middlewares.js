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
  {
    name: 'strapi::public',
    config: {
      enabled: true,
      path: './public',  // serves files from the public directory
      defaultIndex: false,
    }
  },
  {
    name: 'custom::static-files',
    config: {
      enabled: true,
      publicPath: '/video-metadata',
      directory: 'video-metadata',
    },
  },
];