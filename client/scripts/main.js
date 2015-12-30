function init(url) {

  this.socket = new WebSocket(url);

  console.log('socket', this.socket);

  this.socket.onmessage = function(event) {
  	console.log("Received Message ", event);
  };
}


init('ws://localhost:3000');