/*!
*  musquito v1.0.0 
*  http://musquitojs.com
*
*  (c) 2018 Vijaya Anand
*  http://prideparrot.com
*
*  MIT License
*/
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["musquito"] = factory();
	else
		root["musquito"] = factory();
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
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Contains helper methods.
 */
var Utility = function () {

  /**
   * @constructor
   */


  /**
   * Dictionary of audio formats and their support status.
   * @type {object}
   * @private
   */


  /**
   * The navigator object.
   * @type {Navigator}
   * @private
   */
  function Utility() {
    _classCallCheck(this, Utility);

    this._navigator = null;
    this._contextType = null;
    this._formats = {};
    this._isAudioEnabled = false;

    if (typeof navigator !== 'undefined') {
      this._navigator = navigator;
    }

    // Set the available Web Audio Context type available in browser.
    if (typeof AudioContext !== 'undefined') {
      this._contextType = AudioContext;
    } else if (typeof webkitAudioContext !== 'undefined') {
      this._contextType = webkitAudioContext;
    }

    // Determine the supported audio formats.
    var audio = new Audio();

    this._formats = {
      mp3: Boolean(audio.canPlayType('audio/mp3;').replace(/^no$/, '')),
      mpeg: Boolean(audio.canPlayType('audio/mpeg;').replace(/^no$/, '')),
      opus: Boolean(audio.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '')),
      ogg: Boolean(audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')),
      oga: Boolean(audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')),
      wav: Boolean(audio.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')),
      aac: Boolean(audio.canPlayType('audio/aac;').replace(/^no$/, '')),
      caf: Boolean(audio.canPlayType('audio/x-caf;').replace(/^no$/, '')),
      m4a: Boolean((audio.canPlayType('audio/x-m4a;') || audio.canPlayType('audio/m4a;') || audio.canPlayType('audio/aac;')).replace(/^no$/, '')),
      mp4: Boolean((audio.canPlayType('audio/x-mp4;') || audio.canPlayType('audio/mp4;') || audio.canPlayType('audio/aac;')).replace(/^no$/, '')),
      weba: Boolean(audio.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
      webm: Boolean(audio.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
      dolby: Boolean(audio.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, '')),
      flac: Boolean((audio.canPlayType('audio/x-flac;') || audio.canPlayType('audio/flac;')).replace(/^no$/, ''))
    };

    audio = null;
  }

  /**
   * Returns an unique id (credit: https://howlerjs.com).
   * @return {number}
   */


  /**
   * Is audio already enabled or not.
   * @type {boolean}
   * @private
   */


  /**
   * The AudioContext type.
   * @type {Function}
   * @private
   */


  _createClass(Utility, [{
    key: 'id',
    value: function id() {
      return Math.round(Date.now() * Math.random());
    }

    /**
     * Returns the available context type.
     * @return {Function}
     */

  }, {
    key: 'getContextType',
    value: function getContextType() {
      return this._contextType;
    }

    /**
     * Instantiates and returns the audio context.
     * @return {AudioContext|webkitAudioContext}
     */

  }, {
    key: 'getContext',
    value: function getContext() {
      return new this._contextType();
    }

    /**
     * Returns the supported audio formats.
     * @return {Object}
     */

  }, {
    key: 'supportedFormats',
    value: function supportedFormats() {
      return this._formats;
    }

    /**
     * Returns true if the passed format is supported.
     * @param {string} format The audio format ex. "mp3"
     * @return {boolean}
     */

  }, {
    key: 'isFormatSupported',
    value: function isFormatSupported(format) {
      return Boolean(this._formats[format]);
    }

    /**
     * Returns the first supported format from the passed array.
     * @param {string[]} formats Array of audio formats
     * @return {string}
     */

  }, {
    key: 'getSupportedFormat',
    value: function getSupportedFormat(formats) {
      var _this = this;

      return formats.find(function (format) {
        return _this.isFormatSupported(format);
      });
    }

    /**
     * Returns true if the audio source is supported.
     * @param {string} source The audio source url or base64 string
     * @return {boolean}
     */

  }, {
    key: 'isSourceSupported',
    value: function isSourceSupported(source) {
      var ext = this.isBase64(source) ? /^data:audio\/([^;,]+);/i.exec(source) : /^.+\.([^.]+)$/.exec(source);

      ext = /^.+\.([^.]+)$/.exec(source);
      return ext ? this.isFormatSupported(ext[1].toLowerCase()) : false;
    }

    /**
     * Returns the first supported audio source from the passed array.
     * @param {string[]} sources Array of audio sources. The audio source could be either url or base64 string.
     * @return {string}
     */

  }, {
    key: 'getSupportedSource',
    value: function getSupportedSource(sources) {
      var _this2 = this;

      return sources.find(function (source) {
        return _this2.isSourceSupported(source);
      });
    }

    /**
     * Returns whether the passed string is a base64 string or not.
     * @param {string} str Base64 audio string
     * @return {boolean}
     */

  }, {
    key: 'isBase64',
    value: function isBase64(str) {
      return (/^data:[^;]+;base64,/.test(str)
      );
    }

    /**
     * Enables playing audio on first touch.
     * @param {AudioContext} context Web API audio context.
     */

  }, {
    key: 'enableAudio',
    value: function enableAudio(context) {
      if (!this._isMobile() && !this._isTouch() || this._isAudioEnabled) {
        return;
      }

      var unlock = function unlock() {
        var bufferSource = context.createBufferSource();
        bufferSource.buffer = context.createBuffer(1, 1, 22050);
        bufferSource.connect(context.destination);

        var cleanUp = function cleanUp() {
          document.removeEventListener('touchend', unlock);
          bufferSource.disconnect();
          bufferSource.removeEventListener('ended', cleanUp);
          bufferSource = null;
        };

        bufferSource.addEventListener('ended', cleanUp);

        if (typeof bufferSource.start === 'undefined') {
          bufferSource.noteOn(0);
        } else {
          bufferSource.start(0);
        }
      };

      document.addEventListener('touchend', unlock);
    }

    /**
     * Returns true if the platform is mobile.
     * @return {boolean}
     * @private
     */

  }, {
    key: '_isMobile',
    value: function _isMobile() {
      if (!this._navigator) {
        return false;
      }

      return (/iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(this._navigator.userAgent)
      );
    }

    /**
     * Returns true if the platform is touch supported.
     * @return {boolean}
     * @private
     */

  }, {
    key: '_isTouch',
    value: function _isTouch() {
      return typeof window !== 'undefined' && Boolean('ontouchend' in window || this._navigator && this._navigator.maxTouchPoints > 0 || this._navigator && this._navigator.msMaxTouchPoints > 0);
    }
  }]);

  return Utility;
}();

exports.default = new Utility();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Singleton global event emitter.
 * @class
 */
var Emitter = function () {
  function Emitter() {
    _classCallCheck(this, Emitter);

    this._objectsEventsHandlersMap = {};
  }

  /**
   * Dictionary that maps the objects with their events and handlers.
   * @type {object}
   * @private
   */


  _createClass(Emitter, [{
    key: "on",


    /**
     * Subscribes to an event of the passed object.
     * @param {number} id The unique id of the object.
     * @param {string} eventName Name of the event
     * @param {function} handler The event-handler function
     * @param {boolean} [once = false] Is it one-time subscription or not?
     * @return {Emitter}
     */
    value: function on(id, eventName, handler) {
      var once = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

      if (!this._hasObject(id)) {
        this._objectsEventsHandlersMap[id] = {};
      }

      var objEvents = this._objectsEventsHandlersMap[id];

      if (!objEvents.hasOwnProperty(eventName)) {
        objEvents[eventName] = [];
      }

      objEvents[eventName].push({
        handler: handler,
        once: once
      });

      return this;
    }

    /**
     * Un-subscribes from an event of the passed object.
     * @param {number} id The unique id of the object.
     * @param {string} eventName The event name.
     * @param {function} [handler] The handler function.
     * @return {Emitter}
     */

  }, {
    key: "off",
    value: function off(id, eventName, handler) {
      if (!this._hasEvent(id, eventName)) {
        return this;
      }

      var objEvents = this._objectsEventsHandlersMap[id];

      if (!handler) {
        objEvents[eventName] = [];
      } else {
        objEvents[eventName] = objEvents[eventName].filter(function (eventSubscriber) {
          return eventSubscriber.handler !== handler;
        });
      }

      return this;
    }

    /**
     * Fires an event of the object passing the source and other optional arguments.
     * @param {number} id The unique id of the object.
     * @param {string} eventName The event name
     * @param {...*} args The arguments that to be passed to handler
     * @return {Emitter}
     */

  }, {
    key: "fire",
    value: function fire(id, eventName) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      if (!this._hasEvent(id, eventName)) {
        return this;
      }

      var eventSubscribers = this._objectsEventsHandlersMap[id][eventName];

      for (var i = 0; i < eventSubscribers.length; i++) {
        var eventSubscriber = eventSubscribers[i];

        setTimeout(function (subscriber) {
          var handler = subscriber.handler,
              once = subscriber.once;


          handler.apply(undefined, args);

          if (once) {
            this.off(id, eventName, handler);
          }
        }.bind(this, eventSubscriber), 0);
      }

      return this;
    }

    /**
     * Clears the event handlers of the passed object.
     * @param {number} [id] The unique id of the object.
     * @return {Emitter}
     */

  }, {
    key: "clear",
    value: function clear(id) {
      if (!id) {
        this._objectsEventsHandlersMap = {};
        return this;
      }

      if (this._hasObject(id)) {
        delete this._objectsEventsHandlersMap[id];
      }

      return this;
    }

    /**
     * Returns true if the object is already registered.
     * @param {number} id The object id.
     * @return {boolean}
     * @private
     */

  }, {
    key: "_hasObject",
    value: function _hasObject(id) {
      return this._objectsEventsHandlersMap.hasOwnProperty(id);
    }

    /**
     * Returns true if the passed object has an entry of the passed event.
     * @param {number} id The object id.
     * @param {string} eventName The event name.
     * @return {boolean}
     * @private
     */

  }, {
    key: "_hasEvent",
    value: function _hasEvent(id, eventName) {
      return this._hasObject(id) && this._objectsEventsHandlersMap[id].hasOwnProperty(eventName);
    }
  }]);

  return Emitter;
}();

exports.default = new Emitter();

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ErrorType = exports.EngineEvents = exports.EngineState = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Loader = __webpack_require__(3);

var _Loader2 = _interopRequireDefault(_Loader);

var _Emitter = __webpack_require__(1);

var _Emitter2 = _interopRequireDefault(_Emitter);

var _Heap = __webpack_require__(5);

var _Heap2 = _interopRequireDefault(_Heap);

var _Queue = __webpack_require__(4);

var _Queue2 = _interopRequireDefault(_Queue);

var _Utility = __webpack_require__(0);

var _Utility2 = _interopRequireDefault(_Utility);

var _Sound = __webpack_require__(6);

var _Sound2 = _interopRequireDefault(_Sound);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Enum that represents the different type of errors thrown by Engine and Buzzes.
 * @enum {string}
 */
var ErrorType = {
  NoAudio: 'no-audio',
  LoadError: 'load',
  PlayError: 'play',
  EngineError: 'engine'
};

/**
 * Represents the different states of the audio engine.
 * @enum {string}
 */
var EngineState = {
  NotReady: 'notready',
  Ready: 'ready',
  Suspending: 'suspending',
  Suspended: 'suspended',
  Resuming: 'resuming',
  Destroying: 'destroying',
  Done: 'done',
  NoAudio: 'no-audio'
};

/**
 * Enum that represents the different events by engine.
 * @enum {string}
 */
var EngineEvents = {
  Add: 'add',
  Remove: 'remove',
  Volume: 'volume',
  Mute: 'mute',
  Pause: 'pause',
  Stop: 'stop',
  Suspend: 'suspend',
  Resume: 'resume',
  Error: 'error',
  Done: 'done'
};

/**
 * The audio engine that orchestrates all the sounds.
 * @class
 */

var Engine = function () {

  /**
   * Instantiates the heap and action queue.
   * @constructor
   */


  /**
   * The sound heap.
   * @type {Heap}
   * @private
   */


  /**
   * The master gain node.
   * @type {GainNode}
   * @private
   */


  /**
   * Represents the current state of the engine.
   * @type {EngineState}
   * @private
   */


  /**
   * The clean-up interval id.
   * @type {number|null}
   * @private
   */


  /**
   * Represents the global volume.
   * @type {number}
   * @private
   */


  /**
   * Unique id of the engine.
   * @type {number}
   * @private
   */
  function Engine() {
    _classCallCheck(this, Engine);

    this._id = _Utility2.default.id();
    this._muted = false;
    this._volume = 1.0;
    this._cleanUpInterval = 5;
    this._intervalId = null;
    this._isAudioAvailable = false;
    this._state = EngineState.NotReady;
    this._context = null;
    this._gainNode = null;
    this._queue = null;
    this._heap = null;
    this._loader = null;

    this._heap = new _Heap2.default();
    this._queue = new _Queue2.default();
  }

  /**
   * Instantiate the audio context and other dependencies.
   * @param {object} [args] Input parameters object.
   * @param {number} [args.volume = 1.0] The global volume of the sound engine.
   * @param {boolean} [args.muted = false] Stay muted initially or not.
   * @param {number} [args.cleanUpInterval = 5] The heap clean-up interval period in minutes.
   * @param {function} [args.onadd] Event-handler for the "add" event.
   * @param {function} [args.onremove] Event-handler for the "remove" event.
   * @param {function} [args.onstop] Event-handler for the "stop" event.
   * @param {function} [args.onpause] Event-handler for the "pause" event.
   * @param {function} [args.onmute] Event-handler for the "mute" event.
   * @param {function} [args.onvolume] Event-handler for the "volume" event.
   * @param {function} [args.onsuspend] Event-handler for the "suspend" event.
   * @param {function} [args.onresume] Event-handler for the "resume" event.
   * @param {function} [args.onerror] Event-handler for the "error" event.
   * @param {function} [args.ondone] Event-handler for the "done" event.
   * @return {Engine}
   */


  /**
   * Loader - the component that loads audio buffers with audio data.
   * @type {Loader}
   * @private
   */


  /**
   * The action queue.
   * @type {Queue}
   * @private
   */


  /**
   * The Web Audio API's audio context.
   * @type {AudioContext}
   * @private
   */


  /**
   * True if Web Audio API is available.
   * @type {boolean}
   * @private
   */


  /**
   * The heap clean-up period.
   * @type {number}
   * @private
   */


  /**
   * Represents whether the audio engine is currently muted or not.
   * @type {boolean}
   * @private
   */


  _createClass(Engine, [{
    key: 'setup',
    value: function setup(args) {
      // If the setup is already done return.
      if (this._state !== EngineState.NotReady) {
        return this;
      }

      this._context = _Utility2.default.getContext();

      // Determine the audio stuff available in the current platform and set the flags accordingly.
      this._isAudioAvailable = Boolean(this._context);

      // If no Web Audio and HTML5 audio is available fire an error event.
      if (!this._isAudioAvailable) {
        this._state = EngineState.NoAudio;
        this._fire(EngineEvents.Error, { type: ErrorType.NoAudio, error: 'Web Audio API is not available' });
        return this;
      }

      // Read the input parameters from the options.

      var _ref = args || {},
          volume = _ref.volume,
          muted = _ref.muted,
          cleanUpInterval = _ref.cleanUpInterval,
          onadd = _ref.onadd,
          onremove = _ref.onremove,
          onstop = _ref.onstop,
          onpause = _ref.onpause,
          onmute = _ref.onmute,
          onvolume = _ref.onvolume,
          onsuspend = _ref.onsuspend,
          onresume = _ref.onresume,
          onerror = _ref.onerror,
          ondone = _ref.ondone;

      // Set the properties from the read parameters.


      typeof volume === 'number' && volume >= 0 && volume <= 1.0 && (this._volume = volume);
      typeof muted === 'boolean' && (this._muted = muted);
      typeof cleanUpInterval === 'number' && (this._cleanUpInterval = cleanUpInterval);
      typeof onadd === 'function' && this.on(EngineEvents.Add, onadd);
      typeof onremove === 'function' && this.on(EngineEvents.Remove, onremove);
      typeof onstop === 'function' && this.on(EngineEvents.Stop, onstop);
      typeof onpause === 'function' && this.on(EngineEvents.Pause, onpause);
      typeof onmute === 'function' && this.on(EngineEvents.Mute, onmute);
      typeof onvolume === 'function' && this.on(EngineEvents.Volume, onvolume);
      typeof onsuspend === 'function' && this.on(EngineEvents.Suspend, onsuspend);
      typeof onresume === 'function' && this.on(EngineEvents.Resume, onresume);
      typeof onerror === 'function' && this.on(EngineEvents.Error, onerror);
      typeof ondone === 'function' && this.on(EngineEvents.Done, ondone);

      // Create the buffer loader.
      this._loader = new _Loader2.default(this._context);

      // Auto-enable audio for the mobile devices in the first touch.
      _Utility2.default.enableAudio(this._context);

      // Create the audio graph.
      this._gainNode = this._context.createGain();
      this._gainNode.gain.setValueAtTime(this._muted ? 0 : this._volume, this._context.currentTime);
      this._gainNode.connect(this._context.destination);

      this._intervalId = window.setInterval(this._heap.free, this._cleanUpInterval * 60 * 1000);

      this._state = EngineState.Ready;

      return this;
    }

    /**
     * Loads single or multiple audio resources into audio buffers and returns them.
     * @param {string|string[]} urls Single or array of audio urls.
     * @return {Promise}
     */

  }, {
    key: 'load',
    value: function load(urls) {
      return this._loader.load(urls);
    }

    /**
     * Unloads single or multiple loaded audio buffers from cache.
     * @param {string|string[]} [urls] Single or array of audio urls.
     * @return {Engine}
     */

  }, {
    key: 'unload',
    value: function unload(urls) {
      this._loader.unload(urls);
      return this;
    }

    /**
     * Mutes the engine.
     * @return {Engine}
     */

  }, {
    key: 'mute',
    value: function mute() {
      // If the engine is already muted return.
      if (this._muted) {
        return this;
      }

      // Set the value of gain node to 0.
      this._gainNode.gain.setValueAtTime(0, this._context.currentTime);

      // Set the muted property true.
      this._muted = true;

      // Fire the "mute" event.
      this._fire(EngineEvents.Mute, this._muted);

      return this;
    }

    /**
     * Un-mutes the engine.
     * @return {Engine}
     */

  }, {
    key: 'unmute',
    value: function unmute() {
      // If the engine is not muted return.
      if (!this._muted) {
        return this;
      }

      // Reset the gain node's value back to volume.
      this._gainNode.gain.setValueAtTime(this._volume, this._context.currentTime);

      // Set the muted property to false.
      this._muted = false;

      // Fire the "mute" event.
      this._fire(EngineEvents.Mute, this._muted);

      return this;
    }

    /**
     * Gets/sets the volume for the audio engine that controls global volume for all sounds.
     * @param {number} [vol] Should be within 0.0 to 1.0.
     * @return {Engine|number}
     */

  }, {
    key: 'volume',
    value: function volume(vol) {
      // If no parameter is passed then return the current volume.
      if (vol === undefined) {
        return this._volume;
      }

      // If passed volume is not an acceptable value return.
      if (typeof vol !== 'number' || vol < 0 || vol > 1.0) {
        return this;
      }

      // Set the gain's value to the passed volume.
      this._gainNode.gain.setValueAtTime(this._muted ? 0 : vol, this._context.currentTime);

      // Set the volume to the property.
      this._volume = vol;

      // Fire the "volume" event.
      this._fire(EngineEvents.Volume, this._volume);

      return this;
    }

    /**
     * Stops all the currently playing sounds.
     * @return {Engine}
     */

  }, {
    key: 'stop',
    value: function stop() {
      // Stop all the sounds.
      this._heap.sounds().forEach(function (sound) {
        return sound.stop();
      });

      // Fire the "stop" event.
      this._fire(EngineEvents.Stop);

      return this;
    }

    /**
     * Stops all the playing sounds and suspends the audio context immediately.
     * @return {Engine}
     */

  }, {
    key: 'suspend',
    value: function suspend() {
      var _this = this;

      // If the context is resuming then suspend after resumed.
      if (this._state === EngineState.Resuming) {
        this._queue.add('after-resume', 'suspend', function () {
          return _this.suspend();
        });
        return this;
      }

      // If the state is not ready return.
      if (this._state !== EngineState.Ready) {
        return this;
      }

      // Stop all the playing sounds.
      this.stop();

      // Set the state to suspending.
      this._state = EngineState.Suspending;

      // Suspend the Audio Context.
      this._context.suspend().then(function () {
        _this._state = EngineState.Suspended;
        _this._queue.run('after-suspend');
        _this._fire(EngineEvents.Suspend);
      });

      return this;
    }

    /**
     * Resumes the audio context from the suspended mode.
     * @return {Engine}
     */

  }, {
    key: 'resume',
    value: function resume() {
      var _this2 = this;

      // If the context is suspending then resume after suspended.
      if (this._state === EngineState.Suspending) {
        this._queue.add('after-suspend', 'resume', function () {
          return _this2.resume();
        });
        return this;
      }

      if (!this._state !== EngineState.Suspended) {
        return this;
      }

      this._state = EngineState.Resuming;

      this._context.resume().then(function () {
        _this2._state = EngineState.Ready;
        _this2._queue.run('after-resume');
        _this2._fire(EngineEvents.Resume);
      });

      return this;
    }

    /**
     * Shuts down the engine.
     * @return {Engine}
     */

  }, {
    key: 'terminate',
    value: function terminate() {
      var _this3 = this;

      if (this._state === EngineState.Done || this._state === EngineState.Destroying) {
        return this;
      }

      var cleanUp = function cleanUp() {
        // Stop the timer.
        _this3._intervalId && window.clearInterval(_this3._intervalId);
        _this3._intervalId = null;

        // Destroy the heap.
        _this3._heap.destroy();
        _this3._heap = null;

        // Clear the cache and remove the loader.
        if (_this3._loader) {
          _this3._loader.dispose();
          _this3._loader = null;
        }

        _this3._context = null;
        _this3._queue.clear();
        _this3._queue = null;
        _this3._state = EngineState.Done;

        // Fire the "done" event.
        _this3._fire(EngineEvents.Done);

        _Emitter2.default.clear(_this3._id);
      };

      // Close the context.
      if (this._context) {
        if (this._state === EngineState.Suspending) {
          this._queue.remove('after-suspend');
          this._queue.add('after-suspend', 'destroy', function () {
            return _this3.terminate();
          });
          return this;
        } else if (this._state === EngineState.Resuming) {
          this._queue.remove('after-resume');
          this._queue.add('after-resume', 'destroy', function () {
            return _this3.terminate();
          });
          return this;
        }

        this._state = EngineState.Destroying;
        this._context && this._context.close().then(function () {
          return cleanUp();
        });
      } else {
        this._state = EngineState.Destroying;
        cleanUp();
      }

      return this;
    }

    /**
     * Subscribes to an event.
     * @param {string} eventName Name of the event.
     * @param {function} handler The event-handler function.
     * @param {boolean} [once = false] Is it one-time subscription or not.
     * @return {Engine}
     */

  }, {
    key: 'on',
    value: function on(eventName, handler) {
      var once = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      _Emitter2.default.on(this._id, eventName, handler, once);
      return this;
    }

    /**
     * Un-subscribes from an event.
     * @param {string} eventName The event name.
     * @param {function} [handler] The handler function.
     * @return {Engine}
     */

  }, {
    key: 'off',
    value: function off(eventName, handler) {
      _Emitter2.default.off(this._id, eventName, handler);
      return this;
    }

    /**
     * Returns the existing sound in heap or create a new one and return.
     * @param {number|string} idOrUrl The sound id or audio url/base64 string.
     * @param {number} [groupId] The group id.
     * @param {object} [args] The sound creation arguments.
     * @return {Sound}
     */

  }, {
    key: 'sound',
    value: function sound(idOrUrl, groupId, args) {
      if (typeof idOrUrl === 'number') {
        return this._heap.sound(idOrUrl);
      }

      var sound = new _Sound2.default(args);
      this._heap.add(idOrUrl, groupId, sound);
      sound._gain().connect(this._gainNode);

      return sound;
    }

    /**
     * Returns the sounds belongs to a group or all the sounds from the heap.
     * @param {number} [groupId] The group id.
     * @return {Array<Sound>}
     */

  }, {
    key: 'sounds',
    value: function sounds(groupId) {
      return this._heap.sounds(groupId);
    }

    /**
     * Destroys the sounds belong to the passed group.
     * @param {boolean} idle True to destroy only the idle sounds.
     * @param {number} groupId The group id.
     * @return {Engine}
     */

  }, {
    key: 'free',
    value: function free(idle, groupId) {
      this._heap.free(idle, groupId);
      return this;
    }

    /**
     * Returns whether the engine is currently muted or not.
     * @return {boolean}
     */

  }, {
    key: 'muted',
    value: function muted() {
      return this._muted;
    }

    /**
     * Returns the state of the engine.
     * @return {EngineState}
     */

  }, {
    key: 'state',
    value: function state() {
      return this._state;
    }

    /**
     * Returns the created audio context.
     * @return {AudioContext}
     */

  }, {
    key: 'context',
    value: function context() {
      return this._context;
    }

    /**
     * Returns true if Web Audio API is available.
     * @return {boolean}
     */

  }, {
    key: 'isAudioAvailable',
    value: function isAudioAvailable() {
      return this._isAudioAvailable;
    }

    /**
     * Fires an event of engine.
     * @param {string} eventName The event name.
     * @param {...*} args The arguments that to be passed to handler.
     * @return {Engine}
     * @private
     */

  }, {
    key: '_fire',
    value: function _fire(eventName) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      _Emitter2.default.fire.apply(_Emitter2.default, [this._id, eventName].concat(args, [this]));
      return this;
    }
  }]);

  return Engine;
}();

var engine = new Engine();
exports.default = engine;
exports.EngineState = EngineState;
exports.EngineEvents = EngineEvents;
exports.ErrorType = ErrorType;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DownloadStatus = exports.DownloadResult = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Utility = __webpack_require__(0);

var _Utility2 = _interopRequireDefault(_Utility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Enum to represent the download status of audio resource.
 * @enum {string}
 */
var DownloadStatus = {
  Success: 'success',
  Failure: 'error'
};

/**
 * Represents the download result of an audio.
 * @class
 */

var DownloadResult =

/**
 * @param {string|null} url The url of the audio resource
 * @param {AudioBuffer|Audio} [value] AudioBuffer or Html5Audio element
 * @param {*} [error] Download error
 */


/**
 * Download error
 * @type {any}
 */


/**
 * The url of the audio resource
 * @type {string|null}
 */
function DownloadResult(url, value, error) {
  _classCallCheck(this, DownloadResult);

  this.url = null;
  this.value = null;
  this.error = null;
  this.status = null;

  this.url = url;
  this.value = value;
  this.error = error || null;
  this.status = error ? DownloadStatus.Failure : DownloadStatus.Success;
}

/**
 * Success or failure status of download.
 * @type {DownloadStatus}
 */


/**
 * AudioBuffer or Html5Audio element
 * @type {AudioBuffer|Audio}
 */
;

/**
 * Loads the audio sources into audio buffers and returns them.
 * The loaded buffers are cached.
 * @class
 */


var Loader = function () {

  /**
   * Create the cache.
   * @param {AudioContext} context The Audio Context
   */


  /**
   * Dictionary to store the current progress calls and their callbacks.
   * @type {object}
   * @private
   */


  /**
   * AudioContext.
   * @type {AudioContext}
   * @private
   */
  function Loader(context) {
    _classCallCheck(this, Loader);

    this._context = null;
    this._bufferCache = {};
    this._progressCallsAndCallbacks = {};
    this._disposed = false;

    this._context = context;
  }

  /**
   * Loads single or multiple audio resources into audio buffers.
   * @param {string|string[]} urls Single or array of audio urls
   * @return {Promise<DownloadResult|Array<DownloadResult>>}
   */


  /**
   * True if the loader is disposed.
   * @type {boolean}
   * @private
   */


  /**
   * In-memory audio buffer cache store.
   * @type {object}
   * @private
   */


  _createClass(Loader, [{
    key: 'load',
    value: function load(urls) {
      var _this = this;

      if (typeof urls === 'string') {
        return this._load(urls);
      }

      return Promise.all(urls.map(function (url) {
        return _this._load(url);
      }));
    }

    /**
     * Removes the cached audio buffers.
     * @param {string|string[]} [urls] Single or array of audio urls
     */

  }, {
    key: 'unload',
    value: function unload(urls) {
      var _this2 = this;

      if (typeof urls === 'string') {
        this._unload(urls);
        return;
      }

      if (Array.isArray(urls)) {
        urls.forEach(function (url) {
          return _this2._unload(url);
        }, this);
        return;
      }

      this._bufferCache = {};
    }

    /**
     * Dispose the loader.
     */

  }, {
    key: 'dispose',
    value: function dispose() {
      if (this._disposed) {
        return;
      }

      this.unload();
      this._bufferCache = {};
      this._progressCallsAndCallbacks = null;
      this._context = null;
      this._disposed = true;
    }

    /**
     * Loads a single audio resource into audio buffer and cache result if the download is succeeded.
     * @param {string} url The Audio url
     * @return {Promise<DownloadResult>}
     * @private
     */

  }, {
    key: '_load',
    value: function _load(url) {
      var _this3 = this;

      return new Promise(function (resolve) {
        if (_this3._bufferCache.hasOwnProperty(url)) {
          resolve(new DownloadResult(url, _this3._bufferCache[url]));
          return;
        }

        if (_this3._progressCallsAndCallbacks.hasOwnProperty(url)) {
          _this3._progressCallsAndCallbacks[url].push(resolve);
          return;
        }

        _this3._progressCallsAndCallbacks[url] = [];
        _this3._progressCallsAndCallbacks[url].push(resolve);

        var reject = function reject(err) {
          if (_this3._disposed) {
            return;
          }

          _this3._progressCallsAndCallbacks[url].forEach(function (r) {
            return r(new DownloadResult(url, null, err));
          });
          delete _this3._progressCallsAndCallbacks[url];
        };

        var decodeAudioData = function decodeAudioData(arrayBuffer) {
          if (_this3._disposed) {
            return;
          }

          _this3._context.decodeAudioData(arrayBuffer, function (buffer) {
            _this3._bufferCache[url] = buffer;
            _this3._progressCallsAndCallbacks[url].forEach(function (r) {
              return r(new DownloadResult(url, buffer));
            });
            delete _this3._progressCallsAndCallbacks[url];
          }, reject);
        };

        if (_Utility2.default.isBase64(url)) {
          var data = atob(url.split(',')[1]);
          var dataView = new Uint8Array(data.length); // eslint-disable-line no-undef

          for (var i = 0; i < data.length; ++i) {
            dataView[i] = data.charCodeAt(i);
          }

          decodeAudioData(dataView);
          return;
        }

        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.responseType = 'arraybuffer';

        req.addEventListener('load', function () {
          return decodeAudioData(req.response);
        }, false);
        req.addEventListener('error', reject, false);
        req.send();
      });
    }

    /**
     * Removes the single cached audio buffer.
     * @param {string} url Audio url
     * @private
     */

  }, {
    key: '_unload',
    value: function _unload(url) {
      delete this._bufferCache[url];
    }
  }]);

  return Loader;
}();

exports.default = Loader;
exports.DownloadResult = DownloadResult;
exports.DownloadStatus = DownloadStatus;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Stores queue of actions that has to be run before or after specific events.
 */
var Queue = function () {
  function Queue() {
    _classCallCheck(this, Queue);

    this._eventActions = {};
  }

  _createClass(Queue, [{
    key: 'add',


    /**
     * Queues the passed action to the event.
     * @param {string} eventName The event name.
     * @param {string} actionIdentifier The action identifier.
     * @param {function} action The action function.
     * @param {boolean} [removeAfterRun = true] Remove the action once it's run.
     */
    value: function add(eventName, actionIdentifier, action) {
      var removeAfterRun = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

      if (!this.hasEvent(eventName)) {
        this._eventActions[eventName] = {};
      }

      this._eventActions[eventName][actionIdentifier] = { fn: action, removeAfterRun: removeAfterRun };
    }

    /**
     * Returns true if there is a event exists for the passed name.
     * @param {string} eventName The event name.
     * @return {boolean}
     */

  }, {
    key: 'hasEvent',
    value: function hasEvent(eventName) {
      return this._eventActions.hasOwnProperty(eventName);
    }

    /**
     * Returns true if the passed action is already queued-up.
     * @param {string} eventName The event name.
     * @param {string} actionIdentifier The action identifier.
     * @return {boolean}
     */

  }, {
    key: 'hasAction',
    value: function hasAction(eventName, actionIdentifier) {
      if (!this.hasEvent(eventName)) {
        return false;
      }

      return this._eventActions[eventName].hasOwnProperty(actionIdentifier);
    }

    /**
     * Runs all the actions queued up for the passed event.
     * @param {string} eventName The event name.
     * @param {string} [actionIdentifier] The action identifier.
     */

  }, {
    key: 'run',
    value: function run(eventName, actionIdentifier) {
      var _this = this;

      if (!this.hasEvent(eventName)) {
        return;
      }

      if (typeof actionIdentifier !== 'undefined') {
        if (!this.hasAction(eventName, actionIdentifier)) {
          return;
        }

        this._run(eventName, actionIdentifier);

        return;
      }

      Object.keys(this._eventActions[eventName]).forEach(function (action) {
        return _this._run(eventName, action);
      });
    }

    /**
     * Removes the event or a queued action for the event.
     * @param {string} eventName The event name.
     * @param {string} [actionIdentifier] The action identifier.
     */

  }, {
    key: 'remove',
    value: function remove(eventName, actionIdentifier) {
      if (!this._eventActions.hasOwnProperty(eventName)) {
        return;
      }

      if (!actionIdentifier) {
        delete this._eventActions[eventName];
        return;
      }

      delete this._eventActions[eventName][actionIdentifier];
    }

    /**
     * Clears all the stored events and the queued-up actions.
     */

  }, {
    key: 'clear',
    value: function clear() {
      this._eventActions = {};
    }

    /**
     * Runs a single action.
     * @param {string} eventName The event name.
     * @param {string} actionIdentifier The action identifier.
     * @private
     */

  }, {
    key: '_run',
    value: function _run(eventName, actionIdentifier) {
      var queued = this._eventActions[eventName][actionIdentifier];
      queued.fn();
      queued.removeAfterRun && this.remove(eventName, actionIdentifier);
    }
  }]);

  return Queue;
}();

exports.default = Queue;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Represents a heap item.
 */
var HeapItem =

/**
 * Set the group id and sound.
 * @param {number} groupId The group id.
 * @param {Sound} sound The sound instance.
 */


/**
 * The sound object.
 * @type {Sound}
 */
function HeapItem(groupId, sound) {
  _classCallCheck(this, HeapItem);

  this.sound = null;
  this.groupId = null;

  this.groupId = groupId;
  this.sound = sound;
}

/**
 * The group id.
 * @type {number|null}
 */
;

/**
 * Represents a collection of sounds belong to an audio resource.
 */


var HeapItemCollection = function () {
  function HeapItemCollection() {
    _classCallCheck(this, HeapItemCollection);

    this.url = null;
    this.items = {};
  }

  /**
   * The audio source url.
   * @type {string|null}
   */


  /**
   * The collection of sound objects.
   * @type {object}
   */


  _createClass(HeapItemCollection, [{
    key: "add",


    /**
     * Adds a new sound item to the collection.
     * @param {number} groupId The group id.
     * @param {Sound} sound The sound instance.
     */
    value: function add(groupId, sound) {
      var soundId = sound.id().toString();

      if (this.items.hasOwnProperty(soundId)) {
        return;
      }

      this.items[soundId] = new HeapItem(groupId, sound);
    }

    /**
     * Removes the sounds.
     * @param {boolean} [idle = true] True to destroy only the idle sounds.
     * @param {number} [groupId] The group id.
     */

  }, {
    key: "free",
    value: function free() {
      var _this = this;

      var idle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var groupId = arguments[1];

      Object.values(this.items).forEach(function (item) {
        var sound = item.sound,
            soundGroupId = item.soundGroupId;


        if (idle && (sound.isPlaying() || sound.isPaused())) {
          return;
        }

        if (!Boolean(groupId) || soundGroupId === groupId) {
          sound.destroy();
          delete _this.items[sound.id()];
        }
      });
    }

    /**
     * Returns the sounds belong to the group or all the sounds in the collection.
     * @param {number} [groupId] The group id.
     * @return {Array<HeapItem>}
     */

  }, {
    key: "sounds",
    value: function sounds(groupId) {
      var itemsArray = Object.values(this.items);
      var items = groupId ? itemsArray.filter(function (item) {
        return item.groupId === groupId;
      }) : itemsArray;
      return items.map(function (item) {
        return item.sound;
      });
    }

    /**
     * Destroys all the sounds.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      Object.values(this.items).forEach(function (item) {
        return item.sound.destroy();
      });
      this.items = {};
    }
  }]);

  return HeapItemCollection;
}();

/**
 * Stores all the created sounds.
 */


var Heap = function () {

  /**
   * Initialize stuff.
   */
  function Heap() {
    _classCallCheck(this, Heap);

    this._collections = {};

    this.free = this.free.bind(this);
  }

  /**
   * Adds a new sound to the respective collection.
   * @param {string} url The audio source url or base64 string.
   * @param {number} groupId The group id.
   * @param {Sound} sound The sound instance.
   */


  /**
   * The sound collections.
   * @type {object}
   * @private
   */


  _createClass(Heap, [{
    key: "add",
    value: function add(url, groupId, sound) {
      if (!this._collections.hasOwnProperty(url)) {
        this._collections[url] = new HeapItemCollection();
      }

      this._collections[url].add(groupId, sound);
    }

    /**
     * Returns the sound based on the id.
     * @param {number} id The sound id.
     */

  }, {
    key: "sound",
    value: function sound(id) {
      return this.sounds().find(function (sound) {
        return sound.id() === id;
      });
    }

    /**
     * Returns the sounds belongs to a particular group or all of them.
     * @param {number} [groupId] The group id.
     * @return {Array}
     */

  }, {
    key: "sounds",
    value: function sounds(groupId) {
      var sounds = [];
      Object.values(this._collections).forEach(function (col) {
        return sounds.push.apply(sounds, _toConsumableArray(col.sounds(groupId)));
      });
      return sounds;
    }

    /**
     * Removes sounds from the collections.
     * @param {boolean} [idle = true] True to destroy only the idle sounds.
     * @param {number} [groupId] The group id.
     */

  }, {
    key: "free",
    value: function free() {
      var idle = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var groupId = arguments[1];

      Object.values(this._collections).forEach(function (col) {
        return col.free(idle, groupId);
      });
    }

    /**
     * Destroys all the sounds.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      Object.values(this._collections).forEach(function (col) {
        return col.destroy();
      });
      this._collections = {};
    }
  }]);

  return Heap;
}();

exports.default = Heap;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SoundState = exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Engine = __webpack_require__(2);

var _Engine2 = _interopRequireDefault(_Engine);

var _Utility = __webpack_require__(0);

var _Utility2 = _interopRequireDefault(_Utility);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Enum that represents the different states of a sound.
 * @enum {string}
 */
var SoundState = {
  Ready: 'ready',
  Playing: 'playing',
  Paused: 'paused',
  Destroyed: 'destroyed'
};

/**
 * Represents a sound created using Web Audio API.
 * @class
 */

var Sound = function () {

  /**
   * Initializes the internal properties of the sound.
   * @param {object} args The input parameters of the sound.
   * @param {string} [args.id] The unique id of the sound.
   * @param {AudioBuffer} [args.buffer] Audio source buffer.
   * @param {number} [args.volume = 1.0] The initial volume of the sound. Should be from 0.0 to 1.0.
   * @param {number} [args.rate = 1] The initial playback rate of the sound. Should be from 0.5 to 5.0.
   * @param {boolean} [args.loop = false] True to play the sound repeatedly.
   * @param {boolean} [args.muted = false] True to be muted initially.
   * @param {number} [args.startPos] The playback start position.
   * @param {number} [args.endPos] The playback end position.
   * @param {function} [args.playEndCallback] The callback that will be invoked after the play ends.
   * @param {function} [args.destroyCallback] The callback that will be invoked after destroyed.
   * @constructor
   */


  /**
   * The callback that will be invoked after the play ends.
   * @type {function}
   * @private
   */


  /**
   * The position of the playback during rate change.
   * @type {number}
   * @private
   */


  /**
   * The playback end position.
   * @type {number}
   * @private
   */


  /**
   * Duration of the playback in seconds.
   * @type {number}
   * @private
   */


  /**
   * The audio buffer.
   * @type {AudioBuffer}
   * @private
   */


  /**
   * Web API's audio context.
   * @type {AudioContext}
   * @private
   */


  /**
   * True if the sound should play repeatedly.
   * @type {boolean}
   * @private
   */


  /**
   * The current playback speed. Should be from 0.5 to 5.
   * @type {number}
   * @private
   */


  /**
   * Unique id.
   * @type {number}
   * @private
   */
  function Sound(args) {
    _classCallCheck(this, Sound);

    this._id = -1;
    this._volume = 1.0;
    this._rate = 1;
    this._muted = false;
    this._loop = false;
    this._state = SoundState.Ready;
    this._context = null;
    this._gainNode = null;
    this._buffer = null;
    this._bufferSourceNode = null;
    this._duration = 0;
    this._startPos = 0;
    this._endPos = 0;
    this._currentPos = 0;
    this._rateSeek = 0;
    this._startTime = 0;
    this._playEndCallback = null;
    this._destroyCallback = null;
    var id = args.id,
        buffer = args.buffer,
        volume = args.volume,
        rate = args.rate,
        loop = args.loop,
        muted = args.muted,
        startPos = args.startPos,
        endPos = args.endPos,
        playEndCallback = args.playEndCallback,
        destroyCallback = args.destroyCallback;

    // Set the passed id or the random one.

    this._id = typeof id === 'number' ? id : _Utility2.default.id();

    // Set the passed audio buffer and duration.
    this._buffer = buffer;
    this._endPos = this._buffer.duration;

    // Set other properties.
    volume && (this._volume = volume);
    rate && (this._rate = rate);
    muted && (this._muted = muted);
    loop && (this._loop = loop);
    startPos && (this._startPos = startPos);
    endPos && (this._endPos = endPos);
    this._playEndCallback = playEndCallback;
    this._destroyCallback = destroyCallback;

    // Calculate the duration.
    this._duration = this._endPos - this._startPos;

    // Create gain node and set the volume.
    this._context = _Engine2.default.context();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.setValueAtTime(this._muted ? 0 : this._volume, this._context.currentTime);
  }

  /**
   * Plays the sound or the sound defined in the sprite.
   * @return {Sound}
   */


  /**
   * The callback that will be invoked after the sound destroyed.
   * @type {function}
   * @private
   */


  /**
   * The time at which the playback started.
   * This property is required for getting the seek position of the playback.
   * @type {number}
   * @private
   */


  /**
   * The current position of the playback.
   * @type {number}
   * @private
   */


  /**
   * The playback start position.
   * @type {number}
   * @private
   */


  /**
   * The AudioBufferSourceNode that plays the audio buffer assigned to it.
   * @type {AudioBufferSourceNode}
   * @private
   */


  /**
   * The gain node to control the volume of the sound.
   * @type {GainNode}
   * @private
   */


  /**
   * The current state (playing, paused etc.) of the sound.
   * @type {SoundState}
   * @private
   */


  /**
   * True if the sound is currently muted.
   * @type {boolean}
   * @private
   */


  /**
   * The current volume of the sound. Should be from 0.0 to 1.0.
   * @type {number}
   * @private
   */


  _createClass(Sound, [{
    key: 'play',
    value: function play() {
      var _this = this;

      // If the sound is already playing then return.
      if (this.isPlaying()) {
        return this;
      }

      // Get the playback starting position.
      var seek = Math.max(0, this._currentPos > 0 ? this._currentPos : this._startPos);

      // Create a new buffersourcenode to play the sound.
      this._bufferSourceNode = this._context.createBufferSource();

      // Set the buffer, playback rate and loop parameters
      this._bufferSourceNode.buffer = this._buffer;
      this._bufferSourceNode.playbackRate.setValueAtTime(this._rate, this._context.currentTime);
      this._setLoop(this._loop);

      // Connect the node to the audio graph.
      this._bufferSourceNode.connect(this._gainNode);

      // Listen to the "ended" event to reset/clean things.
      this._bufferSourceNode.addEventListener('ended', function () {
        // Reset the seek positions
        _this._currentPos = 0;
        _this._rateSeek = 0;

        // Destroy the node (AudioBufferSourceNodes are one-time use and throw objects).
        _this._destroyBufferNode();

        // Reset the state to allow future actions.
        _this._state = SoundState.Ready;

        // Invoke the callback if there is one.
        _this._playEndCallback && _this._playEndCallback(_this);
      });

      var startTime = this._context.currentTime;

      // Call the supported method to play the sound.
      if (typeof this._bufferSourceNode.start !== 'undefined') {
        this._bufferSourceNode.start(startTime, seek, this._loop ? undefined : this._duration);
      } else {
        this._bufferSourceNode.noteGrainOn(startTime, seek, this._loop ? undefined : this._duration);
      }

      // Record the starting time and set the state.
      this._startTime = startTime;
      this._state = SoundState.Playing;

      return this;
    }

    /**
     * Pauses the playing sound.
     * @return {Sound}
     */

  }, {
    key: 'pause',
    value: function pause() {
      // If the sound is already playing return.
      if (!this.isPlaying()) {
        return this;
      }

      // Save the current position and reset rateSeek.
      this._currentPos = this.seek();
      this._rateSeek = 0;

      this._destroyBufferNode();

      this._state = SoundState.Paused;

      return this;
    }

    /**
     * Stops the sound that is playing or in paused state.
     * @return {Sound}
     */

  }, {
    key: 'stop',
    value: function stop() {
      // If the sound is not playing or paused return.
      if (!this.isPlaying() && !this.isPaused()) {
        return this;
      }

      // Reset the variables
      this._currentPos = 0;
      this._rateSeek = 0;

      this._destroyBufferNode();

      this._state = SoundState.Ready;

      return this;
    }

    /**
     * Mutes the sound.
     * @return {Sound}
     */

  }, {
    key: 'mute',
    value: function mute() {
      // Set the value of gain node to 0.
      this._gainNode.gain.setValueAtTime(0, this._context.currentTime);

      // Set the muted property true.
      this._muted = true;

      return this;
    }

    /**
     * Un-mutes the sound.
     * @return {Sound}
     */

  }, {
    key: 'unmute',
    value: function unmute() {
      // Reset the gain node's value back to volume.
      this._gainNode.gain.setValueAtTime(this._volume, this._context.currentTime);

      // Set the muted property to false.
      this._muted = false;

      return this;
    }

    /**
     * Gets/sets the volume.
     * @param {number} [vol] Should be from 0.0 to 1.0.
     * @return {Sound|number}
     */

  }, {
    key: 'volume',
    value: function volume(vol) {
      // If no input parameter is passed then return the volume.
      // If gain node is available read and return the value from it (helps in returning accurate value during fading)
      // or else delegate that to the derived type.
      if (typeof vol === 'undefined') {
        return this._volume;
      }

      // Set the gain's value to the passed volume.
      this._gainNode.gain.setValueAtTime(this._muted ? 0 : vol, this._context.currentTime);

      // Set the volume to the property.
      this._volume = vol;

      return this;
    }

    /**
     * Gets/sets the playback rate.
     * @param {number} [rate] The playback rate. Should be from 0.5 to 5.
     * @return {Sound|number}
     */

  }, {
    key: 'rate',
    value: function rate(_rate) {
      // If no input parameter is passed return the current rate.
      if (typeof _rate === 'undefined') {
        return this._rate;
      }

      this._rate = _rate;
      this._rateSeek = this.seek();

      if (this.isPlaying()) {
        this._startTime = this._context.currentTime;
        this._bufferSourceNode && this._bufferSourceNode.playbackRate.setValueAtTime(_rate, this._context.currentTime);
      }

      return this;
    }

    /**
     * Gets/sets the seek position.
     * @param {number} [seek] The seek position.
     * @return {Sound|number}
     */

  }, {
    key: 'seek',
    value: function seek(_seek) {
      // If no parameter is passed return the current position.
      if (typeof _seek === 'undefined') {
        var realTime = this.isPlaying() ? this._context.currentTime - this._startTime : 0;
        var rateElapsed = this._rateSeek ? this._rateSeek - this._currentPos : 0;

        return this._currentPos + (rateElapsed + realTime * this._rate);
      }

      // If seeking outside the borders then return.
      if (_seek < this._startPos || _seek > this._endPos) {
        return this;
      }

      // If the sound is currently playing... pause it, set the seek position and then continue playing.
      var isPlaying = this.isPlaying();

      if (isPlaying) {
        this.pause();
      }

      this._currentPos = _seek;

      if (isPlaying) {
        this.play();
      }

      return this;
    }

    /**
     * Gets/sets the loop parameter of the sound.
     * @param {boolean} [loop] True to loop the sound.
     * @return {Sound/boolean}
     */

  }, {
    key: 'loop',
    value: function loop(_loop) {
      if (typeof _loop !== 'boolean') {
        return this._loop;
      }

      this._loop = _loop;
      this._setLoop(_loop);

      return this;
    }

    /**
     * Destroys the dependencies and release the memory.
     * @return {Sound}
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      // If the sound is already destroyed return.
      if (this._state === SoundState.Destroyed) {
        return this;
      }

      // Stop the sound.
      this.stop();

      this._gainNode.disconnect();

      this._buffer = null;
      this._context = null;
      this._gainNode = null;

      // Set the state to "destroyed".
      this._state = SoundState.Destroyed;

      this._destroyCallback && this._destroyCallback(this);

      return this;
    }

    /**
     * Returns the unique id of the sound.
     * @return {number}
     */

  }, {
    key: 'id',
    value: function id() {
      return this._id;
    }

    /**
     * Returns whether the sound is muted or not.
     * @return {boolean}
     */

  }, {
    key: 'muted',
    value: function muted() {
      return this._muted;
    }

    /**
     * Returns the state of the sound.
     * @return {SoundState}
     */

  }, {
    key: 'state',
    value: function state() {
      return this._state;
    }

    /**
     * Returns the total duration of the playback.
     * @return {number}
     */

  }, {
    key: 'duration',
    value: function duration() {
      return this._duration;
    }

    /**
     * Returns true if the buzz is playing.
     * @return {boolean}
     */

  }, {
    key: 'isPlaying',
    value: function isPlaying() {
      return this._state === SoundState.Playing;
    }

    /**
     * Returns true if buzz is paused.
     * @return {boolean}
     */

  }, {
    key: 'isPaused',
    value: function isPaused() {
      return this._state === SoundState.Paused;
    }

    /**
     * Returns the gain node.
     * @return {GainNode}
     */

  }, {
    key: '_gain',
    value: function _gain() {
      return this._gainNode;
    }

    /**
     * Stops the playing buffer source node and destroys it.
     * @private
     */

  }, {
    key: '_destroyBufferNode',
    value: function _destroyBufferNode() {
      if (!this._bufferSourceNode) {
        return;
      }

      if (typeof this._bufferSourceNode.stop !== 'undefined') {
        this._bufferSourceNode.stop();
      } else {
        this._bufferSourceNode.noteGrainOff();
      }

      this._bufferSourceNode.disconnect();
      this._bufferSourceNode.removeEventListener('ended', this._onEnded);
      this._bufferSourceNode = null;
    }

    /**
     * Sets the sound to play repeatedly or not.
     * @param {boolean} loop True to play the sound repeatedly.
     * @private
     */

  }, {
    key: '_setLoop',
    value: function _setLoop(loop) {
      if (!this._bufferSourceNode) {
        return;
      }

      this._bufferSourceNode.loop = loop;

      if (loop) {
        this._bufferSourceNode.loopStart = this._startPos;
        this._bufferSourceNode.loopEnd = this._endPos;
      }
    }
  }]);

  return Sound;
}();

exports.default = Sound;
exports.SoundState = SoundState;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _Engine = __webpack_require__(2);

var _Engine2 = _interopRequireDefault(_Engine);

var _Queue = __webpack_require__(4);

var _Queue2 = _interopRequireDefault(_Queue);

var _Utility = __webpack_require__(0);

var _Utility2 = _interopRequireDefault(_Utility);

var _Emitter = __webpack_require__(1);

var _Emitter2 = _interopRequireDefault(_Emitter);

var _Loader = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Enum that represents the different states of a sound group (buzz).
 * @enum {string}
 */
var BuzzState = {
  Ready: 'ready',
  Destroyed: 'destroyed'
};

/**
 * Enum that represents the different events fired by a buzz.
 * @enum {string}
 */
var BuzzEvents = {
  Load: 'load',
  UnLoad: 'unload',
  PlayStart: 'playstart',
  PlayEnd: 'playend',
  Pause: 'pause',
  Stop: 'stop',
  Volume: 'volume',
  Mute: 'mute',
  Seek: 'seek',
  Rate: 'rate',
  Error: 'error',
  Destroy: 'destroy'
};

/**
 * Enum that represents the different states occurs while loading a sound.
 * @enum {string}
 */
var LoadState = {
  NotLoaded: 'notloaded',
  Loading: 'loading',
  Loaded: 'loaded'
};

/**
 * A wrapper class that simplifies dealing with group of sounds.
 */

var Buzz = function () {

  /**
   * Initializes the internal properties.
   * @param {string|Array<string>|object} args The input parameters of this sound group.
   * @param {string} [args.id] The unique id of the sound.
   * @param {string|string[]} args.src Single or array of audio urls/base64 strings.
   * @param {number} [args.volume = 1.0] The initial volume of the sound. Should be from 0.0 to 1.0.
   * @param {number} [args.rate = 1] The initial playback rate of the sound. Should be from 0.5 to 5.0.
   * @param {boolean} [args.loop = false] True to play the sound repeatedly.
   * @param {boolean} [args.muted = false] True to be muted initially.
   * @param {boolean} [args.preload = false] True to pre-load the sound after construction.
   * @param {boolean} [args.autoplay = false] True to play automatically after construction.
   * @param {string|string[]} [args.format] The file format(s) of the passed audio source(s).
   * @param {object} [args.sprite] The sprite definition.
   * @param {function} [args.onload] Event-handler for the "load" event.
   * @param {function} [args.onunload] Event-handler for the "unload" event.
   * @param {function} [args.onplaystart] Event-handler for the "playstart" event.
   * @param {function} [args.onplayend] Event-handler for the "playend" event.
   * @param {function} [args.onstop] Event-handler for the "stop" event.
   * @param {function} [args.onpause] Event-handler for the "pause" event.
   * @param {function} [args.onmute] Event-handler for the "mute" event.
   * @param {function} [args.onvolume] Event-handler for the "volume" event.
   * @param {function} [args.onrate] Event-handler for the "rate" event.
   * @param {function} [args.onseek] Event-handler for the "seek" event.
   * @param {function} [args.onerror] Event-handler for the "error" event.
   * @param {function} [args.ondestroy] Event-handler for the "destroy" event.
   * @constructor
   */


  /**
   * The action queue.
   * @type {Queue}
   * @private
   */


  /**
   * Represents the different states that occurs while loading the sound.
   * @type {LoadState}
   * @protected
   */


  /**
   * Duration of the playback in seconds.
   * @type {number}
   * @protected
   */


  /**
   * True to auto-play the sound on construction.
   * @type {boolean}
   * @protected
   */


  /**
   * True if the sound should play repeatedly.
   * @type {boolean}
   * @protected
   */


  /**
   * The current rate of the playback. Should be from 0.5 to 5.
   * @type {number}
   * @protected
   */


  /**
   * The sprite definition.
   * @type {object}
   * @protected
   */


  /**
   * Represents the source of the sound. The source can be an url or base64 string.
   * @type {*}
   * @protected
   */
  function Buzz(args) {
    _classCallCheck(this, Buzz);

    this._id = -1;
    this._src = null;
    this._format = [];
    this._sprite = null;
    this._volume = 1.0;
    this._rate = 1;
    this._muted = false;
    this._loop = false;
    this._preload = false;
    this._autoplay = false;
    this._buffer = null;
    this._duration = 0;
    this._compatibleSrc = null;
    this._loadState = LoadState.NotLoaded;
    this._state = BuzzState.Ready;
    this._queue = null;
    this._engine = null;

    // Setup the audio engine.
    this._engine = _Engine2.default;
    this._engine.setup();

    // If no audio is available throw error.
    if (!this._engine.isAudioAvailable()) {
      this._fire(BuzzEvents.Error, null, { type: _Engine.ErrorType.NoAudio, error: 'Web Audio is un-available' });
      return this;
    }

    if (typeof args === 'string') {
      this._src = [args];
    } else if (Array.isArray(args) && args.length) {
      this._src = args;
    } else if ((typeof args === 'undefined' ? 'undefined' : _typeof(args)) === 'object') {
      var id = args.id,
          src = args.src,
          format = args.format,
          sprite = args.sprite,
          volume = args.volume,
          rate = args.rate,
          muted = args.muted,
          loop = args.loop,
          autoplay = args.autoplay,
          preload = args.preload,
          onload = args.onload,
          onunload = args.onunload,
          onplaystart = args.onplaystart,
          onplayend = args.onplayend,
          onstop = args.onstop,
          onpause = args.onpause,
          onmute = args.onmute,
          onvolume = args.onvolume,
          onrate = args.onrate,
          onseek = args.onseek,
          onerror = args.onerror,
          ondestroy = args.ondestroy;

      // Set the passed id or the random one.

      this._id = typeof id === 'number' ? id : _Utility2.default.id();

      // Set the source.
      if (typeof src === 'string') {
        this._src = [src];
      } else if (Array.isArray(src) && src.length) {
        this._src = src;
      }

      // Set the format.
      if (Array.isArray(format)) {
        this._format = format;
      } else if (typeof format === 'string' && format) {
        this._format = [format];
      }

      // Set other properties.
      (typeof sprite === 'undefined' ? 'undefined' : _typeof(sprite)) === 'object' && (this._sprite = sprite);
      typeof volume === 'number' && volume >= 0 && volume <= 1.0 && (this._volume = volume);
      typeof rate === 'number' && rate >= 0.5 && rate <= 5 && (this._rate = rate);
      typeof muted === 'boolean' && (this._muted = muted);
      typeof loop === 'boolean' && (this._loop = loop);
      typeof autoplay === 'boolean' && (this._autoplay = autoplay);
      typeof preload === 'boolean' && (this._preload = preload);
      typeof onload === 'function' && this.on(BuzzEvents.Load, onload);
      typeof onunload === 'function' && this.on(BuzzEvents.UnLoad, onunload);

      // Bind the passed event handlers to events.
      typeof onplaystart === 'function' && this.on(BuzzEvents.PlayStart, onplaystart);
      typeof onplayend === 'function' && this.on(BuzzEvents.PlayEnd, onplayend);
      typeof onstop === 'function' && this.on(BuzzEvents.Stop, onstop);
      typeof onpause === 'function' && this.on(BuzzEvents.Pause, onpause);
      typeof onmute === 'function' && this.on(BuzzEvents.Mute, onmute);
      typeof onvolume === 'function' && this.on(BuzzEvents.Volume, onvolume);
      typeof onrate === 'function' && this.on(BuzzEvents.Rate, onrate);
      typeof onseek === 'function' && this.on(BuzzEvents.Seek, onseek);
      typeof onerror === 'function' && this.on(BuzzEvents.Error, onerror);
      typeof ondestroy === 'function' && this.on(BuzzEvents.Destroy, ondestroy);
    }

    // Throw error if source is not passed.
    if (!this._src) {
      throw new Error('You should pass the source for the audio.');
    }

    // Instantiate the dependencies.
    this._queue = new _Queue2.default();

    if (this._autoplay) {
      this.play();
    } else if (this._preload) {
      this.load();
    }
  }

  /**
   * Loads the sound to the underlying audio object.
   * @return {Buzz}
   */


  /**
   * The audio engine.
   * @type {Engine}
   * @private
   */


  /**
   * Represents the state of this group.
   * @type {BuzzState}
   * @private
   */


  /**
   * The best compatible source in the audio sources passed.
   * @type {string|null}
   * @protected
   */


  /**
   * The audio buffer.
   * @type {AudioBuffer}
   * @private
   */


  /**
   * True to pre-loaded the sound on construction.
   * @type {boolean}
   * @protected
   */


  /**
   * True if the sound is currently muted.
   * @type {boolean}
   * @protected
   */


  /**
   * The current volume of the sound. Should be from 0.0 to 1.0.
   * @type {number}
   * @protected
   */


  /**
   * The formats of the passed audio sources.
   * @type {Array<string>}
   * @protected
   */


  /**
   * Unique id.
   * @type {number}
   * @protected
   */


  _createClass(Buzz, [{
    key: 'load',
    value: function load() {
      var _this = this;

      // If the sound is already loaded return without reloading again.
      if (this.isLoaded() || this._loadState === LoadState.Loading) {
        return this;
      }

      // Set the state to "Loading" to avoid loading multiple times.
      this._loadState = LoadState.Loading;

      // Get the compatible source.
      var src = this._compatibleSrc || (this._compatibleSrc = this.getCompatibleSource());

      // If no compatible source found call failure method and return.
      if (!src) {
        this._onLoadFailure('The audio formats you passed are not supported');
        return this;
      }

      // Load the audio source.
      this._engine.load(src).then(function (downloadResult) {
        // During the time of loading... if the buzz is unloaded or destroyed then return.
        if (_this._loadState === LoadState.NotLoaded || _this._state === BuzzState.Destroyed) {
          return;
        }

        // If loading succeeded,
        // i. Save the result.
        // ii. Set the load state as loaded.
        // iii. Fire the load event.
        // iv. Run the methods that are queued to run after successful load.
        if (downloadResult.status === _Loader.DownloadStatus.Success) {
          _this._buffer = downloadResult.value;
          _this._duration = _this._buffer.duration;
          _this._loadState = LoadState.Loaded;
          _this._fire(BuzzEvents.Load, null, downloadResult);
          _this._queue.run('after-load');
          return;
        }

        _this._onLoadFailure(downloadResult.error);
      });

      return this;
    }

    /**
     * Called on failure of loading audio source.
     * @param {*} error The audio source load error.
     * @protected
     */

  }, {
    key: '_onLoadFailure',
    value: function _onLoadFailure(error) {
      // Remove the queued actions from this class that are supposed to run after load.
      this._queue.remove('after-load');

      // Set the load state back to not loaded.
      this._loadState = LoadState.NotLoaded;

      // Fire the error event.
      this._fire(BuzzEvents.Error, null, { type: _Engine.ErrorType.LoadError, error: error });
    }

    /**
     * Returns the first compatible source based on the passed sources and the format.
     * @return {string}
     */

  }, {
    key: 'getCompatibleSource',
    value: function getCompatibleSource() {
      // If the user has passed "format", check if it is supported or else retrieve the first supported source from the array.
      return this._format.length ? this._src[this._format.indexOf(_Utility2.default.getSupportedFormat(this._format))] : _Utility2.default.getSupportedSource(this._src);
    }

    /**
     * Plays the passed sound defined in the sprite or the sound that belongs to the passed id.
     * @param {string|number} [soundOrId] The sound name defined in sprite or the sound id.
     * @return {Buzz|number}
     */

  }, {
    key: 'play',
    value: function play(soundOrId) {
      var _this2 = this;

      var isIdPassed = typeof soundOrId === 'number';

      // If id is passed then get the sound from the engine and play it.
      if (isIdPassed) {
        var sound = this._engine.sound(soundOrId);

        if (sound) {
          sound.play();
          this._fire(BuzzEvents.PlayStart, soundOrId);
        }

        return this;
      }

      var newSoundId = _Utility2.default.id(),
          playSound = function playSound() {
        var soundArgs = {
          id: newSoundId,
          buffer: _this2._buffer,
          volume: _this2._volume,
          rate: _this2._rate,
          muted: _this2._muted,
          loop: _this2._loop,
          playEndCallback: function playEndCallback(sound) {
            return _this2._fire(BuzzEvents.PlayEnd, sound.id());
          },
          destroyCallback: function destroyCallback(sound) {
            _this2._fire(BuzzEvents.Destroy, sound.id());
            _Emitter2.default.clear(sound.id());
          }
        };

        if (typeof soundOrId === 'string' && _this2._sprite && _this2._sprite.hasOwnProperty(soundOrId)) {
          var positions = _this2._sprite[soundOrId];
          soundArgs.startPos = positions[0];
          soundArgs.endPos = positions[1];
        }

        var newSound = _this2._engine.sound(_this2._compatibleSrc, _this2._id, soundArgs);
        newSound.play();

        _this2._fire(BuzzEvents.PlayStart, newSound.id());
      };

      // If the sound is not yet loaded push an action to the queue to play the sound once it's loaded.
      if (!this.isLoaded()) {
        this._queue.add('after-load', 'play-' + newSoundId, function () {
          return playSound();
        });
        this.load();
      } else {
        playSound();
      }

      return newSoundId;
    }

    /**
     * Pauses the sound belongs to the passed id or all the sounds belongs to this group.
     * @param {number} [id] The sound id.
     * @return {Buzz}
     */

  }, {
    key: 'pause',
    value: function pause(id) {
      this._queue.remove('after-load', id ? 'play-' + id : null);
      this._sounds(id).forEach(function (sound) {
        return sound.pause();
      });
      this._fire(BuzzEvents.Pause, id);

      return this;
    }

    /**
     * Stops the sound belongs to the passed id or all the sounds belongs to this group.
     * @param {number} [id] The sound id.
     * @return {Buzz}
     */

  }, {
    key: 'stop',
    value: function stop(id) {
      this._queue.remove('after-load', id ? 'play-' + id : null);
      this._sounds(id).forEach(function (sound) {
        return sound.stop();
      });
      this._fire(BuzzEvents.Stop, id);

      return this;
    }

    /**
     * Mutes the sound belongs to the passed id or all the sounds belongs to this group.
     * @param {number} [id] The sound id.
     * @return {Buzz}
     */

  }, {
    key: 'mute',
    value: function mute(id) {
      this._sounds(id).forEach(function (sound) {
        return sound.mute();
      });
      typeof id !== 'number' && (this._muted = true);
      this._fire(BuzzEvents.Mute, id, this._muted);

      return this;
    }

    /**
     * Un-mutes the sound belongs to the passed id or all the sounds belongs to this group.
     * @param {number} [id] The sound id.
     * @return {Buzz}
     */

  }, {
    key: 'unmute',
    value: function unmute(id) {
      this._sounds(id).forEach(function (sound) {
        return sound.unmute();
      });
      typeof id !== 'number' && (this._muted = false);
      this._fire(BuzzEvents.Mute, id, this._muted);

      return this;
    }

    /**
     * Gets/sets the volume of the passed sound or the group.
     * @param {number} [volume] Should be from 0.0 to 1.0.
     * @param {number} [id] The sound id.
     * @return {Buzz|number}
     */

  }, {
    key: 'volume',
    value: function volume(_volume, id) {
      if (typeof _volume === 'number' && _volume >= 0 && _volume <= 1.0) {
        this._sounds(id).forEach(function (sound) {
          return sound.volume(_volume);
        });
        typeof id !== 'number' && (this._volume = _volume);
        this._fire(BuzzEvents.Volume, id, this._volume);
        return this;
      }

      if (typeof id === 'number') {
        var sound = this._engine.sound(id);
        return sound ? sound.volume() : null;
      }

      return this._volume;
    }

    /**
     * Gets/sets the rate of the passed sound or the group.
     * @param {number} [rate] Should be from 0.5 to 5.0.
     * @param {number} [id] The sound id.
     * @return {Buzz|number}
     */

  }, {
    key: 'rate',
    value: function rate(_rate, id) {
      if (typeof _rate === 'number' && _rate >= 0.5 && _rate <= 5) {
        this._sounds(id).forEach(function (sound) {
          return sound.rate(_rate);
        });
        typeof id !== 'number' && (this._rate = _rate);
        this._fire(BuzzEvents.Rate, id, this._rate);
        return this;
      }

      if (typeof id === 'number') {
        var sound = this._engine.sound(id);
        return sound ? sound.rate() : null;
      }

      return this._rate;
    }

    /**
     * Gets/sets the current playback position of the sound.
     * @param {number} id The sound id
     * @param {number} [seek] The seek position.
     * @return {Buzz|number}
     */

  }, {
    key: 'seek',
    value: function seek(id, _seek) {
      var _this3 = this;

      var sound = this._engine.sound(id);

      if (!sound) {
        return this;
      }

      if (typeof _seek === 'number') {
        // If the audio source is not yet loaded push an item to the queue to seek after the sound is loaded
        // and load the sound.
        if (!this.isLoaded()) {
          this._queue.add('after-load', 'seek-' + id, function () {
            return _this3.seek(id, _seek);
          });
          this.load();
          return this;
        }

        sound.seek(_seek);
        this._fire(BuzzEvents.Seek, id, _seek);
        return this;
      }

      return sound.seek();
    }

    /**
     * Gets/sets the looping behavior of a sound or the group.
     * @param {boolean} [loop] True to loop the sound.
     * @param {number} [id] The sound id.
     * @return {Buzz|boolean}
     */

  }, {
    key: 'loop',
    value: function loop(_loop, id) {
      if (typeof _loop === 'boolean') {
        this._sounds(id).forEach(function (sound) {
          return sound.loop(_loop);
        });
        typeof id !== 'number' && (this._loop = _loop);
        return this;
      }

      if (typeof id === 'number') {
        var sound = this._engine.sound(id);
        return sound ? sound.loop() : null;
      }

      return this._loop;
    }

    /**
     * Returns true if the passed sound is playing.
     * @param {number} id The sound id.
     * @return {boolean}
     */

  }, {
    key: 'playing',
    value: function playing(id) {
      var sound = this._engine.sound(id);
      return sound ? sound.isPlaying() : null;
    }

    /**
     * Returns true if the passed sound is muted or the group is muted.
     * @param {number} [id] The sound id.
     * @return {boolean}
     */

  }, {
    key: 'muted',
    value: function muted(id) {
      if (typeof id === 'number') {
        var sound = this._engine.sound(id);
        return sound ? sound.muted() : null;
      }

      return this._muted;
    }

    /**
     * Returns the state of the passed sound or the group.
     * @return {BuzzState|SoundState}
     */

  }, {
    key: 'state',
    value: function state(id) {
      if (typeof id === 'number') {
        var sound = this._engine.sound(id);
        return sound ? sound.state() : null;
      }

      return this._state;
    }

    /**
     * Returns the duration of the passed sound or the total duration of the sound.
     * @param {number} [id] The sound id.
     * @return {number}
     */

  }, {
    key: 'duration',
    value: function duration(id) {
      if (typeof id === 'number') {
        var sound = this._engine.sound(id);
        return sound ? sound.duration() : null;
      }

      return this._duration;
    }

    /**
     * Unloads the loaded audio buffer.
     * @return {Buzz}
     */

  }, {
    key: 'unload',
    value: function unload() {
      this._queue.remove('after-load');
      this._engine.unload(this._compatibleSrc);
      this._buffer = null;
      this._duration = 0;
      this._loadState = LoadState.NotLoaded;
      return this;
    }

    /**
     * Stops and destroys all the sounds belong to this group and release other dependencies.
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      if (this._state === BuzzState.Destroyed) {
        return this;
      }

      this.stop();
      this._queue.clear();
      this._engine.free(false, this._id);

      this._buffer = null;
      this._queue = null;
      this._engine = null;
      this._state = BuzzState.Destroyed;

      this._fire(BuzzEvents.Destroy);

      _Emitter2.default.clear(this._id);
    }

    /**
     * Subscribes to an event for the sound or the group.
     * @param {string} eventName The event name.
     * @param {function} handler The event handler.
     * @param {boolean} [once = false] True for one-time event handling.
     * @param {number} [id] The sound id.
     * @return {Buzz}
     */

  }, {
    key: 'on',
    value: function on(eventName, handler) {
      var once = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var id = arguments[3];

      _Emitter2.default.on(id || this._id, eventName, handler, once);
      return this;
    }

    /**
     * Un-subscribes from an event for the sound or the group.
     * @param {string} eventName The event name.
     * @param {function} handler The event handler.
     * @param {number} [id] The sound id.
     * @return {Buzz}
     */

  }, {
    key: 'off',
    value: function off(eventName, handler, id) {
      _Emitter2.default.off(id || this._id, eventName, handler);
      return this;
    }

    /**
     * Returns the unique id of the sound.
     * @return {number}
     */

  }, {
    key: 'id',
    value: function id() {
      return this._id;
    }

    /**
     * Returns the audio resource loading status.
     * @return {LoadState}
     */

  }, {
    key: 'loadState',
    value: function loadState() {
      return this._loadState;
    }

    /**
     * Returns true if the audio source is loaded.
     * @return {boolean}
     */

  }, {
    key: 'isLoaded',
    value: function isLoaded() {
      return this._loadState === LoadState.Loaded;
    }

    /**
     * Returns the sound for the passed id.
     * @param {number} id The sound id.
     * @return {Sound}
     */

  }, {
    key: 'sound',
    value: function sound(id) {
      return this._engine.sound(id);
    }

    /**
     * Returns true if the passed sound exists.
     * @param {number} id The sound id.
     * @return {boolean}
     */

  }, {
    key: 'alive',
    value: function alive(id) {
      return Boolean(this.sound(id));
    }

    /**
     * Returns the sound for the passed id or all the sounds belong to this group.
     * @param {number} [id] The sound id.
     * @return {Array<Sound>}
     * @private
     */

  }, {
    key: '_sounds',
    value: function _sounds(id) {
      if (typeof id === 'number') {
        var sound = this._engine.sound(id);
        return sound ? [sound] : [];
      }

      return this._engine.sounds(this._id);
    }

    /**
     * Fires an event of group or sound.
     * @param {string} eventName The event name.
     * @param {number} [id] The sound id.
     * @param {...*} args The arguments that to be passed to handler.
     * @return {Buzz}
     * @private
     */

  }, {
    key: '_fire',
    value: function _fire(eventName, id) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      if (id) {
        _Emitter2.default.fire.apply(_Emitter2.default, [id, eventName].concat(args, [this.sound(id), this]));
      } else {
        _Emitter2.default.fire.apply(_Emitter2.default, [this._id, eventName].concat(args, [this]));
      }

      return this;
    }
  }]);

  return Buzz;
}();

var $buzz = function $buzz(args) {
  return new Buzz(args);
};
['setup', 'load', 'unload', 'mute', 'unmute', 'volume', 'stop', 'suspend', 'resume', 'terminate', 'muted', 'state', 'context', 'isAudioAvailable', 'on', 'off'].forEach(function (method) {
  $buzz[method] = function () {
    var result = _Engine2.default[method].apply(_Engine2.default, arguments);
    return result === _Engine2.default ? $buzz : result;
  };
});

exports.default = $buzz;

/***/ })
/******/ ]);
});