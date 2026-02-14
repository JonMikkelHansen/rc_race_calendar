module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST'),
      port: env.int('DATABASE_PORT'),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL', false)
  ? { rejectUnauthorized: false }
  : false,
    },
    pool: {
      min: 0,
      max: 3,
      acquireTimeoutMillis: 300000,
      createTimeoutMillis: 300000,
      idleTimeoutMillis: 300000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 1000,
    },
    acquireConnectionTimeout: 300000,
    debug: false,
  },
  // ... any other configuration outside of the connection object
});
