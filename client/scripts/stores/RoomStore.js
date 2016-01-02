var Reflux = require('reflux');
var actions = require('../actions');
var uuid = require('node-uuid');

var isFirefox = !!navigator.mozGetUserMedia;
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
    this.listenTo(actions.stopRecording, this.stopRecording);
  },
  stopRecording: function() {
    console.log('stop recording');
    state.audioStream.stopRecording();
    state.videoStream.stopRecording();
    state.audioStream.getDataURL(function(audioDataURL) {
      state.videoStream.getDataURL(function(videoDataURL) {
        var files = {};
        var fileName = uuid.v1();

        files.audio = {
          name: fileName + (isFirefox ? '.webm' : '.wav'),
          type: isFirefox ? 'video/webm' : 'audio/wav',
          contents: audioDataURL
        };

        if (!isFirefox) {
          files.video = {
            name: fileName + '.webm',
            type: 'video/webm',
            contents: videoDataURL
          };
        }

        files.type = 'mergeAV';
        files = JSON.stringify(files);
        state.socket.send(files);
      });
    });
  },
  createRoomName: function() {
    this.trigger('onRoomNameCreated', document.getElementById('room').value);
  },
  openSocket: function(roomName) {
    var url = 'ws://localhost:3000/' + roomName;
    state.roomName = roomName;
    state.socket = new WebSocket(url);
    this.trigger('onSocketReady', state.socket);
  },
  createRoom: function() {
    console.debug("** Create Room **");
    var opts = {};
    opts.type = 'roomCreated';
    opts.roomName = state.roomName;
    opts = JSON.stringify(opts);
    state.socket.send(opts);
  },
  getUserMedia: function() {
    console.debug("** Get UserMedia **");
    var contstraints = {
      audio: true,
      video: true
    };
    navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia(contstraints, onSuccess.bind(this), onError.bind(this));

    function onSuccess(stream) {

      var container = document.getElementById('big');
      var video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      state.ownStream = stream;
      video.src = window.URL.createObjectURL(stream);

      var config = { iceServers: [{ url: 'stun:stun.l.google.com:19302' }] };
      var peerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;

      state.peer = new peerConnection(config);
      state.peer.addStream(stream);

      state.video = video;
      state.stream = stream;
      container.appendChild(video);
      this.trigger('onStreamReady');

      state.peer.oniceconnectionstatechange = function() {
        if (state.peer.iceConnectionState == 'disconnected') {
          console.log('Disconnected');
        }
      };

      state.peer.onicecandidate = function(e) {
        console.log('onicecandidate', e);
        if (!e.candidate || !e.candidate.sdpMid) return;
        var message = {
          type: 'candidate',
          roomId: state.roomId,
          roomName: state.roomName,
          payload: e.candidate
        };
        message = JSON.stringify(message);
        state.socket.send(message);
      };

      state.peer.onaddstream = function(event) {
        
        state.peer.addStream(event.stream);

        var big = document.getElementById('big');
        var small = document.getElementById('small');

        var video = document.querySelector('video');

        big.removeChild(video);

        var video = document.createElement('video');
        video.src = window.URL.createObjectURL(state.ownStream);
        video.autoplay = true;
        video.muted = true;
        small.appendChild(video);

        var video = document.createElement('video');
        video.src = window.URL.createObjectURL(event.stream);
        video.autoplay = true;
        video.muted = false;
        big.appendChild(video);

        state.audioStream = RecordRTC(event.stream, { bufferSize: 16384 });
        state.videoStream = RecordRTC(event.stream, { type: 'video' });

        state.audioStream.startRecording();
        state.videoStream.startRecording();
      };
    }

    function onError(err) {
      console.log('Error occurred: ' + err.name);
    }
  },
  handleOffer: function(event) {
    console.debug("** Handle Offer **");
    var message = JSON.parse(event.data);
    var sessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;

    state.peer.setRemoteDescription(new sessionDescription(message.payload), function() {
      state.peer.createAnswer(function(answer) {
        state.peer.setLocalDescription(answer, function() {
          var message = {
            type: 'answer',
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
    console.debug("** Handle Candidate **", message);
    state.peer.addIceCandidate(new RTCIceCandidate(message.payload));
  },
  handleAnswer: function(message) {
    console.debug("** Handle Answer **");
    var sessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
    state.peer.setRemoteDescription(new sessionDescription(message.payload), function() {});
  },
  createOffer: function() {
    console.debug("** Create Offer **");
    var sessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;

    state.peer.createOffer(function(offer) {
      state.peer.setLocalDescription(new sessionDescription(offer), function() {
        var message = {
          type: 'offer',
          roomName: state.roomName,
          payload: offer
        };
        message = JSON.stringify(message);
        state.socket.send(message);
      });
    });
  }
});
