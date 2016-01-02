var Reflux = require('reflux');

module.exports = Reflux.createActions([
  'createRoom',	
  'createRoomName',	
  'joinRoom',
  'openSocket',
  'getUserMedia',
  'createOffer',
  'handleOffer',
  'handleAnswer',
  'handleCandidate'
]);