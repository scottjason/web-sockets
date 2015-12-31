var url = require('url');
var colors = require('colors');
var server = require('http').createServer();
var WebSocketServer = require('ws').Server;

module.exports = function(app) {

  var wss = new WebSocketServer({ server: server });

  wss.on('connection', function connection(socket) {

    socket.on('message', function incoming(message) {
      console.log('received: %s', message);
    });
    socket.send('Connected');
  });

  server.on('request', app);
  server.listen(app.get('port'), function() {
    console.log('Listening on port '.green + (server.address().port).toString().green);
  });
};
