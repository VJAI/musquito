function loadBuffer(context, src, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', src, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
    context.decodeAudioData(xhr.response, function (buffer) {
      cb(buffer);
    });
  };

  xhr.send();
}
