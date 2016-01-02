'use strict';

var Reflux = require('Reflux');
var actions = require('../actions');
var RoomStore = require('../stores/RoomStore');
var StyleSheet = require('react-style');
var Chat = require('./Chat');
var Footer = require('./Footer');

module.exports = React.createClass({
  mixins: [Reflux.ListenerMixin],
  getInitialState: function() {
    return {
      socket: actions.openSocket(this.props.params.roomName)
    };
  },
  componentDidMount: function() {
    this.listenTo(RoomStore, this.onStateChange);
  },
  onStateChange: function(cb, data) {
    if (typeof this[cb] === 'function') this[cb](data);
  },
  onSocketReady: function(socket) {
    this.setState({
      socket: socket
    });
    this.bindSocket();
    actions.getUserMedia();
  },
  onStreamReady: function() {
    actions.createRoom();
  },
  bindSocket: function() {
    this.state.socket.onmessage = function(event) {
      var data = JSON.parse(event.data);
      if (data.type === 'createOffer') {
        actions.createOffer();
      } else if (data.type === 'handleOffer') {
        actions.handleOffer(event);
      } else if (data.type === 'handleAnswer') {
        actions.handleAnswer(data);
      } else if (data.type === 'handleCandidate') {
        actions.handleCandidate(data);
      }
    }.bind(this);
  },
  render: function() {
    return (
        <div id='container' styles={styles.container}>
          <div id='small' styles={styles.small}></div>
          <div id='big' styles={styles.big}></div>          
          <Footer/>
        </div>
    )
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  big: {
    overflow: 'hidden',
    width: '100%'
  },
  small: {
    position: 'absolute',    
    top: '35px',
    width: '240px',
    height: '180px',
    marginRight: '30px',
    zIndex: 2
  }
});
