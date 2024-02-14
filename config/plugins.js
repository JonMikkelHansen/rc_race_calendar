module.exports = ({ env }) => ({
  // ... other plugin configurations
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
});