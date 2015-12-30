'use strict';

var Reflux = require('Reflux');
var actions = require('../actions');
var SocketStore = require('../stores/SocketStore');

module.exports = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getInitialState: function() {
    return { socket: actions.openSocket(), message: 'Not Connected' };
  },
  componentDidMount: function() {
    this.listenTo(SocketStore, this.onStateChange);
  },
  onStateChange: function(cb, data) {
    if (typeof this[cb] === 'function') this[cb](data);
  },
  onSocketReady: function(socket) {
    this.setState({ socket: socket });
    this.bindEvents();
  },
  bindEvents: function() {
    this.state.socket.onmessage = function(event) {
      this.setState({ message: event.data });
    }.bind(this);
  },
  render: function() {
    return (
      <div className='wrapper'>                  
        <div className='container'>                  
          <p className='message'>{this.state.message}</p>
        </div>
      </div>
    )
  }
});
