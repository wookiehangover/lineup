var sprintly = require('../lib/sprintly');
var uuid = require('uuid');

exports.register = function(plugin, options, next) {

  if (!options.manager) {
    throw new Error('RoomManager instance is required');
  }

  var manager = options.manager;

  plugin.route([
    {
      method: 'GET',
      path: '/product/{id}',
      handler: function(request, reply) {
        sprintly.fetchProduct(request.auth.credentials, request.params.id)
          .then(function(product) {
            reply.view('product-room', {
             user: request.auth.credentials,
             product: product,
             room: product.id
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
  name: 'Product Room',
  version: '1.0.0'
};
