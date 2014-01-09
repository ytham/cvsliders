var fs = require('fs'),
    url = require('url'),
    cv = require('opencv'),
    express = require('express');

// Initialize webserver & socket.io
var app = express();
var server = app.listen(8888, "0.0.0.0");
var io = require('socket.io').listen(server);

var hLow = 0;
var hHigh = 180;
var sLow = 0;
var sHigh = 256;
var vLow = 0;
var vHigh = 256;

// Express setup
app.use(express.static(__dirname + '/'));
app.use(express.bodyParser());

io.sockets.on('connection', function (socket) {
  socket.emit('start', { data: 'Websocket connection started.' });

  // CV Frame from webcam
  socket.on('frame', function (data) {
    //socket.emit('output', data);
    data = data.split(',');
    cv.readImage(new Buffer(data[1],'base64'), function (err, im) {
      // Convert and filter the RGB image
      im.convertHSVscale();
      im.gaussianBlur([7,7]);
      im.save('./out_hsv.png');
      im.inRange([hLow,sLow,vLow],[hHigh,sHigh,vHigh]);
      im.save('./out_inrange.png');
      socket.emit('filteredVideo', data[0] + im);      
    });
  });

  socket.on('hsv', function (hsv) {
    hLow = hsv.hLow;
    hHigh = hsv.hHigh;
    sLow = hsv.sLow;
    sHigh = hsv.sHigh;
    vLow = hsv.vLow;
    vHigh = hsv.vHigh;
  });
});

process.on('uncaughtException', function (err) {
  console.error(err);
});