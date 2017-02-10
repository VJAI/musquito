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
    Done: 2
  };

  /**
   * Buzzer - the global audio engine
   * @constructor
   */
  function Buzzer() {
    this._context = null;
    this._muted = false;
    this._volume = 1.0;
    this._gain = null;
    this._state = BuzzerState.Constructed;
  }

  Buzzer.prototype = {

    /**
     * Instantiate audio context and other important objects.
     * @param {AudioContext} context
     */
    setup: function (context) {
      if (this._state === BuzzerState.Ready) {
        return;
      }

      var ctxClass = AudioContext || webkitAudioContext;
      this._context = context || new ctxClass();
      this._gain = this._context.createGain();
      this._gain.gain.value = this._volume;
      this._gain.connect(this._context.destination);
      this._state = BuzzerState.Ready;
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
      this._gain && (this._gain.value = this._volume);
      return this._volume;
    },

    /**
     * Mute the engine.
     */
    mute: function () {
      if (this._muted) {
        return;
      }

      this._gain && (this._gain.value = 0);
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
     * @returns {AudioContext|null}
     */
    context: function () {
      return this._context;
    },

    /**
     * Returns the master gain node.
     * @returns {*|null}
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

    state: function () {
      return this._state;
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
    Stopped: 3
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
    LoadError: 1
  };

  /**
   * Buzz - represents a single sound.
   * @param {object} args
   * @param {string} args.src The source of the audio file.
   * @param {number} args.volume The initial volume of the sound.
   * @param {number} args.loop Whether the sound should play repeatedly.
   * @param {boolean} args.preload Load the sound initially itself.
   * @param {boolean} args.autoplay Play automatically once the object is created.
   * @constructor
   */
  function Buzz(args) {
    buzzer.setup(null);

    this._id = Math.round(Date.now() * Math.random());
    this._src = args.src;
    this._volume = args.volume || 1.0;
    this._loop = args.loop || false;
    this._preload = args.preload || false;
    this._autoplay = args.autoplay || false;

    this._buffer = null;
    this._bufferSource = null;

    this._subscribers = {
      'load': [],
      'error': [],
      'playstart': [],
      'end': [],
      'stop': [],
      'pause': [],
      'mute': []
    };

    this._duration = 0;
    this._muted = false;
    this._startedAt = 0;
    this._pausedAt = 0;

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
  }

  Buzz.prototype = {

    /**
     * Downloads the sound from the url, decode it into audio buffer and store it locally.
     * Fires 'load' event on successful load and 'error' event on failure.
     * @returns {Buzz}
     */
    load: function () {
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
      if (this._state === BuzzState.Playing) {
        return this;
      }

      var play = function () {
        this._bufferSource = this._context.createBufferSource();
        this._bufferSource.buffer = this._buffer;
        this._bufferSource.connect(this._gain);
        this._fire('playstart');
        this._bufferSource.start(0, this._pausedAt);
        this._startedAt = this._context.currentTime - this._pausedAt;
        this._pausedAt = 0;
        this._state = BuzzState.Playing;
        return this;
      };

      // TODO: use this method
      var onEnd = function () {
        this._state = BuzzState.Stopped;
        this._fire('end');
      };

      if(this._loadStatus === AudioLoadState.Loaded) {
        return play.call(this)
      } else {
        this.on('load', play.bind(this), true);
        this.load();
      }

      return this;
    },

    /**
     * Stops the sound that is playing or in paused state.
     * @returns {Buzz}
     */
    stop: function () {
      // We can stop the sound either if it "playing" or in "paused" state.
      if (this._state !== BuzzState.Playing && this._state !== BuzzState.Paused) {
        return;
      }

      this._bufferSource.disconnect();
      this._bufferSource.stop(0);
      this._bufferSource = null;
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
      // We can pause the sound only if it is "playing".
      if (this._state !== BuzzState.Playing) {
        return;
      }

      this._bufferSource.disconnect();
      this._bufferSource.stop(0);
      this._bufferSource = null;
      this._startedAt = 0;
      this._pausedAt = this._context.currentTime - this._startedAt;
      this._state = BuzzState.Paused;

      return this;
    },

    /**
     * Mute the sound.
     * @returns {Buzz}
     */
    mute: function () {
      if (this._muted) {
        return;
      }

      this._gain.gain.value = 0;
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

      this._gain.gain.value = this._volume;
      this._muted = false;

      return this;
    },

    /**
     * Set/get the volume.
     * @param vol
     * @returns {Buzz|number}
     */
    volume: function (vol) {
      if(typeof vol === 'undefined') {
        return this._volume;
      }

      var volume = parseFloat(vol);

      if (isNaN(volume) || volume < 0 || volume > 1.0) {
        return this;
      }

      this._volume = volume;
      this._gain.gain.value = this._volume;

      return this;
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

      for(var i = 0; i < eventSubscribers.length; i++) {
        var eventSubscriber = eventSubscribers[i];
        if(eventSubscriber.fn === fn) {
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

      for(var i = 0; i < eventSubscribers.length; i++) {
        var eventSubscriber = eventSubscribers[i];

        setTimeout(function(subscriber) {
          subscriber.fn(this, args);

          if(subscriber.once) {
            this.off(event, subscriber.fn);
          }
        }.bind(this, eventSubscriber), 0);
      }

      return this;
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
