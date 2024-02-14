module.exports = ({ env }) => {
  // Determine environment mode
  const isProduction = env('NODE_ENV') === 'production';

  // Database configuration
  const databaseConfig = {
    client: env('DATABASE_CLIENT', isProduction ? env('PROD_DATABASE_CLIENT') : env('DEV_DATABASE_CLIENT')),
    connection: {
      host: env(isProduction ? 'PROD_DATABASE_HOST' : 'DEV_DATABASE_HOST'),
      port: env.int(isProduction ? 'PROD_DATABASE_PORT' : 'DEV_DATABASE_PORT'),
      database: env(isProduction ? 'PROD_DATABASE_NAME' : 'DEV_DATABASE_NAME'),
      user: env(isProduction ? 'PROD_DATABASE_USERNAME' : 'DEV_DATABASE_USERNAME'),
      password: env(isProduction ? 'PROD_DATABASE_PASSWORD' : 'DEV_DATABASE_PASSWORD'),
      ssl: isProduction ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true) } : false,
    },
  };

  return { connection: databaseConfig };
};