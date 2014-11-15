// Load modules

var _ = require('lodash');
var Boom = require('boom');
var SocketIO = require('socket.io');
var uuid = require('uuid');


// Declare internals

var internals = {};

module.exports = internals.Manager = function (env) {
  this.env = env;
  this.io = null;
  this.roomsById = {};
  this.socketsById = {};
  this.users = {};
};

internals.Manager.prototype.initialize = function (server) {
  var self = this;

  this.io = SocketIO(server.listener);

  this.io.on('connection', function (socket) {
    server.log(['socket', 'info', 'event:connection'], 'A user connected');

    self.socketsById[socket.id] = socket;
    self.users[socket.id] = { id: socket.id, rooms: [] };

    socket.on('join room', function(roomId) {
      self.addMemberToRoom(roomId, socket.id);
      socket.join(roomId);
      server.log(['socket', 'info'], 'Added user ' + socket.id + ' to room '+ roomId);
      server.log(['debug'], self.roomsById[roomId]);
      socket.emit('room', self.roomsById[roomId]);
      socket.broadcast.to(roomId).emit('room', self.roomsById[roomId]);
    });

    socket.on('room message', function(id, msg) {
      if (self.users[socket.id].rooms.indexOf(id) > -1) {
        msg.id = socket.id;
        socket.broadcast.to(id).emit('msg', msg);
      }
    });

    socket.on('disconnect', function(connection) {
      _.each(self.users[socket.id].rooms, function(id) {
        self.removeMemberFromRoom(id, socket.id);
        server.log(['socket', 'info', 'event:disconnect'], 'Removed user '+ socket.id +' from room ' + id);
        socket.broadcast.to(id).emit('room', self.roomsById[id]);
      });
      server.log(['socket', 'info', 'event:disconnect'], 'A user disconnected');
    });

  });
};

internals.Manager.prototype.findOrCreateRoom = function(roomId) {
  var room = this.roomsById[roomId];
  if (room === undefined) {
    room = { members: [], id: roomId };
    this.roomsById[roomId] = room;
  }
  return room;
};

internals.Manager.prototype.addMemberToRoom = function(roomId, socketId) {
  var room = this.findOrCreateRoom(roomId);
  var user = this.users[socketId];
  if (room.members.indexOf(socketId) < 0) {
    room.members.push(socketId);
  }
  if (user.rooms.indexOf(roomId) < 0) {
    user.rooms.push(roomId);
  }
};

internals.Manager.prototype.removeMemberFromRoom = function(roomId, socketId) {
  var room = this.roomsById[roomId];
  var user = this.users[socketId];
  _.pull(room.members, socketId);
  _.pull(user.rooms, roomId);
};
