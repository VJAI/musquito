/**
 * buzzerjs v1.0.0
 *
 * A light-weight audio engine for HTML5 games and interactive websites
 *
 * License: MIT
 *
 * Copyright Vijaya Anand 2017. All rights reserved.
 *
 * http://www.prideparrot.com
 */
(function () {

  'use strict';

  var DEBUG = 'ON', emptyFn = function () {
  }, log = (function () {
    return DEBUG === 'ON' ? function (message, type) {
      console[type || 'log'](message);
    } : emptyFn;
  })();

  /**
   * Enumeration to represent the different states of the audio engine.
   * @type {{Constructed: number, Ready: number, Done: number}}
   */
  var BuzzerState = {
    Constructed: 0,
    Ready: 1,
    Done: 2
  };

  /**
   * Buzzer - the global audio engine
   * @constructor
   */
  function Buzzer() {
    this.ctx = null;
    this.muted = false;
    this.vol = 1.0;
    this.gain = null;
    this.state = BuzzerState.Constructed;
  }

  /**
   * Instantiate audio context and other important objects.
   * @param {AudioContext} context
   */
  Buzzer.prototype.setup = function (context) {
    if (this.state === BuzzerState.Ready) {
      return;
    }

    var ctxClass = AudioContext || webkitAudioContext;
    this.ctx = context || new ctxClass();
    this.gain = this.ctx.createGain();
    this.gain.gain.value = this.vol;
    this.gain.connect(this.ctx.destination);
    this.state = BuzzerState.Ready;
  };

  /**
   * Set/get the volume for the audio engine that controls global volume for all sounds.
   * @param {number} vol
   * @returns {number}
   */
  Buzzer.prototype.volume = function (vol) {
    var volume = parseFloat(vol);

    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return this.vol;
    }

    this.vol = volume;
    this.gain && (this.gain.value = this.vol);
    return this.vol;
  };

  /**
   * Mute the engine.
   */
  Buzzer.prototype.mute = function () {
    if (this.muted) {
      return;
    }

    this.gain && (this.gain.value = 0);
    this.muted = true;
  };

  /**
   * Unmute the engine.
   */
  Buzzer.prototype.unmute = function () {
    if (!this.muted) {
      return;
    }

    this.gain && (this.gain.gain.value = this.vol);
    this.muted = false;
  };

  /**
   * TODO
   */
  Buzzer.prototype.tearDown = function () {
    this.state = BuzzerState.Done;
  };

  /**
   * Returns the created audio context.
   * @returns {AudioContext|null}
   */
  Buzzer.prototype.context = function () {
    return this.ctx;
  };

  /**
   * Returns whether the engine is currently muted or not.
   * @returns {boolean}
   */
  Buzzer.prototype.isMuted = function () {
    return this.muted;
  };

  var buzzer = new Buzzer(), cache = {};

  /**
   * Enumeration that represents the different states of a sound.
   * @type {{Constructed: number, Playing: number, Paused: number, Stopped: number}}
   */
  var BuzzState = {
    Constructed: 0,
    Playing: 1,
    Paused: 2,
    Stopped: 3
  };

  /**
   * Buzz - represents a single sound.
   * @param {object} args
   * @param {string|string[]} args.src
   * @param {number} args.volume
   * @param {number} args.loop
   * @param {boolean} args.preload
   * @param {boolean} args.autoplay
   * @constructor
   */
  function Buzz(args) {
    buzzer.setup(null);

    this.id = Math.round(Date.now() * Math.random());
    this.src = args.src;
    this.vol = args.volume || 1.0;
    this.loop = args.loop || false;
    this.preload = args.preload || false;
    this.autoplay = args.autoplay || false;
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

  /**
   *
   * @param {function} success
   * @param {function} error
   * @returns {object} Buzz
   */
  Buzz.prototype.load = function (success, error) {
    if (this.loaded) {
      success.call(this, this.buffer);
      return;
    }

    if (cache.hasOwnProperty(this.src)) {
      this.buffer = cache[this.src];
      this.loaded = true;
      success.call(this, this.buffer);
      return;
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

    return this;
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

  // Supporting different platforms
  // AMD support
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return {
        buzzer: buzzer,
        Buzz: Buzz
      };
    });
  }

  // CommonJS support
  if (typeof exports !== 'undefined') {
    exports.buzzer = buzzer;
    exports.Buzz = Buzz;
  }

  // Define globally
  if(typeof window !== 'undefined') {
    window.buzzer = buzzer;
    window.Buzz = Buzz;
  }
})();
