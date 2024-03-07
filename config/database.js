module.exports = ({ env }) => ({
  connection: {
    client: env('DATABASE_CLIENT'),
    connection: {
      host: env('DATABASE_HOST'),
      port: env.int('DATABASE_PORT'),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl: env.bool('DATABASE_SSL') ? { rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false) } : false,
    },
    // Here you can include other configuration settings like pool configuration, etc.
    // ...
  },
  // ... any other configuration outside of the connection object
});
