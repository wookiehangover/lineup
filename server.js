var hapi = require('hapi');
var path = require('path');
var config = require('config');

var server = new hapi.Server('0.0.0.0', process.env.PORT || 5000);

var Streamer = require('./lib/streamer');
var streamer = new Streamer(server.app);

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
    plugin: require('./plugins/project-room'),
    options: {
      streamer: streamer
    }
  }
], function(err) {
  if (err) {
    throw err;
  }

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
    streamer.initialize(server);
    server.log(['info'], 'Server started at: ' + server.info.uri);
  });
});
