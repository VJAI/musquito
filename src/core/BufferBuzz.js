import BaseBuzz, { BuzzState } from './BaseBuzz';
import buzzer from './Buzzer';

/**
 * Employs Web Audio's AudioBufferSourceNode for playing sounds.
 * @class
 */
class BufferBuzz extends BaseBuzz {

  /**
   * Base64 string of an audio.
   * @type {string}
   * @private
   */
  _dataUri = '';

  /**
   * The sprite definition.
   * @type {object}
   * @private
   */
  _sprite = null;

  /**
   * Current playing sound name in a sprite.
   * @type {string|null}
   * @private
   */
  _spriteSound = null;

  /**
   * Whether to cache the buffer or not.
   * @type {boolean}
   * @protected
   */
  _cache = false;

  /**
   * The audio buffer.
   * @type {AudioBuffer}
   * @private
   */
  _buffer = null;

  /**
   * The underlying node that plays the audio.
   * @type {AudioBufferSourceNode}
   * @private
   */
  _bufferSourceNode = null;

  /**
   * Represents the timer that is used to reset the variables once the playback is ended.
   * @type {number|null}
   * @private
   */
  _endTimer = null;

  /**
   * @param {string|object} args The input parameters of the sound.
   * @param {string=} args.id The unique id of the sound.
   * @param {string=} args.src The array of audio urls.
   * @param {string=} args.dataUri The source of the audio as base64 string.
   * @param {object=} args.sprite The sprite definition.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {boolean} [args.muted = false] True to be muted initially.
   * @param {boolean} [args.loop = false] True to play the sound repeatedly.
   * @param {boolean} [args.preload = false] True to pre-load the sound after construction.
   * @param {boolean} [args.autoplay = false] True to play automatically after construction.
   * @param {boolean} [args.cache = false] Whether to cache the buffer or not.
   * @param {function=} args.onload Event-handler for the "load" event.
   * @param {function=} args.onerror Event-handler for the "error" event.
   * @param {function=} args.onplay Event-handler for the "play" event.
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

    if (typeof args === 'object') {
      typeof args.dataUri === 'string' && (this._dataUri = args.dataUri);
      typeof args.cache === 'boolean' && (this._cache = args.cache);
    }

    this._setup();
  }

  /**
   * Validate the passed options.
   * @param {object} options The buzz options.
   * @private
   */
  _validate(options) {
    if ((!options.src || (Array.isArray(options.src) && options.src.length === 0)) && !options.dataUri) {
      throw new Error('You should pass the source for the audio.');
    }
  }

  /**
   * Download the audio file and loads into an audio buffer.
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load() {
    return buzzer.load(this._compatibleSrc, this._cache);
  }

  /**
   * Store the buffer and duration from the download result.
   * @param {DownloadResult} downloadResult The download result
   * @private
   */
  _save(downloadResult) {
    this._buffer = downloadResult.value;
    this._duration = this._buffer.duration;
  }

  /**
   * Plays the sound or resume it from the paused state.
   * @return {BufferBuzz}
   */
  play() {
    return this._play();
  }

  /**
   * Plays the passed sound that is defined in the sprite.
   * @param {string=} sound The sound name
   * @returns {BufferBuzz}
   */
  playSprite(sound) {
    return this._play(sound);
  }

  /**
   * Plays the sound from start or resume it from the paused state.
   * @param {string|null=} sound The sound name
   * @param {boolean} [fireEvent = true] True to fire event
   * @return {BufferBuzz}
   * @private
   */
  _play(sound, fireEvent = true) {

    // If the sound is already playing return immediately.
    if (this.isPlaying()) {
      return this;
    }

    const isResume = this.isPaused() && this._spriteSound !== sound;

    if (!isResume) {
      // If the sound is not yet loaded push an action to the queue to play the sound once it's loaded.
      if (!this.isLoaded()) {
        this._actionQueue.add('play', () => this._play(sound, fireEvent));
        this.load();
        return this;
      }

      if (sound && this._sprite && this._sprite[sound]) {
        this._spriteSound = sound;
      } else {
        this._spriteSound = null;
      }

      this._elapsed = 0;
    }

    buzzer._link(this);
    this._clearEndTimer();
    let [offset, duration] = this._getTimeVars();
    this._playNode(offset, duration);
    this._startedAt = this._context.currentTime;

    if (!this._loop) {
      if (this._spriteSound) {
        this._endTimer = setTimeout(this._onEnded, duration * 1000);
      }
      else {
        this._bufferSourceNode.addEventListener('ended', this._onEnded.bind(this));
      }
    }

    this._state = BuzzState.Playing;

    fireEvent && this._fire('play');

    return this;
  }

