var cv = require('opencv'),
    Canvas = require('canvas'),
    qrcode = require('jsqrcode')(Canvas),
    Image = Canvas.Image,
    EventEmitter = require('events'),
    util = require('util');

module.exports = QrReader;

function QrReader () {
  var self = this;
  var camera;
  var capturing = false;
  var interval;

  self.startCapture = function () {
    if (capturing) {
      return;
    }
    camera = new cv.VideoCapture(0);
    capturing = true;

    interval = setInterval(run, 500);
  }

  self.stopCapture = function () {
    if (!capturing) {
      return;
    }
    camera.destroy();
    clearInterval(interval);
    capturing = false;
  }

  var run = function () {
    captureImage(function (image){
      self.emit('frame', image);
      parseQr(image, function (err, decoded) {
        if(!err) {
          self.emit('qrcode', decoded);
        }
      });
    });
  }

  var parseQr = function (imageBuffer, callback) {
    try {
      var image = new Image();
      image.src = imageBuffer;
      var result = qrcode.decode(image)
      callback (false, result);
    } catch (e) {
      callback (true);
    }
  }

  var captureImage = function (callback) {
    camera.read(function(err, camImg){
      if (!err) {
        callback(camImg.toBuffer());
      }
    });
  }
}

util.inherits(QrReader, EventEmitter);