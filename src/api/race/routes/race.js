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
      {
        method: 'POST',
        path: '/races',
        handler: 'race.create',
        config: {
          auth: false,
        },
      },
      {
        method: 'PUT',
        path: '/races/:id',
        handler: 'race.update',
        config: {
          auth: false,
        },
      },
      {
        method: 'DELETE',
        path: '/races/:id',
        handler: 'race.delete',
        config: {
          auth: false,
        },
      },
    ],
  };
  