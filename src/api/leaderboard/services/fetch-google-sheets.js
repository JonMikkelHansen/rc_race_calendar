const { google } = require('googleapis');

async function fetchGoogleSheetData(entry, { strapi }) {
  console.log('Starting fetch from Google Sheets for entry:', entry.id);

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
  const spreadsheetId = '159lVwa87KSC_l3THeskccDBXL08mHO2n22XMKPTFeHQ'; // Ensure this is correct
  const range = 'Total Standings!A1:C8000'; // Ensure this is the correct sheet and range

  try {
    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
    console.log('Data fetched from Sheets:', response.data.values);

    if (!response.data.values || response.data.values.length === 0) {
      console.log('No data found in Sheets or empty range.');
      return; // Stop further execution if no data is found
    }

    const standings = response.data.values.map(([name, team, points]) => ({
      name, 
      team, 
      points: parseInt(points, 10) // Convert points to integer
    }));

    console.log('Mapped standings:', standings);

    const updateResult = await strapi.entityService.update('api::leaderboard.leaderboard', entry.id, {
      data: { standings }
    });

    console.log('Strapi update result:', updateResult);
  } catch (error) {
    console.error('Error fetching or updating data:', error);
  }
}

module.exports = { fetchGoogleSheetData };
