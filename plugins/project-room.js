var sprintly = require('../lib/sprintly');

exports.register = function(plugin, options, next) {

  if (!options.streamer) {
    throw new Error('Streamer instance is required');
  }

  var streamer = options.streamer;

  plugin.route([
    {
      method: 'GET',
      path: '/product/{id}',
      handler: function(request, reply) {
        sprintly.fetchProduct(request.auth.credentials, request.params.id)
          .then(function(product) {
            reply.view('room', {
             user: request.auth.credentials,
             product: product
            });
          })
          .catch(function(err) {
            plugin.log(['error', 'project-room'], err);
            reply(500);
          });
      },
      config: {
        auth: 'session'
      }
    }
  ]);

  next();
};

exports.register.attributes = {
  name: 'Project Room',
  version: '1.0.0'
};
