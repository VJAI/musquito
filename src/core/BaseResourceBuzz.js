import BaseBuzz, { BuzzState } from './BaseBuzz';
import buzzer from './Buzzer';
import EventEmitter from '../util/EventEmitter';
import ActionQueue from '../util/ActionQueue';
import ErrorType from '../util/ErrorType';
import codecAid from '../util/CodecAid';
import DownloadStatus from '../util/DownloadStatus';

/**
 * Enum that represents the different states occurs while loading a sound.
 * @enum {string}
 */
const LoadState = {
  NotLoaded: 'notloaded',
  Loading: 'loading',
  Loaded: 'loaded',
  UnLoaded: 'unloaded'
};

/**
 * Base class for all types that play sounds from a resource like url, base64 string etc.
 */
class BaseResourceBuzz extends BaseBuzz {

  /**
   * The file format of the passed audio source.
   * @type {string|null}
   * @protected
   */
  _format = null;

  /**
   * The sprite definition.
   * @type {object}
   * @protected
   */
  _sprite = null;

  /**
   * Represents whether the sound should be pre-loaded on construction.
   * @type {boolean}
   * @protected
   */
  _preload = false;

  /**
   * The supported source in the passed array of urls.
   * @type {string|null}
   * @protected
   */
  _compatibleSrc = null;

  /**
   * Current playing sound from the sprite.
   * @type {string|null}
   * @protected
   */
  _spriteSound = null;

  /**
   * Action queue to store the actions invoked by user when the sound is in loading state.
   * @type {ActionQueue}
   * @protected
   */
  _actionQueue = null;

  /**
   * The sound start position.
   * @type {number}
   * @protected
   */
  _startPos = 0;

  /**
   * The sound end position.
   * @type {number}
   * @protected
   */
  _endPos = 0;

  /**
   * The current position of the playback.
   * @type {number}
   * @protected
   */
  _currentPos = 0;

  /**
   * The position of the playback during rate change.
   * @type {number}
   * @protected
   */
  _rateSeek = 0;

  /**
   * Represents the timer that is used to reset the variables once the playback is ended.
   * @type {number|null}
   * @protected
   */
  _endTimer = null;

  /**
   * Represents the different states that occurs while loading the sound.
   * @type {LoadState}
   * @private
   */
  _loadState = LoadState.NotLoaded;

  /**
   * @param {string|object} args The input parameters of the sound.
   * @param {string=} args.id The unique id of the sound.
   * @param {string|string[]=} args.src The array of audio urls.
   * @param {string} args.format The file format of the passed audio source.
   * @param {object=} args.sprite The sprite definition.
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
    super(args);

    if (this._preload) {
      this.load();
    }
  }

  /**
   * Instantiate the EventEmitter and ActionQueue.
   * @protected
   */
  _instantiate() {
    this._emitter = new EventEmitter('load,error,playstart,playend,stop,pause,mute,volume');
    this._actionQueue = new ActionQueue();
  }

  /**
   * Read the properties required by this type.
   * @param {object} options The options of sound
   * @protected
   */
  _read(options) {
    typeof options.format === 'string' && (this._format = options.format);
    typeof options.sprite === 'object' && (this._sprite = options.sprite);
    typeof options.preload === 'boolean' && (this._preload = options.preload);
    typeof options.onload === 'function' && this.on('load', options.onload);
  }

