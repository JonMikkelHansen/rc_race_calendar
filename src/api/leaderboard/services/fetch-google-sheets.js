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
  const spreadsheetId = '159lVwa87KSC_l3THeskccDBXL08mHO2n22XMKPTFeHQ';
  const range = 'Total Standings!A1:C8000';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    if (!response.data.values) {
      console.error('No data found in the sheet');
      return;
    }

    /*const standings = response.data.values.map(([name, team, points]) => ({
      name, 
      team, 
      points: parseInt(points, 10) // Ensure points are numeric
    }));*/

    const standings = [
      { name: "Test Player", team: "Test Team", points: 100 },
      { name: "Another Player", team: "Another Team", points: 200 }
  ];

  
    console.log('Standings fetched:', standings);

    // Update the 'standings' field of the leaderboard entry
    const updateResponse = await strapi.entityService.update('api::leaderboard.leaderboard', entry.id, {
      data: {
        standings
      },
    });

    console.log('Update response:', updateResponse);
  } catch (error) {
    console.error('Error fetching or updating data:', error);
  }
}

module.exports = {
  fetchGoogleSheetData,
};
