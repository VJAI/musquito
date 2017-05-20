import buzzer from './Buzzer';
import ErrorType from '../util/ErrorType';

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
   * Represents the source of the sound.
   * @type {*}
   * @private
   */
  _src = null;

  /**
   * The current volume of the sound.
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
   * Represents whether the sound should play repeatedly or not.
   * @type {boolean}
   * @protected
   */
  _loop = false;

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
   * Duration of the sound in seconds.
   * @type {number}
   * @protected
   */
  _duration = 0;

  /**
   * True if using Web Audio API to play sounds.
   * @type {boolean}
   * @protected
   */
  _webAudio = false;

  /**
   * @param {string|object} args The input parameters of the sound.
   * @param {string=} args.id The unique id of the sound.
   * @param {*} args.src The source of the sound.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {number} [args.rate = 1] The initial playback rate of the sound.
   * @param {boolean} [args.muted = false] True to be muted initially.
   * @param {boolean} [args.loop = false] True to play the sound repeatedly.
   * @param {boolean} [args.autoplay = false] True to play automatically after construction.
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

    const options = this._validate(args);

    this._instantiate();

    this._id = typeof options.id === 'string' ? options.id : Math.round(Date.now() * Math.random()).toString();
    this._src = options.src;
    typeof options.volume === 'number' && options.volume >= 0 && options.volume <= 1.0 && (this._volume = options.volume);
    typeof options.muted === 'boolean' && (this._muted = options.muted);
    typeof options.loop === 'boolean' && (this._loop = options.loop);
    typeof options.autoplay === 'boolean' && (this._autoplay = options.autoplay);
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

    // Read other options if there are any required by the derived type.
    this._read(options);

    // Setup the audio engine
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
      this._webAudio = true;
      this._context = buzzer.context();
    }

    // Play the sound if the autoplay is passed as true.
    if (this._autoplay) {
      this.play();
      return this;
    }
  }

  /**
   * Validate the passed arguments and return the constructed options object.
   * @param {*} args The arguments passed to the sound
   * @protected
   */
  _validate(args) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived type');
  }

  /**
   * Instantiate the dependencies.
   * @protected
   */
  _instantiate() {
    return;
  }

  /**
   * Read other options required by the derived type.
   * @param {object} options The options object
   * @protected
   */
  _read(options) { // eslint-disable-line no-unused-vars
    return;
  }

  /**
   * Plays the sound from start or resume it from the paused state.
   * @return {BaseBuzz}
   */
  play() {
    if (this.isPlaying()) {
      return this;
    }

    this._play();

    return this;
  }

  /**
   * Play the sound using the underlying mechanism.
   * @param {boolean} fireEvent True to fire play events.
   * @protected
   */
  _play(fireEvent = true) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Pause the playing sound.
   * @returns {BaseBuzz}
   */
  pause() {
    if (this.isPaused()) {
      return this;
    }

    this._pause();

    return this;
  }

  /**
   * Pause the sound.
   * @param {boolean} fireEvent True to fire events.
   * @protected
   */
  _pause(fireEvent = true) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {BaseBuzz}
   */
  stop() {
    if (!this.isPlaying() && !this.isPaused()) {
      return this;
    }

    this._stop();

    return this;
  }

  /**
   * Stop the sound.
   * @param {boolean} fireEvent True to fire events.
   * @protected
   */
  _stop(fireEvent = true) { // eslint-disable-line no-unused-vars
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Mutes the sound.
   * @returns {BaseBuzz}
   */
  mute() {
    if (this._muted) {
      return this;
    }

    if (this._gainNode) {
      this._gainNode.gain.value = 0;
    } else {
      this._muteNode();
    }

    this._muted = true;
    this._fire('mute', this._muted);

    return this;
  }

  /**
   * Should be implemented by the derived classes if required.
   * @protected
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

    if (this._gainNode) {
      this._gainNode.gain.value = this._volume;
    } else {
      this._unMuteNode();
    }

    this._unMuteNode();
    this._muted = false;
    this._fire('mute', this._muted);

    return this;
  }

  /**
   * Should be implemented by the derived classes if required.
   * @protected
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
   * @protected
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
    this._setRate(rate);

    return this;
  }

  /**
   * Set the playbackrate for the underlying node that plays the sound.
   * @param {number} rate The playback rate
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

    return this._setSeek(seek);
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
   * @return  {BaseBuzz}
   * @protected
   */
  _setSeek(seek) {
    throw new Error('Should be implemented by the derived class');
  }

  /**
   * Get/set the loop parameter of the sound.
   * @param {boolean} loop True to loop the sound
   * @return {BaseBuzz/boolean}
   */
  loop(loop) {
    if (typeof loop !== 'boolean') {
      return this._loop;
    }

    this._loop = loop;
    this._setLoop();
    return this;
  }

  /**
   * Set the sound to play repeatedly or not.
   * @protected
   */
  _setLoop() {
    return;
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

  /**
   * Returns the id.
   * @return {string|null}
   */
  id() {
    return this._id;
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
   * Returns the total duration of the sound or for the passed sound that's defined in the sprite.
   * @return {number}
   */
  duration() {
    return this._duration;
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
   * Returns true if using Web Audio API to play sounds.
   * @return {boolean}
   */
  usingWebAudio() {
    return this._webAudio;
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
}

export { BaseBuzz as default, BuzzState };
