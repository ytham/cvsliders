var video = document.getElementById('video');
var inputVideo = document.getElementById('inputVideo');
var canvas = document.getElementById('canvas');
var fps = 10;
var context = canvas.getContext('2d');
var inputContext = inputVideo.getContext('2d');
var width = 640;
var height = 0;
var streaming = false;

// HSV Values
var hLow = 0;
var hHigh = 180;
var sLow = 0;
var sHigh = 256;
var vLow = 0;
var vHigh = 256;

var socket = io.connect();
socket.on('start', function (data) {
  console.log(data);
});

navigator.getMedia = ( navigator.getUserMedia || 
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia || 
                       navigator.msGetUserMedia );

navigator.getMedia({ video: true, audio: false }, function (stream) {
  if (navigator.mozGetUserMedia) {
    video.mozSrcObject = stream;
  } else {
    var vendorURL = window.URL || window.webkitURL;
    video.src = vendorURL.createObjectURL(stream);
  }
  //video.play();
}, function (err) {
  console.log('[ERROR] navigator.getMedia: ' + err);
});

video.addEventListener('canplay', function (ev) {
  if (!streaming) {
    height = video.videoHeight / (video.videoWidth/width);
    video.setAttribute('width', width);
    video.setAttribute('height', height);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    streaming = true;
  }
}, false);

function emitFrame () {
  inputContext.drawImage(video, 0, 0, 640, 480);
  socket.emit('hsv', { 
    hLow: hLow,
    hHigh: hHigh,
    sLow: sLow,
    sHigh: sHigh,
    vLow: vLow,
    vHigh: vHigh
  });
  socket.emit('frame', inputVideo.toDataURL('image/jpeg'));
}

socket.on('filteredVideo', function (video) {
  $('#title').html('<img src="' + video + '">');
  //context.drawImage(video, 0, 0, 640, 480);
});

setInterval(function () {
  emitFrame();
}, 1000/fps);


// Web Interface
$('.button').mouseover(function () {
  $(this).addClass('buttonHover');
});

$('.button').mouseout(function () {
  $(this).removeClass('buttonHover');
});

$('.button').click(function () {
  var action = $(this).text();
  socket.emit(action, action);
  console.log(action);
});


$("#hSlider").slider({
  range: true,
  min: 0,
  max: 180,
  values: [ 0, 180 ],
  slide: function( event, ui ) {
    hLow = ui.values[0];
    hHigh = ui.values[1];
    $("#hValue1").val(hLow);
    $("#hValue2").val(hHigh);
  }
});
$("#hValue1").val(hLow);
$("#hValue2").val(hHigh);

$("#sSlider").slider({
  range: true,
  min: 0,
  max: 256,
  values: [ 0, 256 ],
  slide: function( event, ui ) {
    sLow = ui.values[0];
    sHigh = ui.values[1];
    $("#sValue1").val(sLow);
    $("#sValue2").val(sHigh);
  }
});
$("#sValue1").val(sLow);
$("#sValue2").val(sHigh);

$("#vSlider").slider({
  range: true,
  min: 0,
  max: 256,
  values: [ 0, 256 ],
  slide: function( event, ui ) {
    vLow = ui.values[0];
    vHigh = ui.values[1];
    $("#vValue1").val(vLow);
    $("#vValue2").val(vHigh);
  }
});
$("#vValue1").val(vLow);
$("#vValue2").val(vHigh);