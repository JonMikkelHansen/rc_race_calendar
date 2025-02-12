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
      path: './public',
      defaultIndex: false,
      directory: './video-metadata'  // This will serve files from public/video-metadata
    }
  }
];