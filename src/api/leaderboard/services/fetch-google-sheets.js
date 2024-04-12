// Import Google API Client Library using CommonJS syntax
const { google } = require('googleapis');

async function fetchGoogleSheetData(entry, { strapi }) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/spreadsheets'
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '159lVwa87KSC_l3THeskccDBXL08mHO2n22XMKPTFeHQ'; // Replace with your actual Spreadsheet ID
  const range = 'Total Rankings!A1:C8000';

  try {
    // Dynamically import node-fetch just before it is used
    const { default: fetch } = await import('node-fetch');
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const standings = response.data.values.map(([name, team, points]) => ({
      name, team, points
    }));

    // Update the 'standings' data in your Strapi model
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
