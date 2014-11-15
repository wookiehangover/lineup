var hapi = require('hapi');
var path = require('path');
var config = require('config');

var server = new hapi.Server('0.0.0.0', process.env.PORT || 5000);

var RoomManager = require('./lib/room-manager');
var manager = new RoomManager(server.app);

server.views({
  engines: {
    html: require('swig')
  },
  path: path.join(__dirname, 'templates')
});

server.pack.register([
  {
    plugin: require('good')
  },
  {
    plugin: require('hapi-assets'),
    options: config.assets
  },
  {
    plugin: require('./plugins/session')
  },
  {
    plugin: require('./plugins/home'),
  },
  {
    plugin: require('./plugins/product-room'),
    options: {
      manager: manager
    }
  }
], function(err) {
  if (err) {
    throw err;
  }

  server.route({
    method: 'GET',
    path: '/room/{id}',
    handler: function(request, reply) {
      reply.view('mobile-room', {
        room: request.params.id
      });
    }
  });

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: 'public',
        listing: true
      }
    }
  });

  server.start(function() {
    manager.initialize(server);
    server.log(['info'], 'Server started at: ' + server.info.uri);
  });
});
