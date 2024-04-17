const { google } = require('googleapis');

module.exports = {
  // Redirect to Google's OAuth 2.0 server
  async redirectToGoogle(ctx) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/auth/google/callback`
    );

    // Generate a url that asks permissions for the email and profile scopes
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline', // offline access type will result in receiving a refresh token
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
    });

    ctx.redirect(url);
  },

  // Handle the OAuth 2.0 server response
  async handleGoogleCallback(ctx) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.BACKEND_URL}/api/auth/google/callback`
    );

    const { code } = ctx.query;
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Here you would typically find or create a user in your database,
      // then create a session or token for that user and return it.
      ctx.body = { message: 'Authentication successful', tokens };
    } catch (error) {
      console.error('Failed to exchange the authorization code for tokens:', error);
      ctx.body = { message: 'Authentication failed', error };
      ctx.status = 500;
    }
  }
};
