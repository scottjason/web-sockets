'use strict';

var Reflux = require('Reflux');
var actions = require('../actions');
var RoomStore = require('../stores/RoomStore');
var StyleSheet = require('react-style');
var Chat = require('./Chat');

module.exports = React.createClass({
  render: function() {
    return (
      <div styles={styles.container}>
          <p styles={styles.loading}>WAITING FOR A CONNECTION</p>
      </div>
    )
  }
});

var styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60px',
    width: '100%',
    backgroundColor: '#1c262f',
    color: '#78CEE0',
    zIndex: 3,
    textAlign: 'center'
  },
  loading: {
    marginTop: '22px'
  }
});
