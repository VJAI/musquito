import buzzer from './Buzzer';
import codecAid from '../util/CodecAid';
import DownloadStatus from '../util/DownloadStatus';
import EventEmitter from '../util/EventEmitter';
import ActionQueue from '../util/ActionQueue';

/**
 * Enum that represents the different states in loading a sound.
 * @enum {string}
 */
const LoadState = {
  NotLoaded: 'notloaded',
  Loading: 'loading',
  Loaded: 'loaded',
  UnLoaded: 'unloaded'
};

/**
 * Enum that represents the different states of a sound.
 * @enum {string}
 */
const BuzzState = {
  Idle: 'idle',
  Playing: 'playing',
  Paused: 'paused',
  Destroyed: 'destroyed'
};

/**
 * Enum that represents the different type of errors thrown by Buzz.
 * @enum {number}
 */
const ErrorType = {
  LoadError: 'load'
};

/**
 * Represents the base class for all types of sounds.
 * @class
 */
class BaseBuzz {

  /**
   * Unique id.
   * @type {string|null}
   * @protected
   */
  _id = null;

  /**
   * The array of audio urls.
   * @type {string[]}
   * @protected
   */
  _src = [];

  /**
   * The supported source in the passed array of urls.
   * @type {string|null}
   * @protected
   */
  _compatibleSrc = null;

  /**
   * The current volume of the sound. The value should be between 0.0 and 1.0.
   * @type {number}
   * @protected
   */
  _volume = 1.0;

  /**
   * The playback rate of the sound.
   * @type {number}
   * @protected
   */
  _rate = 1;

  /**
   * Represents whether the sound is currently muted or not.
   * @type {boolean}
   * @protected
   */
  _muted = false;

  /**
   * Represents whether the sound should play repeatedly or not.
   * @type {boolean}
   * @protected
   */
  _loop = false;

  /**
   * Represents whether the sound should be pre-loaded on construction.
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
   * @type {BuzzState}
   * @protected
   */
  _state = BuzzState.Idle;

  /**
   * Represents the different states that occurs while the sound is loading.
   * @type {LoadState|null}
   * @private
   */
  _loadState = null;

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
   * Event emitter that takes care of all event-related mundane jobs.
   * @type {EventEmitter}
   * @protected
   */
  _emitter = null;

  /**
   * Action queue to store actions invoked by user when the sound is in loading state.
   * @type {ActionQueue}
   * @protected
   */
  _actionQueue = null;

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
   * Represents the time elapsed after started playing.
   * @type {number}
   * @protected
   */
  _elapsed = 0;

  /**
   * TODO: add description
   * @type {number}
   * @protected
   */
  _rateElapsed = 0;

  /**
   * @param {string|object} args The input parameters of the sound.
   * @param {string=} args.id The unique id of the sound.
   * @param {string|string[]=} args.src The array of audio urls.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {number} [args.rate = 1] The initial playback rate of the sound.
   * @param {boolean} [args.muted = false] True to be muted initially.
   * @param {boolean} [args.loop = false] True to play the sound repeatedly.
   * @param {boolean} [args.preload = false] True to pre-load the sound after construction.
   * @param {boolean} [args.autoplay = false] True to play automatically after construction.
   * @param {function=} args.onload Event-handler for the "load" event.
   * @param {function=} args.onerror Event-handler for the "error" event.
   * @param {function=} args.onplaystart Event-handler for the "playstart" event.
   * @param {function=} args.onplayend Event-handler for the "playend" event.
   * @param {function=} args.onstop Event-handler for the "stop" event.
   * @param {function=} args.onpause Event-handler for the "pause" event.
   * @param {function=} args.onmute Event-handler for the "mute" event.
   * @param {function=} args.onvolume Event-handler for the "volume" event.
   * @param {function=} args.onrate Event-handler for the "rate" event.
   * @param {function=} args.onseek Event-handler for the "seek" event.
   * @param {function=} args.ondestroy Event-handler for the "destroy" event.
   * @constructor
   */
  constructor(args) {
    let options = typeof args === 'string' || Array.isArray(args) ? { src: args } : args || {};

    this._validate(options);

    this._emitter = new EventEmitter('load,error,playstart,playend,stop,pause,mute,volume');
    this._actionQueue = new ActionQueue();

    this._id = typeof options.id === 'string' ? options.id : Math.round(Date.now() * Math.random()).toString();

    if (options !== undefined) {
      this._src = Array.isArray(options.src) ? options.src : [options.src];
    }

    if (typeof options.volume === 'number' && options.volume >= 0 && options.volume <= 1.0) {
      this._volume = options.volume;
    }

    if (typeof options.rate === 'number' && options.rate > 0 && options.rate <= 5) {
      this._rate = options.rate;
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
    typeof options.onseek === 'function' && this.on('seek', options.onseek);
    typeof options.onrate === 'function' && this.on('rate', options.onrate);
    typeof options.ondestroy === 'function' && this.on('destroy', options.ondestroy);
  }

  /**
   * Validate the passed options. Will be overridden by the derived classes.
   * @param {object} options The passed options to the buzz
   * @private
   */
  _validate(options) { // eslint-disable-line no-unused-vars
    return;
  }

  /**
   * Setup the buzzer if it's not yet ready and auto-play or preload based on the passed option.
   * @protected
   */
  _setup() {
    buzzer.setup(null);
    this._context = buzzer.context();
    this._loadState = LoadState.NotLoaded;

    if (this._autoplay) {
      this.play();
      return;
    }

    if (this._preload) {
      this.load();
    }
  }

  /**
   * Loads the sound.
   * @returns {BaseBuzz}
   */
  load() {
    // If source is already loaded return without reloading again.
    if (this.isLoaded()) {
      return this;
    }

    // Set the state to "Loading" to avoid multiple times loading the buffer.
    this._loadState = LoadState.Loading;

    const src = codecAid.getSupportedFile(this._src);

    if (!src) {
      this._actionQueue.clear();
      this._loadState = LoadState.NotLoaded;
      this._fire('error', { type: ErrorType.LoadError, error: 'None of the audio format you passed is supported' });
      return this;
    }

    this._compatibleSrc = src;

    this._load().then(downloadResult => {
      if (downloadResult.status === DownloadStatus.Success) {
        this._save(downloadResult);
        this._gainNode = this._context.createGain();
        this._gainNode.gain.value = this._muted ? 0 : this._volume;
        this._loadState = LoadState.Loaded;
        this._fire('load', downloadResult);
        this._actionQueue.run();
        return;
      }

      this._actionQueue.clear();
      this._fire('error', { type: ErrorType.LoadError, error: downloadResult.error });
    });

    return this;
  }

  /**
   * Should be implemented by the derived classes.
   * @protected
   */
  _load() {
    throw new Error('Not implemented');
  }

  /**
   * Should be implemented by the derived classes.
   * @param {DownloadResult} downloadResult The audio download result
   * @protected
   */
  _save(downloadResult) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented');
  }

