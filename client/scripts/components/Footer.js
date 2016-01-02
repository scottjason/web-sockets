'use strict';

var Reflux = require('Reflux');
var actions = require('../actions');
var RoomStore = require('../stores/RoomStore');
var StyleSheet = require('react-style');
var actions = require('../actions');

module.exports = React.createClass({
  render: function() {
    return (
      <div styles={styles.container}>    
        <div styles={styles.recordCircle}>
        <i className='icon-mic' onClick={actions.stopRecording}></i>
        </div>
      </div>
    )
  }
});

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    display: 'flex',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    width: '100%',
    backgroundColor: '#fff',
    color: '#2fa7e6',
    zIndex: 3,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center'
  },
  recordCircle: {
    width: 50,
    height: 50,
    borderRadius: '100%',
    backgroundColor: '#e05a57'
  },
  optCopy: {
    fontSize: '18px',
    color: 'white',
    fontWeight: 400,
    paddingLeft: '10px',
    paddingRight: '10px'
  }
});
