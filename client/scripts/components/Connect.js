'use strict';

var Reflux = require('Reflux');
var StyleSheet = require('react-style');
var Navigation = require('react-router').Navigation;
var SocketStore = require('../stores/SocketStore');
var actions = require('../actions');

module.exports = React.createClass({
  mixins: [Reflux.ListenerMixin, Navigation],
  getInitialState: function() {
    return {};
  },
  componentDidMount: function() {
    this.listenTo(SocketStore, this.onStateChange);
  },
  onStateChange: function(cb, data) {
    if (typeof this[cb] === 'function') this[cb](data);
  },
  onEnterRoom: function(room) {
    if (room.length) {
      this.props.history.pushState(null, '/' + room);
    }
  },
  render: function() {
    return (
      <div styles={styles.wrapper}>                  
        <div styles={styles.container}>           
          <input id='room' styles={styles.roomInput} placeholder='ROOM NAME'></input>
          <div styles={styles.joinBtn} onClick={actions.getRoom}>
            <p styles={styles.joinCopy}>JOIN</p>
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
    backgroundColor: '##455A64'
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
    backgroundColor: '#455A64',
    border: 'none',
    borderBottom: '1px solid #CFD8DC',
    width: '240px',
    height: '35px',
    color: 'rgba(225, 225, 225, .9)',
    outline: 0,
    fontSize: '16px',
    textAlign: 'center'
  },
  joinBtn: {
    backgroundColor: '#455A64',
    border: '1px solid #CFD8DC',
    marginTop: '12px',
    width: '140px',
    height: '30px',
    textAlign: 'center',
    cursor: 'pointer'
  },
  joinCopy: {
    color: '#CFD8DC',
    fontSize: '14px',    
    letterSpacing: '1px',
    marginTop: 4
  }
});
