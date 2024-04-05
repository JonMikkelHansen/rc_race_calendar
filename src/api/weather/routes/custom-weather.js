module.exports = {
    routes: [
      {
        method: 'GET',
        path: '/weather',
        handler: 'weather.findOne',
        config: {
          auth: false,
        },
      },
    ],
  };
  