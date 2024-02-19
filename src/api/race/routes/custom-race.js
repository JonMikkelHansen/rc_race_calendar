module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/races-with-stages', // Custom path
      handler: 'race.findWithStages', // Points to your custom controller method
      config: {
        auth: false, // Modify as per your auth requirements
      },
    },
    // No changes needed for the default '/races' endpoint; it's handled automatically
  ],
};
