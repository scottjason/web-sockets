var React = window.React = require('react');
var ReactDOM = require("react-dom");

ReactDOM.render((
  <div>
  	<p> D</p>
  </div>
), document.getElementById('main'));



function init(url) {
console.log("HELLO")
  this.socket = new WebSocket(url);

  console.log('socket', this.socket);
  console.log('React', React);

  this.socket.onmessage = function(event) {
  	console.log("Received Message ", event);
  };
}

init('ws://localhost:3000');