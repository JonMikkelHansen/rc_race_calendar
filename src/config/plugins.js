// path: config/plugins.js

module.exports = ({ env }) => ({
    // Configurations for the Users-Permissions plugin
    'users-permissions': {
      config: {
        providers: [
          {
            enabled: true,
            provider: 'google',
            icon: 'google',
            key: env('GOOGLE_CLIENT_ID'), // Your Google client ID
            secret: env('GOOGLE_CLIENT_SECRET'), // Your Google client secret
            redirectUri: env('GOOGLE_REDIRECT_URI'), // Your Google redirect URI
            callback: '/api/auth/google/callback', // The callback path Strapi will handle
            scope: [
              'https://www.googleapis.com/auth/userinfo.email',
              'https://www.googleapis.com/auth/userinfo.profile',
            ],
          },
        ],
      },
    },
  });
  