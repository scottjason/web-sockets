var _ = require('lodash');
var colors = require('colors');
var server = require('http').createServer();
var WebSocketServer = require('ws').Server;

var rooms = {};

module.exports = function(app) {

  var wss = new WebSocketServer({
    server: server
  });

  wss.on('connection', function connection(socket) {

    socket.on('message', function incoming(message) {

      message = JSON.parse(message);
      var type = message.type;

      if (type === 'roomCreated') {

        // if the room's already been created
        if (rooms.hasOwnProperty(message.roomName)) {

          // see if there's already two people in there
          var isTwoPeers = (rooms[message.roomName].length === 2);

          if (isTwoPeers) {
            var message = { type: 'roomOccupied' };
            message = JSON.stringify(message);
            socket.send(message);
          } else {

            // otherwise store the connection and tell the peer to create an offer
            var peer = {};
            peer.socket = socket;

            rooms[message.roomName].push(peer);

            var message = { type: 'createOffer' };
            message = JSON.stringify(message);
            socket.send(message);
          }
        } else {

          // if the rooms hasn't yet been created
          var peer = {};
          peer.socket = socket;

          rooms[message.roomName] = [];
          rooms[message.roomName].push(peer);

          var token = {
            type: 'roomCreated',
            roomName: message.roomName
          };

          token = JSON.stringify(token);
          socket.send(token);
        }
      } else if (type === 'offer') {

        // send the offer/answer/candidate to all the peers in the room except for the originating peer
        var roomName = message.roomName;
        message.type = 'handleOffer';
        message = JSON.stringify(message);
        _.forEach(rooms[roomName], function(peer) {
          if (peer.socket !== socket) {
            peer.socket.send(message)
          }
        });
      } else if (type === 'answer') {
        var roomName = message.roomName;
        message.type = 'handleAnswer';
        message = JSON.stringify(message);
        _.forEach(rooms[roomName], function(peer) {
          if (peer.socket !== socket) {
            peer.socket.send(message)
          }
        });
      } else
      if (type === 'candidate') {
        var roomName = message.roomName;        
        message.type = 'handleCandidate';
        message = JSON.stringify(message);
        _.forEach(rooms[roomName], function(peer) {
          if (peer.socket !== socket) {
            peer.socket.send(message)
          }
        });
      }
    });
  });

  server.on('request', app);
  server.listen(app.get('port'), function() {
    console.log('Listening on port '.green + (server.address().port).toString().green);
  });
};
