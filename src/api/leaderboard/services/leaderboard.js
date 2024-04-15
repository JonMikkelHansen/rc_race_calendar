const { google } = require('googleapis');

async function fetchGoogleSheetData() {
    console.log({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      });
      
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '159lVwa87KSC_l3THeskccDBXL08mHO2n22XMKPTFeHQ';  // Replace with actual ID
  const range = 'Total Standings!A2:C8000';  // Make sure this is correct

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    if (!response.data.values || response.data.values.length === 0) {
      return [];
    }
    return response.data.values.map(row => ({
      name: row[0],
      team: row[1],
      points: parseInt(row[2], 10)
    }));
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
}

module.exports = {
  fetchGoogleSheetData,
};