  /**
   * Plays the sound or resume it from the paused state. Should be implemented by the derived classes.
   */
  play() {
    throw new Error('Not implemented');
  }

  /**
   * Resets the internal variables.
   * @protected
   */
  _reset() {
    buzzer._unlink(this);
    this._stopNode();
    this._startedAt = 0;
    this._elapsed = 0;
  }

  /**
   * Should be implemented by the derived classes.
   * @protected
   */
  _stopNode() {
    throw new Error('Not implemented');
  }

  /**
   * Pause the playing sound.
   * @returns {BaseBuzz}
   */
  pause() {
    return this._pause();
  }

  /**
   * Pause the playing sound and fire event.
   * @param {boolean=} [fireEvent = true] True to fire event
   * @return {BaseBuzz}
   * @protected
   */
  _pause(fireEvent = true) {
    // Remove the "play" action from queue if there is one.
    this._actionQueue.remove('play');

    // We can pause the sound only if it is "playing" state.
    if (!this.isPlaying()) {
      return this;
    }

    const startedAt = this._startedAt, elapsed = this._elapsed;
    this._reset();
    this._elapsed = elapsed + this._context.currentTime - startedAt;
    this._state = BuzzState.Paused;
    fireEvent && this._fire('pause');

    return this;
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {BaseBuzz}
   */
  stop() {
    return this._stop();
  }

  /**
   * Stop the sound and fire event.
   * @param {boolean=} [fireEvent = true] True to fire event
   * @return {BaseBuzz}
   * @private
   */
  _stop(fireEvent = true) {
    // Remove the "play" action from the queue if there is one.
    this._actionQueue.remove('play');

    // We can stop the sound either if it "playing" or in "paused" state.
    if (!this.isPlaying() && !this.isPaused()) {
      return this;
    }

    this._reset();
    this._state = BuzzState.Idle;
    fireEvent && this._fire('stop');

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
   * Get/set the volume.
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
   * Get/set the playback rate.
   * @param {number=} rate The playback rate
   */
  rate(rate) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented');
  }

  /**
   * Get/set the seek position.
   * @param {number=} seek The seek position
   */
  seek(seek) { // eslint-disable-line no-unused-vars
    throw new Error('Not implemented');
  }

  /**
   * Get/set the loop parameter of the sound.
   * @return {BaseBuzz}
   */
  loop() {
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
   * Returns true if the sound is loaded.
   * @return {boolean}
   */
  isLoaded() {
    return this._loadState === LoadState.Loaded;
  }

  /**
   * Returns the duration of the sound.
   * @returns {number}
   */
  duration() {
    return this._duration;
  }

  /**
   * Returns true if the buzz is in playing state.
   * @return {boolean}
   */
  isPlaying() {
    return this._state === BuzzState.Playing;
  }

  /**
   * Returns true if buzz is in paused state.
   * @return {boolean}
   */
  isPaused() {
    return this._state === BuzzState.Paused;
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event Name of the event
   * @param {function} handler The event-handler function
   * @param {boolean=} [once = false] Is it one-time subscription or not
   * @returns {BaseBuzz}
   */
  on(event, handler, once = false) {
    this._emitter.on(event, handler, once);
    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event The event name
   * @param {function} handler The handler function
   * @returns {BaseBuzz}
   */
  off(event, handler) {
    this._emitter.off(event, handler);
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
   * @return {BaseBuzz}
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
    this._actionQueue.clear();
    this._actionQueue = null;
    return this;
  }

  /**
   * Should be overridden by the derived classes.
   * @protected
   */
  _destroy() {
    throw new Error('Not implemented');
  }
}

export { BaseBuzz as default, BuzzState, ErrorType };
