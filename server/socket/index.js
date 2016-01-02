var url = require('url');
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

      console.log("message", message);

      message = JSON.parse(message);

      var type = message.type;

      if (type === 'roomCreated') {

        if (rooms.hasOwnProperty(message.roomName)) {
          
          var opts = { type: 'createOffer' };
          opts = JSON.stringify(opts);

          rooms[message.roomName] = {
            creatorStreamId: message.streamId,
            guestSocket: socket
          };
          socket.send(opts);
          return;
        }

        rooms[message.roomName] = {
          creatorStreamId: message.streamId,
          creatorSocket: socket
        };

        var token = {
          type: 'roomCreated',
          roomId: message.roomId,
          roomName: message.roomName,
          creatorStreamId: message.streamId
        };

        token = JSON.stringify(token);
        wss.clients.forEach(function(client) {
          client.send(token);
        });
      } else if (type === 'offer') {

        message.type = 'incomingOffer';
        message = JSON.stringify(message);
        wss.clients.forEach(function(client) {
          var isGuestSocket = (socket === client);
          if (isGuestSocket) return;
          client.send(message);
        });
      } else if (type === 'answer') {
        message.type = 'handleAnswer';
        message = JSON.stringify(message);
        wss.clients.forEach(function(client) {
          var isMatch = (socket === client);
          if (isMatch) return;
          client.send(message);
        });
      } else
      if (type === 'candidate') {
        message.type = 'handleCandidate';
        message = JSON.stringify(message);
        wss.clients.forEach(function(client) {
          var isMatch = (socket === client);
          if (isMatch) return;
          client.send(message);
        });
      }
    });
  });

  server.on('request', app);
  server.listen(app.get('port'), function() {
    console.log('Listening on port '.green + (server.address().port).toString().green);
  });
};
