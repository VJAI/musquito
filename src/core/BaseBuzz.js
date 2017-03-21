import buzzer from './Buzzer';
import EventEmitter from '../util/EventEmitter';

/**
 * Enum that represents the different states of a sound.
 * @enum {number}
 */
const BuzzState = {
  Constructed: 0,
  Loading: 1,
  Ready: 2,
  Playing: 3,
  Paused: 4,
  Error: 5,
  Destroyed: 6
};

/**
 * Enum that represents the different type of errors thrown by Buzz.
 * @enum {number}
 */
const ErrorType = {
  LoadError: 1
};

/**
 * Represents the base class for all types of sounds.
 * @class
 */
class BaseBuzz {

  /**
   * Unique id of the sound.
   * @type {string|null}
   * @protected
   */
  _id = null;

  /**
   * The source of the audio file.
   * @type {string[]}
   * @protected
   */
  _src = [];

  /**
   * The supported source in the array of audio files.
   * @type {string|null}
   * @protected
   */
  _feasibleSrc = null;

  /**
   * The current volume of the sound. The value should be between 0.0 and 1.0.
   * @type {number}
   * @protected
   */
  _volume = 1.0;

  /**
   * Represents whether the sound is currently muted or not.
   * @type {boolean}
   * @protected
   */
  _muted = false;

  /**
   * Represents whether the sound should keep playing repeatedly or not.
   * @type {boolean}
   * @protected
   */
  _loop = false;

  /**
   * Represents whether the sound should be preloaded on construction.
   * @type {boolean}
   * @protected
   */
  _preload = false;

  /**
   * Represents whether the sound should start playing on construction.
   * @type {boolean}
   * @protected
   */
  _autoplay = false;

  /**
   * Represents the current state (playing, paused etc.) of the sound.
   * @type {BuzzState|null}
   * @protected
   */
  _state = null;

  /**
   * AudioContext.
   * @type {AudioContext|null}
   * @protected
   */
  _context = null;

  /**
   * The gain node to control the volume of the sound.
   * @type {GainNode|null}
   * @protected
   */
  _gainNode = null;

  /**
   * Event emitter.
   * @type {EventEmitter}
   * @protected
   */
  _emitter = new EventEmitter('load,error,playstart,playend,stop,pause,mute,volume');

  /**
   * Represents the timer that is used to reset the variables after the playback.
   * @type {number|null}
   * @protected
   */
  _endTimer = null;

  /**
   * Duration of the sound.
   * @type {number}
   * @protected
   */
  _duration = 0;

  /**
   * Represents the time sound started playing relative to context's current time.
   * @type {number}
   * @protected
   */
  _startedAt = 0;

  /**
   * Represents the total time elapsed after started playing.
   * @type {number}
   * @protected
   */
  _elapsed = 0;

  /**
   * Whether the source of the sound is loaded or not.
   * @type {boolean}
   * @protected
   */
  _isLoaded = false;

  /**
   * @param {object} args
   * @param {string=} args.id An unique id for the sound.
   * @param {string|string[]=} args.src The source of the audio file.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {boolean} [args.muted = false] Should be muted initially.
   * @param {number} [args.loop = false] Whether the sound should play repeatedly.
   * @param {boolean} [args.preload = false] Load the sound initially itself.
   * @param {boolean} [args.autoplay = false] Play automatically once the object is created.
   * @param {function=} args.onload Event-handler for the "load" event.
   * @param {function=} args.onerror Event-handler for the "error" event.
   * @param {function=} args.onplaystart Event-handler for the "playstart" event.
   * @param {function=} args.onplayend Event-handler for the "playend" event.
   * @param {function=} args.onstop Event-handler for the "stop" event.
   * @param {function=} args.onpause Event-handler for the "pause" event.
   * @param {function=} args.onmute Event-handler for the "mute" event.
   * @param {function=} args.onvolume Event-handler for the "volume" event.
   * @param {function=} args.ondestroy Event-handler for the "destroy" event.
   * @constructor
   */
  constructor(args) {
    let options = typeof args === 'string' || Array.isArray(args) ? {src: args} : args || {};

    this._validate(options);

    this._id = typeof options.id === 'string' ? options.id : Math.round(Date.now() * Math.random()).toString();

    if (options !== undefined) {
      this._src = Array.isArray(options.src) ? options.src : [options.src];
    }

    if (typeof options.volume === 'number' && options.volume >= 0 && options.volume <= 1.0) {
      this._volume = options.volume;
    }

    typeof options.muted === 'boolean' && (this._muted = options.muted);
    typeof options.loop === 'boolean' && (this._loop = options.loop);
    typeof options.preload === 'boolean' && (this._preload = options.preload);
    typeof options.autoplay === 'boolean' && (this._autoplay = options.autoplay);
    typeof options.onload === 'function' && this.on('load', options.onload);
    typeof options.onerror === 'function' && this.on('error', options.onerror);
    typeof options.onplaystart === 'function' && this.on('playstart', options.onplaystart);
    typeof options.onplayend === 'function' && this.on('playend', options.onplayend);
    typeof options.onstop === 'function' && this.on('stop', options.onstop);
    typeof options.onpause === 'function' && this.on('pause', options.onpause);
    typeof options.onmute === 'function' && this.on('mute', options.onmute);
    typeof options.onvolume === 'function' && this.on('volume', options.onvolume);
    typeof options.ondestroy === 'function' && this.on('destroy', options.ondestroy);

    this._read(options);
    buzzer.setup(null);
    this._context = buzzer.context();
    this._state = BuzzState.Constructed;

    if (this._autoplay) {
      this.play();
      return;
    }

    if (this._preload) {
      this.load();
    }
  }

