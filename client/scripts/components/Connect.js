'use strict';

var Reflux = require('Reflux');
var StyleSheet = require('react-style');
var Navigation = require('react-router').Navigation;
var RoomStore = require('../stores/RoomStore');
var actions = require('../actions');

module.exports = React.createClass({
  mixins: [Reflux.ListenerMixin, Navigation],
  getInitialState: function() {
    return { socket: actions.openSocket() };
  },
  componentDidMount: function() {
    this.listenTo(RoomStore, this.onStateChange);
  },
  onStateChange: function(cb, data) {
    if (typeof this[cb] === 'function') this[cb](data);
  },
  onRoomNameCreated: function(roomName) {
    if (roomName.length) this.props.history.pushState(null, '/' + roomName);
  },
  render: function() {
    return (
      <div styles={styles.wrapper}>                  
        <div styles={styles.container}>           
          <input id='room' styles={styles.roomInput} placeholder='ROOM NAME'></input>
          <div styles={styles.joinBtn} onClick={actions.createRoomName}>
            <p styles={styles.joinCopy}>JOIN ROOM</p>
          </div>          
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
    backgroundColor: '#1c262f'
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%'
  },
  roomInput: {
    backgroundColor: '#1c262f',
    border: 'none',
    borderBottom: '1px solid #f9ffff',
    width: '240px',
    height: '35px',
    color: '#f9ffff',
    outline: 0,
    fontSize: '16px',
    textAlign: 'center'
  },
  joinBtn: {
    backgroundColor: '#1c262f',
    border: '1px solid #f9ffff',
    marginTop: '12px',
    width: '160px',
    height: '40px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  joinCopy: {
    color: '#f9ffff',
    fontSize: '16px',    
    letterSpacing: '1px',
    marginTop: 8
  }
});
