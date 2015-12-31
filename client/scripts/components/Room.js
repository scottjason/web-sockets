'use strict';

var Reflux = require('Reflux');
var actions = require('../actions');
var SocketStore = require('../stores/SocketStore');
var StyleSheet = require('react-style');

module.exports = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getInitialState: function() {
    return { socket: actions.openSocket(this.props.params.roomName), message: 'Not Connected' };
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
    this.renderMirror();    
  },
  bindEvents: function() {
    this.state.socket.onmessage = function(event) {
      this.setState({ message: event.data });
    }.bind(this);
  },
  renderMirror: function() {
    CodeMirror.fromTextArea(document.getElementById('mirror'), { mode: 'javascript' });
  },  
  render: function() {
    return (
      <div styles={styles.wrapper}>                  
        <div styles={styles.container}>                  
          <textarea id='mirror'></textarea>
        </div>
      </div>
    )
  }
});

var styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: 15,
    backgroundColor: '#455A64'
  },
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  }
});
