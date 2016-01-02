'use strict';

var Reflux = require('Reflux');
var actions = require('../actions');
var RoomStore = require('../stores/RoomStore');
var StyleSheet = require('react-style');
var Chat = require('./Chat');

module.exports = React.createClass({
  render: function() {
    return (
      <div styles={styles.wrapper}>
        <div styles={styles.tabs}>
          <p styles={styles.tab}>RECORD</p>
          <p styles={styles.tab}>SHARE FILE</p>
          <p styles={styles.tab}>DISCONNECT</p>
        </div>            
        <div styles={styles.container}></div>
      </div>
    )
  }
});

var styles = StyleSheet.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: '100%',
  },
  tabs: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',  
    width: '70%',
    height: '35px',
    paddingRight: '20px',
    marginTop: '30px'
  },
  tab: {
    display: 'flex',   
    flexDirection: 'row',
    alignItems: 'center',       
    marginLeft: '30px', 
    color: '#479ad0',
    height: '100%',
    fontSize: 14,
    textAlign: 'center'
  }
});
