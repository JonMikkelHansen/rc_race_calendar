const { google } = require('googleapis');
const fetch = require('node-fetch');  // Make sure to install node-fetch if not already installed

async function fetchGoogleSheetData(entry, { strapi }) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Initially, we assume the access token might still be valid
  auth.setCredentials({
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    scope: 'https://www.googleapis.com/auth/spreadsheets'
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = '159lVwa87KSC_l3THeskccDBXL08mHO2n22XMKPTFeHQ';  // Your actual Spreadsheet ID
  const range = 'Total Rankings!A1:C8000';

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const standings = response.data.values.map(([name, team, points]) => ({
      name, team, points
    }));

    await strapi.entityService.update('api::leaderboard.leaderboard', entry.id, {
      data: {
        standings
      },
    });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    if (error.code === 401) { // Unauthorized or token expired
      // Refresh the token here and retry the request
      const newToken = await refreshGoogleToken(
        process.env.GOOGLE_REFRESH_TOKEN,
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );
      if (newToken.access_token) {
        // Update environment variable or however you store it
        process.env.GOOGLE_ACCESS_TOKEN = newToken.access_token;

        // Retry the fetch operation once more with the new token
        return fetchGoogleSheetData(entry, { strapi });  // Recursively call the fetch function
      }
    }
  }
}

async function refreshGoogleToken(refreshToken, clientId, clientSecret) {
  const url = 'https://oauth2.googleapis.com/token';
  const params = new URLSearchParams();
  params.append('refresh_token', refreshToken);
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('grant_type', 'refresh_token');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error refreshing Google token:', error);
    return {};
  }
}

module.exports = {
  fetchGoogleSheetData,
};
