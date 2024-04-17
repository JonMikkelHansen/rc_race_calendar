module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/api/auth/google',
      handler: 'auth.redirectToGoogle',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/api/auth/google/callback',
      handler: 'auth.handleGoogleCallback',
      config: {
        auth: false
      }
    }
  ]
};
