/**
 * buzzerjs v1.0.0
 * A light-weight audio engine for HTML5 games and interactive websites
 * License: MIT
 * Copyright Vijaya Anand 2017. All rights reserved.
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
    Done: 2,
    NA: 3
  };

  /**
   * Buzzer - the global audio engine
   * @constructor
   */
  function Buzzer() {
    this._context = null;
    this._codecs = {};
    this._muted = false;
    this._volume = 1.0;
    this._gain = null;
    this._contextType = AudioContext || webkitAudioContext;
    this._state = typeof this._contextType !== 'undefined' ? BuzzerState.Constructed : BuzzerState.NA;
  }

  Buzzer.prototype = {

    /**
     * Instantiate audio context and other important objects.
     * Returns true if the setup is success.
     * @param {AudioContext} context
     * @returns {boolean}
     */
    setup: function (context) {
      if(this._state === BuzzerState.NA) {
        log('Audio engine is not available because the current platform not supports Web Audio.', 'error');
        return false;
      }

      if (this._state === BuzzerState.Ready) {
        return true;
      }

      this._context = context || new this._contextType();
      this.codecs();
      this._gain = this._context.createGain();
      this._gain.gain.value = this._volume;
      this._gain.connect(this._context.destination);
      this._state = BuzzerState.Ready;
      return true;
    },

    /**
     * Figure out the supported codecs and return the result as an object.
     * @returns {object}
     */
    codecs: function () {
      if(Object.keys(this._codecs).length === 0 && typeof Audio !== 'undefined') {
        var audioTest = new Audio();

        this._codecs = {
          mp3: !!audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''),
          mpeg: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
          opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
          ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
          oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
          wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
          aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
          caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
          m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
          mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
          weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
          webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
          dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
          flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
        };

        audioTest = null;
      }

      return this._codecs;
    },

    /**
     * Set/get the volume for the audio engine that controls global volume for all sounds.
     * @param {number} vol
     * @returns {number}
     */
    volume: function (vol) {
      var volume = parseFloat(vol);

      if (isNaN(volume) || volume < 0 || volume > 1.0) {
        return this._volume;
      }

      this._volume = volume;
      this._gain && (this._gain.gain.value = this._volume);
      return this._volume;
    },

    /**
     * Mute the engine.
     */
    mute: function () {
      if (this._muted) {
        return;
      }

      this._gain && (this._gain.gain.value = 0);
      this._muted = true;
    },

    /**
     * Unmute the engine.
     */
    unmute: function () {
      if (!this._muted) {
        return;
      }

      this._gain && (this._gain.gain.value = this._volume);
      this._muted = false;
    },

    /**
     * TODO
     */
    tearDown: function () {
      this._state = BuzzerState.Done;
    },

    /**
     * Returns the created audio context.
     * @returns {AudioContext}
     */
    context: function () {
      return this._context;
    },

    /**
     * Returns the master gain node.
     * @returns {GainNode}
     */
    gain: function () {
      return this._gain;
    },

    /**
     * Returns whether the engine is currently muted or not.
     * @returns {boolean}
     */
    muted: function () {
      return this._muted;
    },

    /**
     * Returns the state of the engine.
     * @returns {number}
     */
    state: function () {
      return this._state;
    },

    /**
     * Returns whether the engine is available or not.
     * @returns {boolean}
     */
    available: function () {
      return this._state !== BuzzerState.NA;
    }
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
    Stopped: 3,
    NA: 4
  };

  /**
   * Enumeration that represents the states of loading the audio.
   * @type {{NotLoaded: number, Loading: number, Loaded: number, Error: number}}
   */
  var AudioLoadState = {
    NotLoaded: 0,
    Loading: 1,
    Loaded: 2,
    Error: 3
  };

  var ErrorType = {
    AudioUnAvailable: 1,
    LoadError: 2
  };

  /**
   * Buzz - represents a single sound.
   * @param {object} args
   * @param {string} args.src The source of the audio file.
   * @param {string[]} args.formats The available formats for the file.
   * @param {number} args.volume The initial volume of the sound.
   * @param {number} args.loop Whether the sound should play repeatedly.
   * @param {boolean} args.preload Load the sound initially itself.
   * @param {boolean} args.autoplay Play automatically once the object is created.
   * @param {function} args.onload
   * @param {function} args.onerror
   * @param {function} args.onplaystart
   * @param {function} args.onend
   * @param {function} args.onstop
   * @param {function} args.onpause
   * @param {function} args.onmute
   * @constructor
   */
  function Buzz(args) {
    this._id = Math.round(Date.now() * Math.random());
    this._src = args.src;
    this._formats = args.formats;
    this._volume = args.volume || 1.0;
    this._loop = args.loop || false;
    this._preload = args.preload || false;
    this._autoplay = args.autoplay || false;
    this._subscribers = {
      'load': [],
      'error': [],
      'playstart': [],
      'end': [],
      'stop': [],
      'pause': [],
      'mute': []
    };

    for(var event in this._subscribers) {
      if(this._subscribers.hasOwnProperty(event) && typeof args['on' + event] === 'function') {
        this.on(event, args['on' + event]);
      }
    }

    this._buffer = null;
    this._bufferSource = null;
    this._endTimer = null;
    this._duration = 0;
    this._muted = false;
    this._startedAt = 0;
    this._pausedAt = 0;

    if(buzzer.setup(null)) {
      this._context = buzzer.context();
      this._gain = this._context.createGain();
      this._gain.connect(buzzer.gain());
      this._gain.gain.value = this._volume;

      this._loadStatus = AudioLoadState.NotLoaded;
      this._state = BuzzState.Constructed;

      if (this._autoplay) {
        this.play();
        return;
      }

      if (this._preload) {
        this.load();
      }
    } else {
      this._state = BuzzState.NA;
      this._fire('error', { type: ErrorType.AudioUnAvailable, error: 'Web Audio API is unavailable' });
    }
  }

  Buzz.prototype = {

    /**
     * Downloads the sound from the url, decode it into audio buffer and store it locally.
     * Fires 'load' event on successful load and 'error' event on failure.
     * @returns {Buzz}
     */
    load: function () {
      if(!this._check()) {
        return this;
      }

      // If the loading is in progress or already the audio file is loaded return.
      if (this._loadStatus === AudioLoadState.Loading || this._loadStatus === AudioLoadState.Loaded) {
        return this;
      }

      var loadBuffer = function (buffer) {
        this._buffer = buffer;
        this._duration = buffer.duration;
        this._loadStatus = AudioLoadState.Loaded;
        this._fire('load', buffer);
      }.bind(this);

      if (cache.hasOwnProperty(this._src)) {
        loadBuffer(cache[this._src]);
        return this;
      }

      this._loadStatus = AudioLoadState.Loading;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', this._src, true);
      xhr.responseType = 'arraybuffer';

      var onLoad = function () {
        this._context.decodeAudioData(xhr.response, function (buffer) {
          cache[this._src] = buffer;
          loadBuffer(buffer);
        }.bind(this), onError);
      };

      var onError = function (err) {
        this._loadStatus = AudioLoadState.Error;
        this._fire('error', {type: ErrorType.LoadError, error: err});
      };

      xhr.addEventListener('load', onLoad.bind(this));
      xhr.addEventListener('error', onError.bind(this));
      xhr.send();

      return this;
    },

    /**
     * Plays the sound.
     * Fires 'playstart' event before playing and 'end' event after the sound is played.
     * @returns {Buzz}
     */
    play: function () {
      if(!this._check()) {
        return this;
      }

      if (this._state === BuzzState.Playing) {
        return this;
      }

      var play = function () {
        if (this._endTimer) {
          clearTimeout(this._endTimer);
          this._endTimer = null;
        }

        var offset = this._pausedAt;
        this._bufferSource = this._context.createBufferSource();
        this._bufferSource.buffer = this._buffer;
        this._bufferSource.connect(this._gain);
        this._bufferSource.start(0, offset);
        this._startedAt = this._context.currentTime - offset;
        this._pausedAt = 0;
        this._endTimer = setTimeout(onEnd, this._duration * 1000);
        this._state = BuzzState.Playing;
        this._fire('playstart');

        return this;
      }.bind(this);

      var onEnd = function () {
        this._startedAt = 0;
        this._pausedAt = 0;
        this._endTimer = null;
        this._state = BuzzState.Stopped;
        this._fire('end');
      }.bind(this);

      if (this._loadStatus === AudioLoadState.Loaded) {
        return play();
      } else {
        this.on('load', play, true);
        this.load();
      }

      return this;
    },

    /**
     * Stops the sound that is playing or in paused state.
     * @returns {Buzz}
     */
    stop: function () {
      if(!this._check()) {
        return this;
      }

      // We can stop the sound either if it "playing" or in "paused" state.
      if (this._state !== BuzzState.Playing && this._state !== BuzzState.Paused) {
        return this;
      }

      this._bufferSource.disconnect();
      this._bufferSource.stop(0);
      this._bufferSource = null;
      this._endTimer && clearTimeout(this._endTimer);
      this._endTimer = null;
      this._pausedAt = 0;
      this._startedAt = 0;
      this._state = BuzzState.Stopped;

      return this;
    },

    /**
     * Pause the playing sound.
     * @returns {Buzz}
     */
    pause: function () {
      if(!this._check()) {
        return this;
      }

      // We can pause the sound only if it is "playing".
      if (this._state !== BuzzState.Playing) {
        return this;
      }

      var elapsed = this._context.currentTime - this._startedAt;
      this._bufferSource.disconnect();
      this._bufferSource.stop(0);
      this._bufferSource = null;
      this._endTimer && clearTimeout(this._endTimer);
      this._endTimer = null;
      this._startedAt = 0;
      this._pausedAt = elapsed;
      this._state = BuzzState.Paused;

      return this;
    },

    /**
     * Mute the sound.
     * @returns {Buzz}
     */
    mute: function () {
      if (this._muted) {
        return this;
      }

      this._gain && (this._gain.gain.value = 0);
      this._muted = true;

      return this;
    },

    /**
     * Unmute the sound.
     * @returns {Buzz}
     */
    unmute: function () {
      if (!this._muted) {
        return;
      }

      this._gain && (this._gain.gain.value = this._volume);
      this._muted = false;

      return this;
    },

    /**
     * Set/get the volume.
     * @param vol
     * @returns {Buzz|number}
     */
    volume: function (vol) {
      if (typeof vol === 'undefined') {
        return this._volume;
      }

      var volume = parseFloat(vol);

      if (isNaN(volume) || volume < 0 || volume > 1.0) {
        return this;
      }

      this._volume = volume;
      this._gain && (this._gain.gain.value = this._volume);

      return this;
    },

    fadeOut: function () {
      throw new Error('Not Implemented');
    },

    fadeIn: function () {
      throw new Error('Not Implemented');
    },

    /**
     * Returns whether sound is muted or not.
     * @returns {boolean}
     */
    muted: function () {
      return this._muted;
    },

    /**
     * Returns the state of the sound.
     * @returns {number}
     */
    state: function () {
      return this._state;
    },

    /**
     * Returns the duration of the sound.
     * @returns {number}
     */
    duration: function () {
      return this._duration;
    },

    /**
     * Method to subscribe to an event.
     * @param event
     * @param fn
     * @param once
     * @returns {Buzz}
     */
    on: function (event, fn, once) {
      if (!this._subscribers.hasOwnProperty(event)) return;
      if (typeof fn !== 'function') return;

      this._subscribers[event].push({fn: fn, once: once});

      return this;
    },

    /**
     * Method to un-subscribe from an event.
     * @param event
     * @param fn
     * @returns {Buzz}
     */
    off: function (event, fn) {
      if (!this._subscribers.hasOwnProperty(event)) return;
      if (typeof fn !== 'function') return;

      var eventSubscribers = this._subscribers[event];

      for (var i = 0; i < eventSubscribers.length; i++) {
        var eventSubscriber = eventSubscribers[i];
        if (eventSubscriber.fn === fn) {
          eventSubscribers.splice(i, 1);
          break;
        }
      }

      return this;
    },

    /**
     * Method to subscribe to an event only once.
     * @param event
     * @param fn
     * @returns {*|Buzz}
     */
    once: function (event, fn) {
      return this.on(event, fn, true);
    },

    /**
     * Fires an event passing the sound and other optional arguments.
     * @param event
     * @param args
     * @returns {Buzz}
     * @private
     */
    _fire: function (event, args) {
      var eventSubscribers = this._subscribers[event];

      for (var i = 0; i < eventSubscribers.length; i++) {
        var eventSubscriber = eventSubscribers[i];

        setTimeout(function (subscriber) {
          subscriber.fn(this, args);

          if (subscriber.once) {
            this.off(event, subscriber.fn);
          }
        }.bind(this, eventSubscriber), 0);
      }

      return this;
    },

    _check: function () {
      if(this._state === BuzzState.NA) {
        log('Web Audio API is unavailable', 'error');
        return false;
      }

      return true;
    }
  };

  // Supporting different platforms
  // AMD support
  if (typeof define === 'function' && define.amd) {
    define([], function () {
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
  if (typeof window !== 'undefined') {
    window.buzzer = buzzer;
    window.Buzz = Buzz;
  }
})();
