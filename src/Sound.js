import engine from './Engine';
import utility from './Utility';

/**
 * Enum that represents the different states of a sound.
 * @enum {string}
 */
const SoundState = {
  Ready: 'ready',
  Playing: 'playing',
  Paused: 'paused',
  Destroyed: 'destroyed'
};

/**
 * Represents a sound created using Web Audio API.
 * @class
 */
class Sound {

  /**
   * Unique id.
   * @type {number}
   * @private
   */
  _id = -1;

  /**
   * The current volume of the sound. Should be from 0.0 to 1.0.
   * @type {number}
   * @private
   */
  _volume = 1.0;

  /**
   * The current playback speed. Should be from 0.5 to 5.
   * @type {number}
   * @private
   */
  _rate = 1;

  /**
   * True if the sound is currently muted.
   * @type {boolean}
   * @private
   */
  _muted = false;

  /**
   * True if the sound should play repeatedly.
   * @type {boolean}
   * @private
   */
  _loop = false;

  /**
   * The current state (playing, paused etc.) of the sound.
   * @type {SoundState}
   * @private
   */
  _state = SoundState.Ready;

  /**
   * Web API's audio context.
   * @type {AudioContext}
   * @private
   */
  _context = null;

  /**
   * The gain node to control the volume of the sound.
   * @type {GainNode}
   * @private
   */
  _gainNode = null;

  /**
   * The audio buffer.
   * @type {AudioBuffer}
   * @private
   */
  _buffer = null;

  /**
   * The AudioBufferSourceNode that plays the audio buffer assigned to it.
   * @type {AudioBufferSourceNode}
   * @private
   */
  _bufferSourceNode = null;

  /**
   * Duration of the playback in seconds.
   * @type {number}
   * @private
   */
  _duration = 0;

  /**
   * The playback start position.
   * @type {number}
   * @private
   */
  _startPos = 0;

  /**
   * The playback end position.
   * @type {number}
   * @private
   */
  _endPos = 0;

  /**
   * The current position of the playback.
   * @type {number}
   * @private
   */
  _currentPos = 0;

  /**
   * The position of the playback during rate change.
   * @type {number}
   * @private
   */
  _rateSeek = 0;

  /**
   * The time at which the playback started.
   * This property is required for getting the seek position of the playback.
   * @type {number}
   * @private
   */
  _startTime = 0;

  /**
   * The callback that will be invoked after the play ends.
   * @type {function}
   * @private
   */
  _playEndCallback = null;

  /**
   * The callback that will be invoked after the sound destroyed.
   * @type {function}
   * @private
   */
  _destroyCallback = null;

  /**
   * True if the sound is currently fading.
   * @type {boolean}
   * @private
   */
  _fading = false;

  /**
   * The timer that runs function after the fading is complete.
   * @type {number|null}
   * @private
   */
  _fadeTimer = null;

  /**
   * The callback that will be invoked after the fade is completed.
   * @type {function}
   * @private
   */
  _fadeEndCallback = null;

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
   * @param {function} [args.fadeEndCallback] The callback that will be invoked the fade is completed.
   * @constructor
   */
  constructor(args) {
    const {
      id,
      buffer,
      volume,
      rate,
      loop,
      muted,
      startPos,
      endPos,
      playEndCallback,
      destroyCallback,
      fadeEndCallback
    } = args;

    // Set the passed id or the random one.
    this._id = typeof id === 'number' ? id : utility.id();

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
    this._fadeEndCallback = fadeEndCallback;

    // Calculate the duration.
    this._duration = this._endPos - this._startPos;

    // Create gain node and set the volume.
    this._context = engine.context();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.setValueAtTime(this._muted ? 0 : this._volume, this._context.currentTime);
  }