  /**
   * Returns the offset and duration of the playback.
   * @return {[number, number]}
   * @private
   */
  _getTimeVars() {
    let offset = 0, duration = 0;

    if (this._spriteSound) {
      const startEnd = this._sprite[this._spriteSound], soundStart = startEnd[0], soundEnd = startEnd[1];
      offset = (this._elapsed < soundStart || this._elapsed > soundEnd) ? soundStart : this._elapsed;
      duration = (soundEnd - soundStart) - this._elapsed;
    } else {
      offset = this._elapsed;
      duration = this._duration - this._elapsed;
    }

    duration = (duration / this._rate);

    return [offset, duration];
  }

  /**
   * Creates a new AudioBufferSourceNode and plays it with the passed offset and duration.
   * @param {number} offset The time offset
   * @param {number} duration The duration to play
   * @private
   */
  _playNode(offset, duration) {
    this._createNode();

    if (typeof this._bufferSourceNode.start !== 'undefined') {
      this._bufferSourceNode.start(this._context.currentTime, offset, duration);
    }
    else {
      this._bufferSourceNode.noteGrainOn(this._context.currentTime, offset, duration);
    }
  }

  /**
   * Creates a new AudioBufferSourceNode and set it's playback properties.
   * @private
   */
  _createNode() {
    this._bufferSourceNode = this._context.createBufferSource();

    this._bufferSourceNode.buffer = this._buffer;
    this._bufferSourceNode.playbackRate.value = this._rate;
    this._bufferSourceNode.loop = this._loop;

    if (this._spriteSound) {
      const startEnd = this._sprite[this._spriteSound];
      this._bufferSourceNode.loopStart = startEnd[0];
      this._bufferSourceNode.loopEnd = startEnd[1];
    }

    this._bufferSourceNode.connect(this._gainNode);
  }

  /**
   * Called after the playback ends.
   * @private
   */
  _onEnded() {
    this._reset();
    this._state = BuzzState.Idle;
    this._fire('playend');

    /*if (this._loop) {
      this._startedAt = 0;
      this._elapsed = 0;
      this._state = BuzzState.Idle;
      this._fire('playend');
      this.play(this._spriteSound);
    } else {
      this._reset();
      this._state = BuzzState.Idle;
      this._fire('playend');
    }*/
  }

  /**
   * Resets the internal variables and end timer.
   * @private
   */
  _reset() {
    super._reset();
    this._clearEndTimer();
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
   * Get/set the playback rate.
   * @param {number=} rate The playback rate
   * @return {BufferBuzz|number}
   */
  rate(rate) {
    if (typeof rate === 'undefined') {
      return this._rate;
    }

    if (typeof rate !== 'number' || rate < 0 || rate > 5) {
      return this;
    }

    this._rateElapsed = this.seek(); // TODO: reset this variable at the places required
    this._startedAt = this._context.currentTime;
    this._rate = rate;

    if (this.isPlaying()) {
      this._bufferSourceNode.playbackRate.value = this._rate;
      this._clearEndTimer();
      let [, duration] = this._getTimeVars(this._spriteSound);
      this._endTimer = setTimeout(this._onEnded, duration * 1000);
    }

    this._fire('rate', this._rate);
    return this;
  }

  /**
   * Get/set the seek position.
   * @param {number=} seek The seek position
   * @return {BufferBuzz|number}
   */
  seek(seek) {
    if (typeof seek === 'undefined') {
      const realTime = this.isPlaying() ? this._context.currentTime - this._startedAt : 0;
      const rateElapsed = this._rateElapsed ? this._rateElapsed - this._elapsed : 0;

      return this._elapsed + (rateElapsed + realTime * this._rate);
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

    this._elapsed = seek;
    this._fire('seek', seek);

    if (isPlaying) {
      this._play(null, false);
    }

    return this;
  }

  /**
   * Returns the total duration of the sound or the piece of sound in sprite.
   * @param {string=} sound The sound name in the sprite.
   * @return {number}
   */
  spriteDuration(sound) {
    if (typeof sound === 'undefined') {
      return this.duration();
    }

    const times = this._sprite[sound];

    if (!times) {
      return 0;
    }

    return times[1] - times[0];
  }

  /**
   * Stops the playing buffer source node and destroys it.
   * @private
   */
  _stopNode() {
    if (this._bufferSourceNode) {
      if (typeof this._bufferSourceNode.stop !== 'undefined') {
        this._bufferSourceNode.stop();
      }
      else {
        this._bufferSourceNode.noteGrainOff();
      }

      this._cleanNode();
    }
  }

  /**
   * Destroys the buffer source node.
   * @private
   */
  _cleanNode() {
    if (!this._bufferSourceNode) {
      return;
    }

    this._bufferSourceNode.disconnect();
    this._bufferSourceNode.onended = null;
    try {
      this._bufferSourceNode.buffer = buzzer.scratchBuffer();
    }
    catch (e) {
    }
    this._bufferSourceNode = null;
  }

  /**
   * Null the buffer.
   * @private
   */
  _destroy() {
    this._buffer = null;
  }
}

export { BufferBuzz as default };
