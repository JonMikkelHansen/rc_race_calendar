const { google } = require('googleapis');

module.exports = {
  async redirectToGoogle(ctx) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/auth/google/callback`
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',  // Ensure that you receive a refresh token along with the access token
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ]
    });

    ctx.redirect(url);
  },

  async handleGoogleCallback(ctx) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/auth/google/callback`
    );

    const { code } = ctx.query;
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      // Handle your login/session creation here
      ctx.body = { message: 'Authentication successful', tokens };
    } catch (error) {
      console.error('Error during the Google authentication', error);
      ctx.body = { message: 'Authentication failed', error };
      ctx.status = 500;
    }
  }
};
