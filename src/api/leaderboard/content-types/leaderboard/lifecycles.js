module.exports = {
  afterCreate: async (event) => {
    const { fetchGoogleSheetData } = require('../../services/leaderboard');
    let standingsData;
    try {
      // Attempt to fetch data from Google Sheets
      standingsData = await fetchGoogleSheetData();
      // Check if data is empty or undefined
      if (!standingsData || standingsData.length === 0) {
        throw new Error("Fetched data is empty or undefined.");
      }
    } catch (error) {
      console.error("Failed to fetch data from Google Sheets, using dummy data instead:", error);
      // Fallback dummy data
      standingsData = [
        { name: "John Doe", team: "Team Alpha", points: 100 },
        { name: "Jane Smith", team: "Team Beta", points: 150 }
      ];
    }

    // Update the leaderboard entry with either fetched data or dummy data
    await strapi.entityService.update('api::leaderboard.leaderboard', event.result.id, {
      data: {
        standings: standingsData,
      },
    }).then(() => {
      console.log("Standings data inserted successfully");
    }).catch(updateError => {
      console.error('Error updating standings data:', updateError);
    });
  },
};
