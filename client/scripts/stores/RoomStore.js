var Reflux = require('reflux');
var actions = require('../actions');
var uuid = require('node-uuid');

var state = {};

module.exports = Reflux.createStore({
  init: function() {
    this.listenTo(actions.createRoomName, this.createRoomName);
    this.listenTo(actions.createRoom, this.createRoom);
    this.listenTo(actions.joinRoom, this.joinRoom);
    this.listenTo(actions.openSocket, this.openSocket);
    this.listenTo(actions.createOffer, this.createOffer);
    this.listenTo(actions.getUserMedia, this.getUserMedia);
    this.listenTo(actions.handleOffer, this.handleOffer);
    this.listenTo(actions.handleAnswer, this.handleAnswer);
    this.listenTo(actions.handleCandidate, this.handleCandidate);
  },
  generateId: function() {
    return uuid.v1();
  },
  createRoomName: function() {
    this.trigger('onRoomNameCreated', document.getElementById('room').value);
  },
  openSocket: function(roomName) {
    var url = 'ws://localhost:3000/' + roomName;    
    state.roomName = roomName;
    state.roomId = this.generateId();
    state.socket = new WebSocket(url);
    this.trigger('onSocketReady', state.socket);
  },
  createRoom: function() {
    var opts = {};
    opts.type = 'roomCreated';
    opts.roomId = state.roomId;
    opts.roomName = state.roomName;
    opts.streamId = state.stream.id;
    opts = JSON.stringify(opts);
    state.socket.send(opts);
  },
  getUserMedia: function() {

    var contstraints = { audio: true, video: true };
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(contstraints, onSuccess.bind(this), onError.bind(this));

    function onSuccess(stream) {

      var container = document.getElementById('small');
      var video = document.createElement('video');
      video.src = window.URL.createObjectURL(stream);
      
      var config = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };      
      var peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
      
      state.peer = new peerConnection(config);
      state.peer.addStream(stream);

      state.video = video;
      state.stream = stream;
      container.appendChild(video);
      video.play();
      this.trigger('onStreamReady');

      state.peer.onicecandidate = function(e) {
        if (!e.candidate || !e.candidate.sdpMid) return;
        var message = {
          type: 'candidate',
          roomId: state.roomId,
          roomName: state.roomName,
          payload: e.candidate
        };
        message = JSON.stringify(message);
        state.socket.send(message);
      }
      
      state.peer.onaddstream = function(event) {
        state.peer.addStream(event.stream);
        var container = document.getElementById('big');
        var video = document.createElement('video');
        video.src = window.URL.createObjectURL(event.stream);
        container.appendChild(video);
        video.play();
      };
    }

    function onError(err) {
      console.log('Error occurred: ' + err.name);
    }
  },
  handleOffer: function(event) {
    
    var message = JSON.parse(event.data);
    var sessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;

    state.peer.setRemoteDescription(new sessionDescription(message.payload), function() {
      state.peer.createAnswer(function(answer) {
        state.peer.setLocalDescription(answer, function() {
          var message = {
            type: 'answer',
            roomId: state.roomId,
            roomName: state.roomName,
            payload: answer
          };
          message = JSON.stringify(message);
          state.socket.send(message);
        });
      });
    });
  },
  handleCandidate: function(message) {
    state.peer.addIceCandidate(new RTCIceCandidate(message.payload));
  },
  handleAnswer: function(message) {
    var sessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
    state.peer.setRemoteDescription(new sessionDescription(message.payload), function() {
      console.debug('handleAnswer, remote description set');
    });
  },
  createOffer: function() {
    
    var sessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
    
    state.peer.createOffer(function(offer) {
      state.peer.setLocalDescription(new sessionDescription(offer), function() {
        var message = {
          type: 'offer',
          roomId: state.roomId,
          roomName: state.roomName,
          payload: offer
        };
        message = JSON.stringify(message);
        state.socket.send(message);
      });
    });
  }
});