  /**
   * Plays the sound or the sound defined in the sprite.
   * @return {Sound}
   */
  play() {
    // If the sound is already playing then return.
    if (this.isPlaying()) {
      return this;
    }

    // Get the playback starting position.
    let seek = Math.max(0, this._currentPos > 0 ? this._currentPos : this._startPos);

    // Create a new buffersourcenode to play the sound.
    this._bufferSourceNode = this._context.createBufferSource();

    // Set the buffer, playback rate and loop parameters
    this._bufferSourceNode.buffer = this._buffer;
    this._bufferSourceNode.playbackRate.setValueAtTime(this._rate, this._context.currentTime);
    this._setLoop(this._loop);

    // Connect the node to the audio graph.
    this._bufferSourceNode.connect(this._gainNode);

    // Listen to the "ended" event to reset/clean things.
    this._bufferSourceNode.addEventListener('ended', () => {
      // Reset the seek positions
      this._currentPos = 0;
      this._rateSeek = 0;

      // Destroy the node (AudioBufferSourceNodes are one-time use and throw objects).
      this._destroyBufferNode();

      // Reset the state to allow future actions.
      this._state = SoundState.Ready;

      // Invoke the callback if there is one.
      this._playEndCallback && this._playEndCallback(this);
    });

    const startTime = this._context.currentTime;

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
  pause() {
    // If the sound is already playing return.
    if (!this.isPlaying()) {
      return this;
    }

    // Stop the current running fade.
    this.fadeStop();

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
  stop() {
    // If the sound is not playing or paused return.
    if (!this.isPlaying() && !this.isPaused()) {
      return this;
    }

    // Stop the current running fade.
    this.fadeStop();

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
  mute() {
    // Stop the current running fade.
    this.fadeStop();

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
  unmute() {
    // Stop the current running fade.
    this.fadeStop();

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
  volume(vol) {
    // If no input parameter is passed then return the volume.
    if (typeof vol === 'undefined') {
      return this._volume;
    }

    // Stop the current running fade.
    this.fadeStop();

    // Set the gain's value to the passed volume.
    this._gainNode.gain.setValueAtTime(this._muted ? 0 : vol, this._context.currentTime);

    // Set the volume to the property.
    this._volume = vol;

    return this;
  }

  /**
   * Fades the sound volume to the passed value in the passed duration.
   * @param {number} to The destination volume.
   * @param {number} duration The period of fade.
   * @param {string} [type = linear] The fade type (linear or exponential).
   * @return {Sound}
   */
  fade(to, duration, type = 'linear') {
    // If a fade is already running stop it.
    if (this._fading) {
      this.fadeStop();
    }

    this._fading = true;

    if (type === 'linear') {
      this._gainNode.gain.linearRampToValueAtTime(to, this._context.currentTime + duration);
    } else {
      this._gainNode.gain.exponentialRampToValueAtTime(to, this._context.currentTime + duration);
    }

    this._fadeTimer = setTimeout(() => {
      this.volume(to);

      clearTimeout(this._fadeTimer);

      this._fadeTimer = null;
      this._fading = false;

      this._fadeEndCallback && this._fadeEndCallback(this);
    }, duration * 1000);

    return this;
  }

  /**
   * Stops the current running fade.
   * @return {Sound}
   */
  fadeStop() {
    if (!this._fading) {
      return this;
    }

    this._gainNode.gain.cancelScheduledValues(this._context.currentTime);

    if (this._fadeTimer) {
      clearTimeout(this._fadeTimer);
      this._fadeTimer = null;
    }

    this._fading = false;
    this.volume(this._gainNode.gain.value);

    return this;
  }

  /**
   * Gets/sets the playback rate.
   * @param {number} [rate] The playback rate. Should be from 0.5 to 5.
   * @return {Sound|number}
   */
  rate(rate) {
    // If no input parameter is passed return the current rate.
    if (typeof rate === 'undefined') {
      return this._rate;
    }

    this._rate = rate;
    this._rateSeek = this.seek();

    if (this.isPlaying()) {
      this._startTime = this._context.currentTime;
      this._bufferSourceNode && (this._bufferSourceNode.playbackRate.setValueAtTime(rate, this._context.currentTime));
    }

    return this;
  }

  /**
   * Gets/sets the seek position.
   * @param {number} [seek] The seek position.
   * @return {Sound|number}
   */
  seek(seek) {
    // If no parameter is passed return the current position.
    if (typeof seek === 'undefined') {
      const realTime = this.isPlaying() ? this._context.currentTime - this._startTime : 0;
      const rateElapsed = this._rateSeek ? this._rateSeek - this._currentPos : 0;

      return this._currentPos + (rateElapsed + realTime * this._rate);
    }

    // If seeking outside the borders then return.
    if (seek < this._startPos || seek > this._endPos) {
      return this;
    }

    // If the sound is currently playing... pause it, set the seek position and then continue playing.
    const isPlaying = this.isPlaying();

    if (isPlaying) {
      this.pause();
    }

    this._currentPos = seek;

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
  loop(loop) {
    if (typeof loop !== 'boolean') {
      return this._loop;
    }

    this._loop = loop;
    this._setLoop(loop);

    return this;
  }

  /**
   * Destroys the dependencies and release the memory.
   * @return {Sound}
   */
  destroy() {
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
  id() {
    return this._id;
  }

  /**
   * Returns whether the sound is muted or not.
   * @return {boolean}
   */
  muted() {
    return this._muted;
  }

  /**
   * Returns the state of the sound.
   * @return {SoundState}
   */
  state() {
    return this._state;
  }

  /**
   * Returns the total duration of the playback.
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
    return this._state === SoundState.Playing;
  }

  /**
   * Returns true if buzz is paused.
   * @return {boolean}
   */
  isPaused() {
    return this._state === SoundState.Paused;
  }

  /**
   * Returns the gain node.
   * @return {GainNode}
   */
  _gain() {
    return this._gainNode;
  }

  /**
   * Stops the playing buffer source node and destroys it.
   * @private
   */
  _destroyBufferNode() {
    if (!this._bufferSourceNode) {
      return;
    }

    if (typeof this._bufferSourceNode.stop !== 'undefined') {
      this._bufferSourceNode.stop();
    }
    else {
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
  _setLoop(loop) {
    if (!this._bufferSourceNode) {
      return;
    }

    this._bufferSourceNode.loop = loop;

    if (loop) {
      this._bufferSourceNode.loopStart = this._startPos;
      this._bufferSourceNode.loopEnd = this._endPos;
    }
  }
}

export {Sound as default, SoundState};
