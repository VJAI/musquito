import buzzer from './Buzzer';
import codecAid from '../util/CodecAid';
import DownloadStatus from '../util/DownloadStatus';
import EventEmitter from '../util/EventEmitter';
import ActionQueue from '../util/ActionQueue';
import ErrorType from '../util/ErrorType';

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
   * The file format of the passed audio source.
   * @type {string|null}
   * @protected
   */
  _format = null;

  /**
   * The supported source in the passed array of urls.
   * @type {string|null}
   * @protected
   */
  _compatibleSrc = null;

  /**
   * The sprite definition.
   * @type {object}
   * @protected
   */
  _sprite = null;

  /**
   * Current playing sound from the sprite.
   * @type {string|null}
   * @protected
   */
  _spriteSound = null;

  /**
   * The current volume of the sound.
   * @type {number}
   * @protected
   */
  _volume = 1.0;

  /**
   * The current playback rate of the sound.
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
   * Represents whether the sound should start playing automatically on construction.
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
   * Represents the different states that occurs while loading the sound.
   * @type {LoadState}
   * @private
   */
  _loadState = LoadState.NotLoaded;

  /**
   * Web API's audio context.
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
   * Event emitter that takes care of all event-related boring jobs.
   * @type {EventEmitter}
   * @protected
   */
  _emitter = null;

  /**
   * Action queue to store the actions invoked by user when the sound is in loading state.
   * @type {ActionQueue}
   * @protected
   */
  _actionQueue = null;

  /**
   * Duration of the sound in seconds.
   * @type {number}
   * @protected
   */
  _duration = 0;

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
    let options = typeof args === 'string' || Array.isArray(args) ? { src: args } : args || {};

    // If the user hasn't passed any source throw error.
    if (!options.src || (Array.isArray(options.src) && options.src.length === 0)) {
      throw new Error('You should pass the source for the audio.');
    }

    // Instantiate the event emitter and action queue.
    this._emitter = new EventEmitter('load,error,playstart,playend,stop,pause,mute,volume');
    this._actionQueue = new ActionQueue();

    // Set all the properties of the sound from the passed options
    this._id = typeof options.id === 'string' ? options.id : Math.round(Date.now() * Math.random()).toString();
    this._src = Array.isArray(options.src) ? options.src : [options.src];
    typeof options.format === 'string' && (this._format = options.format);
    typeof options.sprite === 'object' && (this._sprite = options.sprite);
    typeof options.volume === 'number' && options.volume >= 0 && options.volume <= 1.0 && (this._volume = options.volume);
    typeof options.rate === 'number' && options.rate > 0 && options.rate <= 5 && (this._rate = options.rate);
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

    // Run the setup for the audio engine
    buzzer.setup();

    // If no audio is available throw error.
    if (!buzzer.isAudioAvailable()) {
      this._fire('error', { type: ErrorType.NoAudio, error: 'No audio support is available' });
      return this;
    }

    // Add the created buzz to the buzzer collection for controlling it when needed.
    buzzer.add(this);

    // If web audio is available retrieve and store the context locally.
    if (buzzer.isWebAudioAvailable()) {
      this._context = buzzer.context();
    }

    if (this._autoplay) {
      this.play();
      return this;
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
   * Create the gain node if the derived type supports it.
   * @protected
   */
  _createGainNode() {
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
   * Plays the sound from start or resume it from the paused state.
   * @param {string=} sound The sound name defined in the sprite
   * @returns {BaseBuzz}
   */
  play(sound) {
    return this._play(sound);
  }

  /**
   * Plays the sound from start or resume it from the paused state.
   * @param {string|null=} sound The sound name defined in the sprite
   * @param {boolean} [fireEvent = true] True to fire event
   * @return {BaseBuzz}
   * @private
   */
  _play(sound, fireEvent = true) {

    // If the sound is already playing return immediately.
    if (this.isPlaying()) {
      return this;
    }

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

    this._playNode(() => {
      this._endTimer = setTimeout(this._onEnded, timeout);
      this._state = BuzzState.Playing;

      fireEvent && this._fire('play');
    });

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
   * Mute the sound.
   * @returns {BaseBuzz}
   */
  mute() {
    if (this._muted) {
      return this;
    }

    this._gainNode && (this._gainNode.gain.value = 0);
    this._muteNode();
    this._muted = true;
    this._fire('mute', this._muted);

    return this;
  }

  /**
   * Should be implemented by the derived classes if required.
   * @private
   */
  _muteNode() {
    throw new Error('Should be implemented by the derived class');
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
    this._unMuteNode();
    this._muted = false;
    this._fire('mute', this._muted);

    return this;
  }

  /**
   * Should be implemented by the derived classes if required.
   * @private
   */
  _unMuteNode() {
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Get/set the volume.
   * @param {number=} vol Should be from 0.0 to 1.0
   * @returns {BaseBuzz|number}
   */
  volume(vol) {
    if (vol === undefined) {
      return this._volume;
    }

    if (typeof vol !== 'number' || vol < 0 || vol > 1.0) {
      return this;
    }

    if (this._gainNode) {
      this._gainNode.gain.value = vol;
    } else {
      this._setVolume(vol);
    }

    this._volume = vol;
    this._fire('volume', this._volume);
    return this;
  }

  /**
   * Set the volume to the underlying node that controls the volume.
   * @param {number} vol Volume
   * @private
   */
  _setVolume(vol) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Get/set the playback rate.
   * @param {number=} rate The playback rate
   * @return {BaseBuzz|number}
   */
  rate(rate) {
    if (typeof rate === 'undefined') {
      return this._rate;
    }

    if (typeof rate !== 'number' || rate < 0 || rate > 5) {
      return this;
    }

    this._rate = rate;
    this._rateSeek = this.seek();

    if (this.isPlaying()) {
      this._setRate(rate);
      this._clearEndTimer();
      let [, duration] = this._getTimeVars();
      this._endTimer = setTimeout(this._onEnded, (duration * 1000) / Math.abs(rate));
    }

    this._fire('rate', this._rate);
    return this;
  }

  /**
   * Set the playbackrate for the underlying node that plays the sound.
   * @param {number=} rate The playback rate
   * @protected
   */
  _setRate(rate) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Get/set the seek position.
   * @param {number=} seek The seek position
   * @return {BaseBuzz|number}
   */
  seek(seek) {
    if (typeof seek === 'undefined') {
      return this._getSeek();
    }

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

    this._setSeek(seek, () => {
      this._fire('seek', seek);

      if (isPlaying) {
        this._play(null, false);
      }
    });

    return this;
  }

  /**
   * Returns the current position in the playback.
   * @protected
   */
  _getSeek() {
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Seek the playback to the passed position.
   * @param {number} seek The seek position
   * @param {function} cb The callback function
   * @protected
   */
  _setSeek(seek, cb) {
    this._currentPos = seek;
    cb();
  }

  /**
   * Get/set the loop parameter of the sound.
   * @return {BaseBuzz}
   */
  loop() {
    return this;
  }

  /**
   * Returns whether the sound is muted or not.
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
   * Returns the total duration of the sound or for the passed sound that's defined in the sprite.
   * @param {string=} sound The sound name defined in the sprite.
   * @return {number}
   */
  duration(sound) {
    if (typeof sound === 'undefined') {
      return this._duration;
    }

    const times = this._sprite[sound];

    if (!times) {
      return 0;
    }

    return times[1] - times[0];
  }

  /**
   * Returns true if the buzz is playing.
   * @return {boolean}
   */
  isPlaying() {
    return this._state === BuzzState.Playing;
  }

  /**
   * Returns true if buzz is paused.
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
    buzzer.remove(this);
    this._context = null;
    this._gainNode = null;
    this._actionQueue.clear();
    this._actionQueue = null;
    this._destroy();
    this._state = BuzzState.Destroyed;
    this._fire('destroy');
    this._emitter.clear();
    this._emitter = null;
    return this;
  }

  /**
   * Should be implemented by the derived class if required.
   * @protected
   */
  _destroy() {
    return;
  }
}

export { BaseBuzz as default, BuzzState, ErrorType };
