import buzzer from '../core/Buzzer';
import EventEmitter from '../util/EventEmitter';
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
   */
  constructor(args) {
    throw new Error('Not implemented');
  }

  /**
   * Plays the sound from start or resume it from the paused state.
   */
  play() {
    throw new Error('Not implemented');
  }

  /**
   * Pause the playing sound.
   * @returns {BaseBuzz}
   */
  pause() {
    throw new Error('Not implemented');
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {BaseBuzz}
   */
  stop() {
    throw new Error('Not implemented');
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
    this._play(null, false);
    this._fire('seek', seek);

    return this;
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

  // TODO: Need to implement this
  unload() {
    throw new Error('Not implemented');
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
