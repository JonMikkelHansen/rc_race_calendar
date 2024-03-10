module.exports = ({ env }) => ({
  // ... other plugin configurations
  'users-permissions': {
    config: {
      jwtSecret: env('JWT_SECRET'),
    },
  },
  'import-export-entries': {
    enabled: true,
    config: {
      // See `Config` section.
    },
  },
});