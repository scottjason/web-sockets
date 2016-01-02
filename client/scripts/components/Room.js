'use strict';

var Reflux = require('Reflux');
var actions = require('../actions');
var RoomStore = require('../stores/RoomStore');
var StyleSheet = require('react-style');
var Chat = require('./Chat');

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
      } else if (data.type === 'incomingOffer') {
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
      <div styles={styles.wrapper}>    
        <Chat/>
        <div id='container' styles={styles.container}>
          <div id='small' styles={styles.small}></div>
          <div id='big' styles={styles.big}></div>          
        </div>
      </div>
    )
  }
});

var styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100%',
    margin: 'auto',
    backgroundColor: 'transparent',
    paddingLeft: '30px'
  },
  big: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: '100%',
    width: '100%',
    marginLeft: '260px'
  },
  small: {
    position: 'absolute',
    top: '35px',
    width: '320px',
    height: '240px',
    marginRight: '30px'
  }
});
