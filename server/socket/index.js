var _ = require('lodash');
var fs = require('fs');
var util = require('util');
var exec = require('child_process').exec;
var async = require('async');
var config = require('../config');
var path = require('path');
var ffmpeg = require('fluent-ffmpeg');
var AWS = require('aws-sdk');
var colors = require('colors');
var server = require('http').createServer();
var WebSocketServer = require('ws').Server;

AWS.config.update(config.aws.credens);
var s3Bucket = new AWS.S3();

var rooms = {};

module.exports = function(app) {

  var wss = new WebSocketServer({
    server: server
  });

  wss.on('connection', function connection(socket) {

    socket.on('message', function incoming(message) {

      message = JSON.parse(message);
      var type = message.type;

      if (type === 'roomCreated') {

        // if the room's already been created
        if (rooms.hasOwnProperty(message.roomName)) {

          // see if there's already two people in there
          var isTwoPeers = (rooms[message.roomName].length === 2);

          if (isTwoPeers) {
            var message = {
              type: 'roomOccupied'
            };
            message = JSON.stringify(message);
            socket.send(message);
          } else {

            // otherwise store the connection and tell the peer to create an offer
            var peer = {};
            peer.socket = socket;

            rooms[message.roomName].push(peer);

            var message = {
              type: 'createOffer'
            };
            message = JSON.stringify(message);
            socket.send(message);
          }
        } else {

          // if the rooms hasn't yet been created
          var peer = {};
          peer.socket = socket;

          rooms[message.roomName] = [];
          rooms[message.roomName].push(peer);

          var token = {
            type: 'roomCreated',
            roomName: message.roomName
          };

          token = JSON.stringify(token);
          socket.send(token);
        }
      } else if (type === 'offer') {

        // send the offer/answer/candidate to all the peers in the room except for the originating peer
        var roomName = message.roomName;
        message.type = 'handleOffer';
        message = JSON.stringify(message);
        _.forEach(rooms[roomName], function(peer) {
          if (peer.socket !== socket) {
            peer.socket.send(message)
          }
        });
      } else if (type === 'answer') {
        var roomName = message.roomName;
        message.type = 'handleAnswer';
        message = JSON.stringify(message);
        _.forEach(rooms[roomName], function(peer) {
          if (peer.socket !== socket) {
            peer.socket.send(message)
          }
        });
      } else if (type === 'candidate') {
        var roomName = message.roomName;
        message.type = 'handleCandidate';
        message = JSON.stringify(message);
        _.forEach(rooms[roomName], function(peer) {
          if (peer.socket !== socket) {
            peer.socket.send(message)
          }
        });
      } else if (type === 'mergeAV') {

        // write audio file to disk

        var audio = message.audio;

        var fileName = audio.name.split('.').shift();
        var awsKey = fileName + '-merged.webm';
        var targetPath = path.normalize(config.root + 'server/uploads/' + fileName + '-merged.webm');

        var fileExtension = audio.name.split('.').pop();
        var filePathBase = path.normalize(config.root + 'server/uploads/');
        var fileNameWithBase = filePathBase + fileName;
        var audioFilePath = fileNameWithBase + '.' + fileExtension;
        var fileBody = audio.contents.split(',').pop();
        var fileBuffer = new Buffer(fileBody, 'base64');

        console.log("** Audio File Path Created .. Writing File To ** ", audioFilePath);

        fs.writeFileSync(audioFilePath, fileBuffer);

        var video = message.video;

        var fileName = video.name.split('.').shift();
        var fileExtension = video.name.split('.').pop();
        var filePathBase = path.normalize(config.root + 'server/uploads/');
        var fileNameWithBase = filePathBase + fileName;
        var videoFilePath = fileNameWithBase + '.' + fileExtension;
        var fileBody = video.contents.split(',').pop();
        var fileBuffer = new Buffer(fileBody, 'base64');

        console.log("** Video File Path Created .. Writing File To ** ", videoFilePath);

        fs.writeFileSync(videoFilePath, fileBuffer);

        var command = "ffmpeg -i " + audioFilePath + " -i " + videoFilePath + " -map 0:0 -map 1:0 " + targetPath;

        exec(command, function(error, stdout, stderr) {
          if (stdout) console.log(stdout);
          if (stderr) console.log(stderr);
          if (error) {
            console.log('exec error: ' + error);
          } else {
            console.log("Files Merged .. Uploading To AWS");

            async.waterfall([
                function(cb) {
                  fs.readFile(targetPath, cb);
                },
                function(fileBody, cb) {
                  var params = {
                    Bucket: config.aws.bucketName,
                    Key: awsKey,
                    Body: fileBody,
                    ContentType: 'video/webm',
                    ACL: config.aws.acl
                  };

                  s3Bucket.putObject(params, cb);
                },
              ],
              function(err, results) {

                console.log("*** AWS Complete .. Sending To Client *** ", results);
                
                var message = {};
                message.type = 'videoReady';
                message.videoUrl = 'https://s3-us-west-1.amazonaws.com/rtc-upload/' + awsKey,
                message = JSON.stringify(message);
                socket.send(message);

                fs.unlinkSync(audioFilePath);
                fs.unlinkSync(videoFilePath);
                fs.unlinkSync(targetPath);
              });
          }
        });
      }

    });
  });

  server.on('request', app);
  server.listen(app.get('port'), function() {
    console.log('Listening on port '.green + (server.address().port).toString().green);
  });
};
