var Reflux = require('reflux');
var actions = require('../actions');

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(actions.openSocket, this.openSocket);
  },
  openSocket: function() {
    this.trigger('onSocketReady', new WebSocket('ws://localhost:3000'));
  },
});
