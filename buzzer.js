(function (ctxClass) {

  'use strict';

  var DEBUG = 'ON', emptyFn = function () {
  }, log = (function () {
    return DEBUG === 'ON' ? function (message, type) {
      console[type || 'log'](message);
    } : emptyFn;
  })();

  var BuzzerState = {
    Constructed: 0,
    Ready: 1,
    Done: 2
  };

  /**
   * Buzzer
   * @constructor
   */
  function Buzzer() {
    this.ctx = null;
    this.muted = false;
    this.vol = 1.0;
    this.state = BuzzerState.Constructed;
  }

  Buzzer.prototype.setup = function (context) {
    if (this.state === BuzzerState.Ready) {
      return;
    }

    this.ctx = context || new ctxClass();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = this.vol;
    this.gain.connect(this.ctx.destination);
    this.state = BuzzerState.Ready;
  };

  Buzzer.prototype.volume = function (vol) {
    var volume = parseFloat(vol);

    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return;
    }

    this.setup();

    this.vol = volume;
    this.gain.value = this.vol;
    return this.gain.value;
  };

  Buzzer.prototype.mute = function () {
    if (this.muted) {
      return;
    }

    this.setup();

    this.gain.gain.value = 0;
    this.muted = true;
  };

  Buzzer.prototype.unmute = function () {
    if (!this.muted) {
      return;
    }

    this.setup();

    this.gain.gain.value = this.vol;
    this.muted = false;
  };

  Buzzer.prototype.tearDown = function () {
    this.state = BuzzerState.Done;
  };

  Buzzer.prototype.context = function () {
    return this.ctx;
  };

  Buzzer.prototype.isMuted = function () {
    return this.muted;
  };

  var buzzer = new Buzzer(), cache = {};

  var BuzzState = {
    Constructed: 0,
    Playing: 1,
    Paused: 2,
    Stopped: 3
  };

  /**
   * Buzz
   * @param args
   * @constructor
   */
  function Buzz(args) {
    buzzer.setup();

    this.id = Math.round(Date.now() * Math.random());
    this.src = args.src;
    this.vol = args.volume || 1.0;
    this.buffer = null;
    this.duration = 0;
    this.muted = false;
    this.endTimer = null;
    this.bufferSource = null;
    this.staredAt = 0;
    this.pausedAt = 0;
    this.context = buzzer.context();
    this.gain = this.context.createGain();
    this.gain.connect(buzzer.gain);

    this.gain.gain.value = this.vol;
    this.loaded = false;
    this.state = BuzzState.Constructed;
  }

  Buzz.prototype.load = function (success, error) {
    if (this.loaded) {
      return success.call(this, this.buffer);
    }

    if (cache.hasOwnProperty(this.src)) {
      this.buffer = cache[this.src];
      this.loaded = true;
      return success.call(this, this.buffer);
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', this.src, true);
    xhr.responseType = 'arraybuffer';

    var onLoad = function () {
      this.context.decodeAudioData(xhr.response, function (buffer) {
        cache[this.src] = buffer;
        this.buffer = buffer;
        this.duration = buffer.duration;
        this.loaded = true;
        log(this.src + ' is loaded!');
        success.call(this, this.buffer);
      }.bind(this), onError);
    }.bind(this);

    var onError = function (err) {
      log(err, 'error');
      error && error();
    };

    xhr.addEventListener('load', onLoad);
    xhr.addEventListener('error', onError);
    xhr.send();
  };

  Buzz.prototype.play = function (end, error) {
    if(this.state === BuzzState.Playing) {
      return;
    }

    var play = function () {
      this.bufferSource = this.context.createBufferSource();
      this.bufferSource.buffer = this.buffer;
      this.bufferSource.connect(this.gain);
      this.bufferSource.start(0, this.pausedAt);
      this.startedAt = this.context.currentTime - this.pausedAt;
      this.pausedAt = 0;
      this.state = BuzzState.Playing;
    };

    /*var playEnd = function () {
      this.state = BuzzState.Stopped;
      end && end();
    };*/

    var onError = function (e) {
      log(e, 'error');
      error && error();
    };

    if (!this.loaded) {
      return this.load(play, onError);
    }

    play.call(this);
  };

  Buzz.prototype.stop = function () {
    // We can stop the sound either if it "playing" or in "paused" state.
    if(this.state !== BuzzState.Playing && this.state !== BuzzState.Paused) {
      return;
    }

    this.bufferSource.disconnect();
    this.bufferSource.stop(0);
    this.bufferSource = null;
    this.pausedAt = 0;
    this.startedAt = 0;
    this.state = BuzzState.Stopped;
  };

  Buzz.prototype.pause = function () {
    // We can pause the sound only if it is "playing".
    if(this.state !== BuzzState.Playing) {
      return;
    }

    this.bufferSource.disconnect();
    this.bufferSource.stop(0);
    this.bufferSource = null;
    this.startedAt = 0;
    this.pausedAt = this.context.currentTime - this.startedAt;
    this.state = BuzzState.Paused;
  };

  Buzz.prototype.mute = function () {
    if (this.muted) {
      return;
    }

    this.gain.gain.value = 0;
    this.muted = true;
  };

  Buzz.prototype.unmute = function () {
    if (!this.muted) {
      return;
    }

    this.gain.gain.value = this.vol;
    this.muted = false;
  };

  Buzz.prototype.volume = function (vol) {
    var volume = parseFloat(vol);

    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return;
    }

    this.vol = volume;
    this.gain.gain.value = this.vol;

    return this.gain.gain.value;
  };

  Buzz.prototype.isMuted = function () {
    return this.muted;
  };

  Buzz.prototype.getState = function () {
    return this.state;
  };

  Buzz.prototype.getDuration = function () {
    return this.duration;
  };

  window.buzzer = buzzer;
  window.Buzz = Buzz;

})(window.AudioContext || window.webkitAudioContext);
