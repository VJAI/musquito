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
 * Enum that represents the different errors thrown by a Buzz object.
 * @enum {number}
 */
const ErrorType = {
  LoadError: 1
};

/**
 * Represents the base class for a sound.
 * @class
 */
class BaseBuzz {

  /**
   * @param {object} args
   * @param {string=} args.id An unique id for the sound.
   * @param {string=} args.src The source of the audio file.
   * @param {string=} args.dataUri The source of the audio in base64 string.
   * @param {object=} args.sprite The sprite definition.
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
    let options = typeof args === 'string' ? {src: args} : args || {};

    if (typeof options.src === 'undefined' && typeof options.dataUri === 'undefined') {
      throw new Error('You should pass the source of the audio');
    }

    this._id = typeof options.id === 'string' ? options.id : Math.round(Date.now() * Math.random());
    this._src = Array.isArray(options.src) ? options.src : [options.src];
    this._dataUri = options.dataUri;
    this._sprite = typeof options.sprite === 'object' ? options.sprite : undefined;
    const volume = parseFloat(options.volume);
    this._volume = !isNaN(volume) && volume >= 0 && volume <= 1.0 ? volume : 1.0;
    this._muted = typeof options.muted === 'boolean' ? options.muted : false;
    this._loop = typeof options.loop === 'boolean' ? options.loop : false;
    this._preload = typeof options.preload === 'boolean' ? options.preload : false;
    this._autoplay = typeof options.autoplay === 'boolean' ? options.autoplay : false;
    typeof options.onload === 'function' && this.on('load', options.onload);
    typeof options.onerror === 'function' && this.on('error', options.onerror);
    typeof options.onplaystart === 'function' && this.on('playstart', options.onplaystart);
    typeof options.onplayend === 'function' && this.on('playend', options.onplayend);
    typeof options.onstop === 'function' && this.on('stop', options.onstop);
    typeof options.onpause === 'function' && this.on('pause', options.onpause);
    typeof options.onmute === 'function' && this.on('mute', options.onmute);
    typeof options.onvolume === 'function' && this.on('volume', options.onvolume);
    typeof options.ondestroy === 'function' && this.on('destroy', options.ondestroy);

    this._emitter = new EventEmitter('load,error,playstart,playend,stop,pause,mute,volume');
    this._buffer = null;
    this._bufferSource = null;
    this._endTimer = null;
    this._duration = 0;
    this._startedAt = 0;
    this._elapsed = 0;
    this._isLoaded = false;

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
   * @returns {Buzz|number}
   */
  volume(vol) {
    if (typeof vol === 'undefined') {
      return this._volume;
    }

    const volume = parseFloat(vol);

    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return this;
    }

    this._volume = volume;
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
   * @private
   */
  _fire(event, ...args) {
    this._emitter.fire(event, ...args, this);
    return this;
  }
}

export {BaseBuzz as default, BuzzState, ErrorType};
