/**
 * Main Config
 */

'use strict';

var path = require('path');
var env = (process.env.NODE_ENV === 'production') ? {} : require('../../env.js');


module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  root: path.normalize(__dirname + '../../../'),
  aws: {
    bucketName: process.env.AWS_BUCKET_NAME || env.aws.bucketName,
    acl: 'public-read',
    base: 'rtc-upload.s3-website-us-west-2.amazonaws.com/',
    credens: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || env.aws.accessKeyId,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || env.aws.secretAccessKey,
      region: 'us-west-1'
    }
  }
};