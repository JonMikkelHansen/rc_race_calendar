module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/auth/google',
        handler: 'auth.redirectToGoogle',
        config: { auth: false },
      },
      {
        method: 'GET',
        path: '/auth/google/callback',
        handler: 'auth.handleGoogleCallback',
        config: { auth: false },
      }
    ]
  };
  