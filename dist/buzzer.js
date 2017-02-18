(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Buzzer"] = factory();
	else
		root["Buzzer"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.l = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };

/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};

/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};

/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.BuzzerState = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Logger = __webpack_require__(1);

var _Logger2 = _interopRequireDefault(_Logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Enum that represent the different states of the audio engine.
 * @enum {number}
 */
var BuzzerState = {
  Constructed: 0,
  Ready: 1,
  Done: 2,
  NA: 3
};

/**
 * Represents the audio engine.
 * @class
 */

var Buzzer = function () {

  /**
   * @constructor
   */
  function Buzzer() {
    _classCallCheck(this, Buzzer);

    this._context = null;
    this._formats = {};
    this._muted = false;
    this._volume = 1.0;
    this._gain = null;
    this._contextType = AudioContext || webkitAudioContext;
    this._state = typeof this._contextType !== 'undefined' ? BuzzerState.Constructed : BuzzerState.NA;
  }

  /**
   * Instantiate audio context and other important objects.
   * Returns true if the setup is success.
   * @param {AudioContext} context
   * @returns {boolean}
   */


  _createClass(Buzzer, [{
    key: 'setup',
    value: function setup(context) {
      if (this._state === BuzzerState.NA) {
        (0, _Logger2.default)('Audio engine is not available because the current platform not supports Web Audio.', _Logger.LogType.Error);
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
    }

    /**
     * Figure out the supported codecs and return the result as an object.
     * @returns {object}
     */

  }, {
    key: 'codecs',
    value: function codecs() {
      if (Object.keys(this._formats).length === 0 && typeof Audio !== 'undefined') {
        var audioTest = new Audio();

        this._formats = {
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

      return this._formats;
    }

    /**
     * Set/get the volume for the audio engine that controls global volume for all sounds.
     * @param {number} vol
     * @returns {number}
     */

  }, {
    key: 'volume',
    value: function volume(vol) {
      var volume = parseFloat(vol);

      if (isNaN(volume) || volume < 0 || volume > 1.0) {
        return this._volume;
      }

      this._volume = volume;
      this._gain && (this._gain.gain.value = this._volume);
      return this._volume;
    }

    /**
     * Mute the engine.
     */

  }, {
    key: 'mute',
    value: function mute() {
      if (this._muted) {
        return;
      }

      this._gain && (this._gain.gain.value = 0);
      this._muted = true;
    }

    /**
     * Unmute the engine.
     */

  }, {
    key: 'unmute',
    value: function unmute() {
      if (!this._muted) {
        return;
      }

      this._gain && (this._gain.gain.value = this._volume);
      this._muted = false;
    }

    /**
     * TODO
     */

  }, {
    key: 'tearDown',
    value: function tearDown() {
      this._state = BuzzerState.Done;
    }

    /**
     * Returns the created audio context.
     * @returns {AudioContext}
     */

  }, {
    key: 'context',
    value: function context() {
      return this._context;
    }

    /**
     * Returns the master gain node.
     * @returns {GainNode}
     */

  }, {
    key: 'gain',
    value: function gain() {
      return this._gain;
    }

    /**
     * Returns whether the engine is currently muted or not.
     * @returns {boolean}
     */

  }, {
    key: 'muted',
    value: function muted() {
      return this._muted;
    }

    /**
     * Returns the state of the engine.
     * @returns {number}
     */

  }, {
    key: 'state',
    value: function state() {
      return this._state;
    }

    /**
     * Returns whether the engine is available or not.
     * @returns {boolean}
     */

  }, {
    key: 'available',
    value: function available() {
      return this._state !== BuzzerState.NA;
    }
  }]);

  return Buzzer;
}();

var buzzer = new Buzzer();

exports.BuzzerState = BuzzerState;
exports.default = buzzer;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Enum that represents the different types of messages.
 * @enum {string}
 */
var LogType = {
  Log: 'log',
  Error: 'error',
  Warn: 'warn',
  Info: 'info'
};

/**
 * Logs different types of messages to console.
 * @param {*} message
 * @param {LogType} type
 */
var log = function log(message, type) {
  return console[type || 'log'](message);
};

exports.LogType = LogType;
exports.default = log;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ErrorType = exports.AudioLoadState = exports.BuzzState = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Cache = __webpack_require__(3);

var _Cache2 = _interopRequireDefault(_Cache);

var _Logger = __webpack_require__(1);

var _Logger2 = _interopRequireDefault(_Logger);

var _Buzzer = __webpack_require__(0);

var _Buzzer2 = _interopRequireDefault(_Buzzer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Enum that represents the different states of a sound.
 * @enum {number}
 */
var BuzzState = {
  Constructed: 0,
  Playing: 1,
  Paused: 2,
  Stopped: 3,
  NA: 4
};

/**
 * Enum that represents the different states of loading the audio.
 * @enum {number}
 */
var AudioLoadState = {
  NotLoaded: 0,
  Loading: 1,
  Loaded: 2,
  Error: 3
};

/**
 * Enum that represents the different errors thrown by a Buzz object.
 * @enum {number}
 */
var ErrorType = {
  AudioUnAvailable: 1,
  LoadError: 2
};

/**
 * Represents a single sound.
 * @class
 */

var Buzz = function () {

  /**
   * @param {object} args
   * @param {string} args.src The source of the audio file.
   * @param {string[]} args.formats The available formats for the file.
   * @param {number} args.volume The initial volume of the sound.
   * @param {number} args.loop Whether the sound should play repeatedly.
   * @param {boolean} args.preload Load the sound initially itself.
   * @param {boolean} args.autoplay Play automatically once the object is created.
   * @param {function} args.onload Event-handler for the "load" event.
   * @param {function} args.onerror Event-handler for the "error" event.
   * @param {function} args.onplaystart Event-handler for the "playstart" event.
   * @param {function} args.onend Event-handler for the "end" event.
   * @param {function} args.onstop Event-handler for the "stop" event.
   * @param {function} args.onpause Event-handler for the "pause" event.
   * @constructor
   */
  function Buzz(args) {
    _classCallCheck(this, Buzz);

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

    for (var event in this._subscribers) {
      if (this._subscribers.hasOwnProperty(event) && typeof args['on' + event] === 'function') {
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

    if (_Buzzer2.default.setup(null)) {
      this._context = _Buzzer2.default.context();
      this._gain = this._context.createGain();
      this._gain.connect(_Buzzer2.default.gain());
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

  /**
   * Downloads the sound from the url, decode it into audio buffer and store it locally.
   * Fires 'load' event on successful load and 'error' event on failure.
   * @returns {Buzz}
   */


  _createClass(Buzz, [{
    key: 'load',
    value: function load() {
      if (!this._check()) {
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

      if (_Cache2.default.exists(this._src)) {
        loadBuffer(_Cache2.default.retrieve(this._src));
        return this;
      }

      this._loadStatus = AudioLoadState.Loading;

      var xhr = new XMLHttpRequest();
      xhr.open('GET', this._src, true);
      xhr.responseType = 'arraybuffer';

      var onLoad = function onLoad() {
        this._context.decodeAudioData(xhr.response, function (buffer) {
          _Cache2.default.store(this._src, buffer);
          loadBuffer(buffer);
        }.bind(this), onError);
      };

      var onError = function onError(err) {
        this._loadStatus = AudioLoadState.Error;
        this._fire('error', { type: ErrorType.LoadError, error: err });
      };

      xhr.addEventListener('load', onLoad.bind(this));
      xhr.addEventListener('error', onError.bind(this));
      xhr.send();

      return this;
    }

    /**
     * Plays the sound.
     * Fires 'playstart' event before playing and 'end' event after the sound is played.
     * @returns {Buzz}
     */

  }, {
    key: 'play',
    value: function play() {
      if (!this._check()) {
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
    }

    /**
     * Stops the sound that is playing or in paused state.
     * @returns {Buzz}
     */

  }, {
    key: 'stop',
    value: function stop() {
      if (!this._check()) {
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
      this._fire('stop');

      return this;
    }

    /**
     * Pause the playing sound.
     * @returns {Buzz}
     */

  }, {
    key: 'pause',
    value: function pause() {
      if (!this._check()) {
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
      this._fire('pause');

      return this;
    }

    /**
     * Mute the sound.
     * @returns {Buzz}
     */

  }, {
    key: 'mute',
    value: function mute() {
      if (this._muted) {
        return this;
      }

      this._gain && (this._gain.gain.value = 0);
      this._muted = true;

      return this;
    }

    /**
     * Unmute the sound.
     * @returns {Buzz}
     */

  }, {
    key: 'unmute',
    value: function unmute() {
      if (!this._muted) {
        return;
      }

      this._gain && (this._gain.gain.value = this._volume);
      this._muted = false;

      return this;
    }

    /**
     * Set/get the volume.
     * @param vol
     * @returns {Buzz|number}
     */

  }, {
    key: 'volume',
    value: function volume(vol) {
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
    }
  }, {
    key: 'fadeOut',
    value: function fadeOut() {
      throw new Error('Not Implemented');
    }
  }, {
    key: 'fadeIn',
    value: function fadeIn() {
      throw new Error('Not Implemented');
    }

    /**
     * Returns whether sound is muted or not.
     * @returns {boolean}
     */

  }, {
    key: 'muted',
    value: function muted() {
      return this._muted;
    }

    /**
     * Returns the state of the sound.
     * @returns {number}
     */

  }, {
    key: 'state',
    value: function state() {
      return this._state;
    }

    /**
     * Returns the duration of the sound.
     * @returns {number}
     */

  }, {
    key: 'duration',
    value: function duration() {
      return this._duration;
    }

    /**
     * Method to subscribe to an event.
     * @param event
     * @param fn
     * @param once
     * @returns {Buzz}
     */

  }, {
    key: 'on',
    value: function on(event, fn, once) {
      if (!this._subscribers.hasOwnProperty(event)) return this;
      if (typeof fn !== 'function') return this;

      this._subscribers[event].push({ fn: fn, once: once });

      return this;
    }

    /**
     * Method to un-subscribe from an event.
     * @param event
     * @param fn
     * @returns {Buzz}
     */

  }, {
    key: 'off',
    value: function off(event, fn) {
      if (!this._subscribers.hasOwnProperty(event)) return this;
      if (typeof fn !== 'function') return this;

      var eventSubscribers = this._subscribers[event];

      for (var i = 0; i < eventSubscribers.length; i++) {
        var eventSubscriber = eventSubscribers[i];
        if (eventSubscriber.fn === fn) {
          eventSubscribers.splice(i, 1);
          break;
        }
      }

      return this;
    }

    /**
     * Method to subscribe to an event only once.
     * @param event
     * @param fn
     * @returns {*|Buzz}
     */

  }, {
    key: 'once',
    value: function once(event, fn) {
      return this.on(event, fn, true);
    }

    /**
     * Fires an event passing the sound and other optional arguments.
     * @param event
     * @param args
     * @returns {Buzz}
     * @private
     */

  }, {
    key: '_fire',
    value: function _fire(event, args) {
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
    }

    /**
     * Logs error and returns false if audio is not available.
     * @returns {boolean}
     * @private
     */

  }, {
    key: '_check',
    value: function _check() {
      if (this._state === BuzzState.NA) {
        (0, _Logger2.default)('Web Audio API is unavailable', _Logger.LogType.Error);
        return false;
      }

      return true;
    }
  }]);

  return Buzz;
}();

exports.BuzzState = BuzzState;
exports.AudioLoadState = AudioLoadState;
exports.ErrorType = ErrorType;
exports.default = Buzz;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents an in-memory cache store.
 */
var Cache = function () {

  /**
   * Initializes the in-memory cache object.
   * @constructor
   */
  function Cache() {
    _classCallCheck(this, Cache);

    this._cache = {};
  }

  /**
   * Stores the value in cache to the passed key.
   * @param {string} key
   * @param {*} value
   */


  _createClass(Cache, [{
    key: "store",
    value: function store(key, value) {
      this._cache[key] = value;
    }

    /**
     * Returns the stored value for the key.
     * @param {string} key
     * @returns {*}
     */

  }, {
    key: "retrieve",
    value: function retrieve(key) {
      return this._cache[key];
    }

    /**
     * Removes the stored item for the key.
     * @param {string} key
     */

  }, {
    key: "remove",
    value: function remove(key) {
      delete this._cache[key];
    }

    /**
     * Returns the number of items in the cache.
     * @returns {number}
     */

  }, {
    key: "count",
    value: function count() {
      return Object.keys(this._cache).length;
    }

    /**
     * Returns true if the item exist in the cache.
     * @param key
     * @returns {boolean}
     */

  }, {
    key: "exists",
    value: function exists(key) {
      return this._cache.hasOwnProperty(key);
    }

    /**
     * Removes all items from cache.
     */

  }, {
    key: "flush",
    value: function flush() {
      this._cache = {};
    }
  }]);

  return Cache;
}();

var cache = new Cache();
exports.default = cache;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Buzz = exports.buzzer = undefined;

var _Buzzer = __webpack_require__(0);

var _Buzzer2 = _interopRequireDefault(_Buzzer);

var _Buzz = __webpack_require__(2);

var _Buzz2 = _interopRequireDefault(_Buzz);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import 'babel-polyfill';
exports.buzzer = _Buzzer2.default;
exports.Buzz = _Buzz2.default;

/***/ })
/******/ ]);
});
