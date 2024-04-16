// path: src/api/auth/controllers/auth.js

const { google } = require('googleapis');

module.exports = {
  async redirectToGoogle(ctx) {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    ctx.redirect(url);
  },

  async handleGoogleCallback(ctx) {
    const { code } = ctx.query;
    // Exchange code for tokens, save them and handle authentication session
  }
};
