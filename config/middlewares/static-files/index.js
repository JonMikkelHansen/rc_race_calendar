const serve = require('koa-static');
const path = require('path');

module.exports = (config, { strapi }) => async (ctx, next) => {
  if (ctx.path.startsWith(config.publicPath)) {
    return serve(path.resolve(strapi.dirs.public, config.directory))(ctx, next);
  }
  await next();
};