  /**
   * Loads the sound.
   * @returns {BaseResourceBuzz}
   */
  load() {

    // If the sound is already loaded return without reloading again.
    if (this.isLoaded()) {
      return this;
    }

    // Set the state to "Loading" to avoid loading the sound multiple times.
    this._loadState = LoadState.Loading;

    // If the user has passed "format" check if it is supported or else retrieve the supported source from the array.
    const src = this._format && codecAid.isFormatSupported(this._format) ? this._src[0] : codecAid.getSupportedSource(this._src);

    // If no compatible format found clear the queue and throw error.
    if (!src) {
      this._actionQueue.clear();
      this._loadState = LoadState.NotLoaded;
      this._fire('error', { type: ErrorType.LoadError, error: 'The audio formats you passed are not supported' });
      return this;
    }

    // Store the compatible source
    this._compatibleSrc = src;

    // Load the sound and store the result
    this._load().then(downloadResult => {
      if (downloadResult.status === DownloadStatus.Success) {
        this._createGainNode();
        this._save(downloadResult);
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
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Should be implemented by the derived classes.
   * @param {DownloadResult} downloadResult The audio download result
   * @protected
   */
  _save(downloadResult) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Plays the sound.
   * @param {boolean} fireEvent True to fire event
   * @protected
   */
  _play(fireEvent = true) {
    this._playSound(null, fireEvent);
  }

  /**
   * Plays the sound that is defined in the sprite.
   * @param {string} sound The sound name
   */
  playSound(sound) {
    this._playSound(sound);
  }

  /**
   * Plays the sound that is defined in the sprite using the underlying mechanism.
   * @param {string} sound The sound name
   * @param {boolean} fireEvent True to fire event
   * @return {BaseResourceBuzz}
   * @protected
   */
  _playSound(sound, fireEvent = true) {

    // If the sound is not yet loaded push an action to the queue to play the sound once it's loaded.
    if (!this.isLoaded()) {
      this._actionQueue.add('play', () => this._play(sound, fireEvent));
      this.load();
      return this;
    }

    const prevSound = this._spriteSound;

    if (sound && this._sprite && this._sprite[sound]) {
      this._spriteSound = sound;
    } else {
      this._spriteSound = null;
    }

    // If the sound is not paused and the passed sound name is different
    // from the last one then start the playback from the start position.
    if (!this.isPaused() && this._spriteSound !== prevSound) {
      this._currentPos = 0;
    }

    // Store the sound start and end positions.
    if (this._spriteSound) {
      const soundTimeVars = this._sprite[this._spriteSound];
      this._startPos = soundTimeVars[0];
      this._endPos = soundTimeVars[1];
    } else {
      this._startPos = 0;
      this._endPos = this._duration;
    }

    let [, , timeout] = this._getTimeVars();
    buzzer._link(this);

    this._playNode();

    this._endTimer = setTimeout(this._onEnded, timeout);
    this._state = BuzzState.Playing;

    fireEvent && this._fire('play');

    return this;
  }

  /**
   * Returns the seek, duration and timeout for the playback.
   * @return {[number, number, number]}
   * @protected
   */
  _getTimeVars() {
    let seek = Math.max(0, this._currentPos > 0 ? this._currentPos : this._startPos),
      duration = this._endPos - this._startPos,
      timeout = (duration * 1000) / this._rate;

    return [seek, duration, timeout];
  }

  /**
   * Plays the sound using the underlying audio node.
   * @protected
   */
  _playNode() {
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Called after the playback ends.
   * @protected
   */
  _onEnded() {
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Pause the playing sound and fire event.
   * @param {boolean=} [fireEvent = true] True to fire event
   * @return {BaseResourceBuzz}
   * @protected
   */
  _pause(fireEvent = true) {

    // Remove the "play" action from queue if there is one.
    this._actionQueue.remove('play');

    // We can pause the sound only if it is "playing" state.
    if (!this.isPlaying()) {
      return this;
    }

    // Save the current position and reset rateSeek.
    this._currentPos = this.seek();
    this._rateSeek = 0;

    buzzer._unlink(this);
    this._clearEndTimer();
    this._pauseNode();

    this._state = BuzzState.Paused;

    fireEvent && this._fire('pause');

    return this;
  }

  /**
   * Should be implemented by the derived classes.
   * @protected
   */
  _pauseNode() {
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Stop the sound and fire event.
   * @param {boolean=} [fireEvent = true] True to fire event
   * @return {BaseResourceBuzz}
   * @protected
   */
  _stop(fireEvent = true) {

    // Remove the "play" action from the queue if there is one.
    this._actionQueue.remove('play');

    // We can stop the sound either if it "playing" or in "paused" state.
    if (!this.isPlaying() && !this.isPaused()) {
      return this;
    }

    // Reset the variables
    this._currentPos = 0;
    this._rateSeek = 0;

    buzzer._unlink(this);
    this._clearEndTimer();
    this._stopNode();

    this._state = BuzzState.Idle;

    fireEvent && this._fire('stop');

    return this;
  }

  /**
   * Should be implemented by the derived classes.
   * @protected
   */
  _stopNode() {
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Clears the play end timer.
   * @protected
   */
  _clearEndTimer() {
    if (this._endTimer) {
      clearTimeout(this._endTimer);
      this._endTimer = null;
    }
  }

  /**
   * Set the playbackrate for the underlying node that plays the sound.
   * @param {number=} rate The playback rate
   * @protected
   * @return {BaseResourceBuzz}
   */
  _setRate(rate) {
    this._rateSeek = this.seek();

    if (this.isPlaying()) {
      this._setNodeRate(rate);
      this._clearEndTimer();
      let [, duration] = this._getTimeVars();
      this._endTimer = setTimeout(this._onEnded, (duration * 1000) / Math.abs(rate));
    }

    this._fire('rate', this._rate);
    return this;
  }

  /**
   * Set the rate for the underlying audio element that plays the sound.
   * @param {number} rate The playback rate
   * @protected
   */
  _setNodeRate(rate) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Seek the playback to the passed position.
   * @param {number} seek The seek position
   * @return  {BaseResourceBuzz}
   * @protected
   */
  _setSeek(seek) {
    if (typeof seek !== 'number' || seek < 0) {
      return this;
    }

    if (!this.isLoaded()) {
      this._actionQueue.add('seek', () => this.seek(seek));
      this._load();
      return this;
    }

    if (seek > this._duration) {
      return this;
    }

    const isPlaying = this.isPlaying();

    if (isPlaying) {
      this._pause(false);
    }

    this._currentPos = seek;

    if (isPlaying) {
      this._play(false);
    }

    this._fire('seek', seek);

    return this;
  }

  // TODO: Need to implement this
  unload() {
    throw new Error('Not implemented');
  }

  /**
   * Destroys the buzz.
   * @protected
   */
  _destroy() {
    this._actionQueue.clear();
    this._actionQueue = null;
    this._destroyInternals();
  }

  /**
   * Destroy any other dependency or clean-up properties required by the derived type.
   * @protected
   */
  _destroyInternals() {
    return;
  }

  /**
   * Returns whether the audio source is loaded or not.
   * @return {boolean}
   */
  isLoaded() {
    return this._loadState === LoadState.Loaded;
  }

  /**
   * Returns the total duration of the sound or for the passed sound that's defined in the sprite.
   * @param {string} sound The sound name defined in the sprite.
   * @return {number}
   */
  soundDuration(sound) {
    const times = this._sprite[sound];

    if (!times) {
      return 0;
    }

    return times[1] - times[0];
  }
}

export { BaseResourceBuzz as default, BuzzState };
