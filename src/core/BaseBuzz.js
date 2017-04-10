import buzzer from './Buzzer';
import codecAid from '../util/CodecAid';
import DownloadStatus from '../util/DownloadStatus';
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
   * @type {AudioContext}
   * @protected
   */
  _context = null;

  /**
   * The gain node to control the volume of the sound.
   * @type {GainNode}
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
   * @param {string|object} args The input parameters of the sound.
   * @param {string=} args.id An unique id for the sound.
   * @param {string|string[]=} args.src The source of the audio file.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {boolean} [args.muted = false] Should be muted initially.
   * @param {boolean} [args.loop = false] Whether the sound should play repeatedly.
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
    let options = typeof args === 'string' || Array.isArray(args) ? { src: args } : args || {};

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
  }

  /**
   * Validate the passed options. Should be overridden by the derived classes if required.
   * @param {object} options The passed options to the buzz
   * @private
   */
  _validate(options) { // eslint-disable-line no-unused-vars
  }

  /**
   * Setup the buzzer if it's not yet ready and auto-play or preload based on the passed option.
   * @protected
   */
  _completeSetup() {
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
   * Read the additional options. Should be overridden by the derived classes if required.
   * @param {object} options The passed options to the buzz
   * @private
   */
  _read(options) { // eslint-disable-line no-unused-vars
  }

  /**
   * Removes the "play" handler that is wired-up to the "load" event.
   * @private
   */
  _removePlayHandler() {
    this.off('load', this.play);
  }

  /**
   * Clears the play end timer.
   * @private
   */
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
    // If source is already loaded return without reloading again.
    if (this._isLoaded) {
      return this;
    }

    // Set the state to "Loading" to avoid multiple times loading the buffer.
    this._state = BuzzState.Loading;

    const src = codecAid.getSupportedFile(this._src);

    if (!src) {
      this._removePlayHandler();
      this._state = BuzzState.Error;
      this._fire('error', { type: ErrorType.LoadError, error: 'None of the audio format you passed is supported' });
      return this;
    }

    this._feasibleSrc = src;

    this._load().then(downloadResult => {
      if (downloadResult.status === DownloadStatus.Success) {
        this._save(downloadResult);
        this._gainNode = this._context.createGain();
        this._gainNode.gain.value = this._muted ? 0 : this._volume;
        this._isLoaded = true;
        this._state = BuzzState.Ready;
        this._fire('load', downloadResult);
        return;
      }

      this._removePlayHandler();
      this._state = BuzzState.Error;
      this._fire('error', { type: ErrorType.LoadError, error: downloadResult.error });
    });

    return this;
  }

  /**
   * Should be implemented by the derived classes.
   * @private
   */
  _load() {
    throw new Error('Not implemented');
  }

  /**
   * Should be implemented by the derived classes.
   * @param {DownloadResult} downloadResult The audio download result
   * @private
   */
  _save(downloadResult) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented');
  }

  /**
   * Plays the sound.
   * Fires 'playstart' event before playing and 'playend' event after the sound is played.
   * @returns {BaseBuzz}
   */
  play() {
    // If the sound is already in "Playing" state then it's not allowed to play again.
    if (this._state === BuzzState.Playing) {
      return this;
    }

    if (!this._isLoaded) {
      this.on('load', {
        handler: this.play,
        target: this,
        once: true
      });

      this.load();

      return this;
    }

    let offset = this._elapsed, duration = this._duration;

    buzzer._link(this);
    this._clearEndTimer();
    this._play(offset);
    this._startedAt = this._context.currentTime;
    this._endTimer = setTimeout(() => {
      if (this._loop) {
        this._startedAt = 0;
        this._elapsed = 0;
        this._state = BuzzState.Ready;
        this._fire('playend');
        this.play();
      } else {
        this._resetVars();
        this._state = BuzzState.Ready;
        this._fire('playend');
      }
    }, duration * 1000);
    this._state = BuzzState.Playing;
    this._fire('playstart');

    return this;
  }

  /**
   * Plays the sound from the offset. Should be implemented by the derived classes.
   * @param {number} offset The elapsed duration
   * @private
   */
  _play(offset) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented');
  }

  /**
   * Resets the internal variables.
   * @private
   */
  _resetVars() {
    buzzer._unlink(this);
    this._stop();
    this._startedAt = 0;
    this._elapsed = 0;
    this._clearEndTimer();
  }

  /**
   * Should be implemented by the derived classes.
   * @private
   */
  _stop() {
    throw new Error('Not implemented');
  }

  /**
   * Pause the playing sound.
   * @returns {BaseBuzz}
   */
  pause() {
    // Remove the "play" event handler from queue if there is one.
    this._removePlayHandler();

    // We can pause the sound only if it is "playing" state.
    if (this._state !== BuzzState.Playing) {
      return this;
    }

    const startedAt = this._startedAt, elapsed = this._elapsed;
    this._resetVars();
    this._elapsed = elapsed + this._context.currentTime - startedAt;
    this._state = BuzzState.Paused;
    this._fire('pause');

    return this;
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {BaseBuzz}
   */
  stop() {
    // Remove the "play" event handler from queue if there is one.
    this._removePlayHandler();

    // We can stop the sound either if it "playing" or in "paused" state.
    if (this._state !== BuzzState.Playing && this._state !== BuzzState.Paused) {
      return this;
    }

    this._resetVars();
    this._state = BuzzState.Stopped;
    this._fire('stop');

    return this;
  }

  /**
   * Mute the sound.
   * @returns {BaseBuzz}
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
   * @returns {BaseBuzz}
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
   * @param {number=} vol Should be within 0.0 to 1.0
   * @returns {BaseBuzz|number}
   */
  volume(vol) {
    if (vol === undefined) {
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
   * @param {string} event Name of the event
   * @param {function|object} options Handler function or subscription options
   * @param {function} options.handler Handler function
   * @param {object=} options.target Scope the handler should be invoked
   * @param {object|Array=} options.args Additional arguments that should be passed to the handler
   * @param {boolean=} [options.once = false] One-time listener or not
   * @returns {BaseBuzz}
   */
  on(event, options) {
    this._emitter.on(event, options);
    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event The event name
   * @param {function} handler The handler function
   * @param {object=} target Scope of the handler to be invoked
   * @returns {BaseBuzz}
   */
  off(event, handler, target) {
    this._emitter.off(event, handler, target);
    return this;
  }

  /**
   * Fires an event passing the source and other optional arguments.
   * @param {string} event The event name
   * @param {...*} args The arguments that to be passed to handler
   * @returns {BaseBuzz}
   * @protected
   */
  _fire(event, ...args) {
    this._emitter.fire(event, ...args, this);
    return this;
  }

  /**
   * Destroys the buzz.
   */
  destroy() {
    if (this._state === BuzzState.Destroyed) {
      return this;
    }

    this.stop();
    this._context = null;
    this._gainNode = null;
    this._destroy();
    this._state = BuzzState.Destroyed;
    this._fire('destroy');
    this._emitter.clear();
    this._emitter = null;
    return this;
  }

  /**
   * Should be overridden by the derived classes.
   * @private
   */
  _destroy() {
    throw new Error('Not implemented');
  }
}

export { BaseBuzz as default, BuzzState, ErrorType };