  _validate(options) {
    return undefined;
  }

  _read(options) {
    return undefined;
  }

  _removePlayHandler() {
    this.off('load', this.play);
  }

  _clearEndTimer() {
    if (this._endTimer) {
      clearTimeout(this._endTimer);
      this._endTimer = null;
    }
  }

  /**
   * Load the sound into an audio buffer.
   * Fires 'load' event on successful load and 'error' event on failure.
   * @returns {BaseBuzz}
   */
  load() {
    throw new Error('Not Implemented');
  }

  /**
   * Plays the sound.
   * Fires 'playstart' event before playing and 'playend' event after the sound is played.
   * @param {string=} sound
   * @returns {BaseBuzz}
   */
  play(sound) {
    throw new Error('Not Implemented');
  }

  /**
   * Pause the playing sound.
   * @returns {BaseBuzz}
   */
  pause() {
    throw new Error('Not Implemented');
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {BaseBuzz}
   */
  stop() {
    throw new Error('Not Implemented');
  }

  /**
   * Destroys the buzz.
   */
  destroy() {
    throw new Error('Not Implemented');
  }

  /**
   * Mute the sound.
   * @returns {BufferBuzz}
   */
  mute() {
    if (this._muted) {
      return this;
    }

    this._gainNode && (this._gainNode.gain.value = 0);
    this._muted = true;
    this._fire('mute', this._muted);

    return this;
  }

  /**
   * Unmute the sound.
   * @returns {BufferBuzz}
   */
  unmute() {
    if (!this._muted) {
      return this;
    }

    this._gainNode && (this._gainNode.gain.value = this._volume);
    this._muted = false;
    this._fire('mute', this._muted);

    return this;
  }

  /**
   * Set/get the volume.
   * @param {number=} vol
   * @returns {BaseBuzz|number}
   */
  volume(vol) {
    if (vol == undefined) {
      return this._volume;
    }

    if (typeof vol !== 'number' || vol < 0 || vol > 1.0) {
      return this;
    }

    this._volume = vol;
    this._gainNode && (this._gainNode.gain.value = this._volume);
    this._fire('volume', this._volume);

    return this;
  }

  /**
   * Returns whether sound is muted or not.
   * @returns {boolean}
   */
  muted() {
    return this._muted;
  }

  /**
   * Returns the state of the sound.
   * @returns {number}
   */
  state() {
    return this._state;
  }

  /**
   * Returns the duration of the sound.
   * @returns {number}
   */
  duration() {
    return this._duration;
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event
   * @param {function|object} options
   * @param {function} options.handler
   * @param {object=} options.target
   * @param {object|Array=} options.args
   * @param {boolean=} [options.once = false]
   * @returns {BaseBuzz}
   */
  on(event, options) {
    this._emitter.on(event, options);
    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event
   * @param {function} handler
   * @param {object=} target
   * @returns {BaseBuzz}
   */
  off(event, handler, target) {
    this._emitter.off(event, handler, target);
    return this;
  }

  /**
   * Fires an event passing the sound and other optional arguments.
   * @param {string} event
   * @param {...*} args
   * @returns {BaseBuzz}
   * @protected
   */
  _fire(event, ...args) {
    this._emitter.fire(event, ...args, this);
    return this;
  }
}

export {BaseBuzz as default, BuzzState, ErrorType};
