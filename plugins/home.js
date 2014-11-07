var sprintly = require('../lib/sprintly');

exports.register = function(plugin, options, next) {
  plugin.route([
    {
      method: 'GET',
      path: '/',
      handler: function(request, reply) {
        if (request.auth.isAuthenticated) {
          return sprintly.fetchProducts(request.auth.credentials)
            .then(function(products) {
              reply.view('home', {
                title: 'Sprintly Lineup',
                user: request.auth.credentials,
                products: products.toJSON()
              });
            })
            .catch(function(err) {
              plugin.log(['error', 'home'], err);
              reply(500);
            });
        }

        reply.view('home', {
          title: 'Sprintly Lineup',
          user: request.auth.credentials
        });
      },
      config: {
        auth: {
          mode: 'try',
          strategy: 'session',
        },
        plugins: {
          'hapi-auth-cookie': {
            redirectTo: false
          }
        }
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'Home',
  version: '1.0.0'
};

