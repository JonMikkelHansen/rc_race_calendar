'use strict';

const serve = require('koa-static');
const path = require('path');

/**
 * Custom static files middleware
 */
const staticFiles = ({ strapi }) => ({
  initialize() {
    strapi.app.use(async (ctx, next) => {
      const config = strapi.config.get('middleware.settings.custom.static-files');
      
      if (ctx.path.startsWith(config.publicPath)) {
        return serve(path.resolve(strapi.dirs.public, config.directory))(ctx, next);
      }
      await next();
    });
  }
});

module.exports = staticFiles;