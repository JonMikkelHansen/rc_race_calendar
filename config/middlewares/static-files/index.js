const serve = require('koa-static');
const path = require('path');

module.exports = {
  name: 'static-files',
  factory: (config, { strapi }) => {
    return {
      initialize() {
        return async (ctx, next) => {
          if (ctx.path.startsWith(config.publicPath)) {
            return serve(path.resolve(strapi.dirs.public, config.directory))(ctx, next);
          }
          await next();
        };
      },
    };
  },
};