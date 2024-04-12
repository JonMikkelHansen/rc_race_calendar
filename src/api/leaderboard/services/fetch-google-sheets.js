// Import Google API Client Library using CommonJS syntax
const { google } = require('googleapis');

async function fetchGoogleSheetData(entry, { strapi }) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Set credentials with access and refresh tokens
  auth.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/spreadsheets'
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '159lVwa87KSC_l3THeskccDBXL08mHO2n22XMKPTFeHQ'; // Your actual Spreadsheet ID
  const range = 'Total Standings!A1:C8000';  // Corrected to the actual sheet name

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Map the data to match the 'standings' structure expected by Strapi
    const standings = response.data.values.map(([name, team, points]) => ({
      name, 
      team, 
      points: parseInt(points, 10) // Ensuring points are stored as integers
    }));

    // Update the 'standings' field of the leaderboard entry in Strapi
    await strapi.entityService.update('api::leaderboard.leaderboard', entry.id, {
      data: {
        standings
      },
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
  }
}

module.exports = {
  fetchGoogleSheetData,
};
