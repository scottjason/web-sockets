var Reflux = require('reflux');
var actions = require('../actions');

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(actions.getRoom, this.getRoom);
    this.listenTo(actions.openSocket, this.openSocket);
  },
  getRoom: function() {
    this.trigger('onEnterRoom', document.getElementById('room').value);
  },
  openSocket: function(roomName) {
    if (window.location.href.indexOf('localhost') > -1) {
      var url = 'ws://localhost:3000/' + roomName
    }
    this.trigger('onSocketReady', new WebSocket(url));
  },
});
