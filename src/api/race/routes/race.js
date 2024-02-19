// Not an actual file you need to create or edit for basic CRUD operations
// Just a conceptual representation

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/races',
      handler: 'race.find',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/races/:id',
      handler: 'race.findOne',
      config: {
        auth: false,
      },
    },
    // POST, PUT, DELETE routes for CRUD operations
  ],
};
