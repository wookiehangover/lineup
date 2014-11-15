var assert = require('chai').assert;
var RoomManager = require('../../lib/room-manager');

describe('Room Manager', function() {
  beforeEach(function() {
    this.manager = new RoomManager({});
    this.manager.users = { 'user1': { id: 'user1', rooms: [] } };
  });

  describe('addMemberToRoom', function() {
    it('should create a new room and add a user to it', function() {
      var roomId = 54321;
      this.manager.addMemberToRoom(roomId, 'user1');
      assert.include(this.manager.roomsById[roomId].members, 'user1');
    });

    it('should add a user to an existing room', function() {
      var roomId = 'myRoom';
      // mock the user as if they've joined the room
      this.manager.users.user2 = { id: 'user2', rooms: [] };
      this.manager.roomsById[roomId] = { id: roomId, members: ['user1'] };
      this.manager.addMemberToRoom(roomId, 'user2');
      assert.include(this.manager.roomsById[roomId].members, 'user2');
    });

    it('does not add the same user to a room more than once', function() {
      var roomId = 'myRoom';
      this.manager.roomsById[roomId] = { id: roomId, members: ['user1'] };
      this.manager.addMemberToRoom(roomId, 'user1');
      assert.lengthOf(this.manager.roomsById[roomId].members, 1);
    });

    it('should add the room to the users list of known rooms', function() {
      var roomId = 'myRoom';
      this.manager.addMemberToRoom(roomId, 'user1');
      assert.lengthOf(this.manager.users.user1.rooms, 1);
    });

    it('should not add the room to the users list of rooms more than once', function() {
      var roomId = 'myRoom';
      this.manager.addMemberToRoom(roomId, 'user1');
      this.manager.addMemberToRoom(roomId, 'user1');
      assert.lengthOf(this.manager.users.user1.rooms, 1);
    });
  });

  describe('findOrCreateRoom', function() {
    it('should create a new room', function() {
      var room = this.manager.findOrCreateRoom('room1');
      assert.equal(room.id, 'room1');
      assert.typeOf(room.members, 'array');
    });

    it('should find a room if it already exists', function() {
      this.manager.roomsById['room1'] = { id: 'room1' };
      var room = this.manager.findOrCreateRoom('room1');
      assert.equal(room.id, 'room1');
    });
  });

  describe('removeMemberFromRoom', function() {
    beforeEach(function() {
      this.manager.addMemberToRoom('room1', 'user1');
      assert.lengthOf(this.manager.roomsById['room1'].members, 1);
      assert.lengthOf(this.manager.users.user1.rooms, 1);
    });

    it('should remove the member from the specified room', function() {
      this.manager.removeMemberFromRoom('room1', 'user1');
      assert.lengthOf(this.manager.roomsById['room1'].members, 0);
    });

    it('should remove the room from the members list of rooms', function() {
      this.manager.removeMemberFromRoom('room1', 'user1');
      assert.lengthOf(this.manager.users.user1.rooms, 0);
    });
  });

});
