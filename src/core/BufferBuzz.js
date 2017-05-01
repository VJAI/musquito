import BaseBuzz, { BuzzState } from './BaseBuzz';
import buzzer from './Buzzer';
import BuzzBufferNode from '../elements/BuzzBufferNode';

/**
 * Represents a class that used Web Audio API's AudioBufferSourceNode for playing sounds.
 * @class
 */
class BufferBuzz extends BaseBuzz {

  /**
   * Base64 string of the audio.
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
   * Current playing name of the sound in a sprite.
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
   * Audio Buffer.
   * @type {AudioBuffer}
   * @private
   */
  _buffer = null;

  /**
   * AudioBufferSourceNode.
   * @type {AudioBufferSourceNode}
   * @private
   */
  _bufferSource = null;

  /**
   * BuzzBufferNode.
   * @type {BuzzBufferNode}
   * @private
   */
  _buzzBufferNode = null;

  /**
   * Represents the timer that is used to reset the variables after the playback.
   * @type {number|null}
   * @private
   */
  _endTimer = null;

  /**
   * @param {string|object} args The input parameters of the sound.
   * @param {string=} args.id The unique id of the sound.
   * @param {string=} args.src The array of audio urls.
   * @param {string=} args.dataUri The source of the audio in base64 string.
   * @param {object=} args.sprite The sprite definition.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {boolean} [args.muted = false] True to be muted initially.
   * @param {boolean} [args.loop = false] True to play the sound repeatedly.
   * @param {boolean} [args.preload = false] True to pre-load the sound after construction.
   * @param {boolean} [args.autoplay = false] True to play automatically after construction.
   * @param {boolean} [args.cache = false] Whether to cache the buffer or not.
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
   * Loads the audio buffer.
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
    this._buzzBufferNode = new BuzzBufferNode(this._context, this._buffer);
    this._duration = this._buffer.duration;
  }

  /**
   * Plays the sound.
   * @return {BufferBuzz}
   */
  play() {
    return this.playSprite();
  }

  /**
   * Plays the sound.
   * @param {string=} sound The sound name of the sprite
   * @returns {BufferBuzz}
   */
  playSprite(sound) {
    return this._play(sound);
  }

  /**
   * Play the sound and fire events.
   * @param {string|null=} sound The sound name of the sprite
   * @param {boolean} [fireEvent = true] True to fire event
   * @return {BufferBuzz}
   * @private
   */
  _play(sound, fireEvent = true) {
    // If the sound is already in "Playing" state then it's not allowed to play again.
    if (this.isPlaying()) {
      return this;
    }

    // If the sound is not yet loaded push the play action to the load queue.
    if (!this.isLoaded()) {
      this._actionQueue.add('play', () => this._play(sound, fireEvent));
      this.load();
      return this;
    }

    let [offset, duration] = this._getTimeVars(sound);
    buzzer._link(this);
    this._clearEndTimer();

    this._buzzBufferNode.play({
      time: this._context.currentTime,
      offset: offset,
      duration: duration,
      rate: this._rate,
      loop: this._loop
    });

    // TODO: More clean-up

    this._bufferSource = this._context.createBufferSource();
    this._bufferSource.buffer = this._buffer;
    this._bufferSource.playbackRate.value = this._rate;
    this._bufferSource.connect(this._gainNode);
    this._bufferSource.start(0, offset, duration);

    this._startedAt = this._context.currentTime;
    this._endTimer = setTimeout(this._onEnded, duration * 1000);
    this._state = BuzzState.Playing;
    fireEvent && this._fire('playstart');

    return this;
  }

  _getTimeVars(sound) {
    let offset = 0, duration = 0;

    if (sound && this._sprite && this._sprite[sound]) {
      this._spriteSound = sound;

      const startEnd = this._sprite[this._spriteSound], soundStart = startEnd[0], soundEnd = startEnd[1];
      offset = (this._elapsed < soundStart || this._elapsed > soundEnd) ? soundStart : this._elapsed;
      duration = (soundEnd - soundStart) - this._elapsed;
    } else {
      this._spriteSound = null;

      offset = this._elapsed;
      duration = this._duration - this._elapsed;
    }

    duration = (duration / this._rate);

    return [offset, duration];
  }

  /**
   * Called after the playback ends.
   * @private
   */
  _onEnded() {
    if (this._loop) {
      this._startedAt = 0;
      this._elapsed = 0;
      this._state = BuzzState.Idle;
      this._fire('playend');
      this.play(this._spriteSound);
    } else {
      this._reset();
      this._state = BuzzState.Idle;
      this._fire('playend');
    }
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
      this._bufferSource.playbackRate.value = this._rate;
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
   * Disconnect the buffer source and stop it.
   * @private
   */
  _stopNode() {
    if (this._bufferSource) {
      this._bufferSource.disconnect();
      this._bufferSource.stop(0);
      this._bufferSource = null;
    }
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
