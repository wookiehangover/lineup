// Load modules

var Boom = require('boom');
var SocketIO = require('socket.io');


// Declare internals

var internals = {};

module.exports = internals.Manager = function (env) {
  this.env = env;
  this.updatesQueue = [];     // Updates queue
  this.socketsById = {};      // { _id_: { socket: _socket_, userId: _userId_ }, ... }
  this.idsByProject = {};     // { _projectId_: { _id_: true, ... }, ... }
  this.idsByUserId = {};      // { _userId_: { _id_: true, ... }, ... }
  this.projectsById = {};     // { _id_: { _projectId_: true, ... }, ... }
  this.io = null;
};

internals.Manager.prototype.initialize = function (server) {
  var self = this;

  this.io = SocketIO.listen(server.listener, { 'log level': 0 });
  this.io.sockets.on('connection', function (socket) {
    server.log(['socket', 'info', 'event:connection'], 'A user connected');
    // Add to sockets map
    self.socketsById[socket.id] = { socket: socket };

    // Setup handlers
    socket.on('message', function(socket) {
      server.log(['socket', 'info'], socket);
    });
    socket.on('disconnect', function(socket) {
      server.log(['socket', 'info', 'event:disconnect'], 'A user disconnected');
    });

    // Send session id
    socket.json.send({ type: 'connect', session: socket.id });
  });
};

