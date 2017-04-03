import BaseBuzz, { BuzzState } from './BaseBuzz';
import buzzer from './Buzzer';

/**
 * Represents a single sound.
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
   * @param {string|object} args The input parameters of the sound.
   * @param {string=} args.id An unique id for the sound.
   * @param {string=} args.src The source of the audio file.
   * @param {string=} args.dataUri The source of the audio in base64 string.
   * @param {object=} args.sprite The sprite definition.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {boolean} [args.muted = false] Should be muted initially.
   * @param {number} [args.loop = false] Whether the sound should play repeatedly.
   * @param {boolean} [args.preload = false] Load the sound initially itself.
   * @param {boolean} [args.autoplay = false] Play automatically once the object is created.
   * @param {boolean} [args.cache = false] Whether to cache the buffer or not.
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
    super(args);
  }

  /**
   * Validate the passed options.
   * @param {object} options The buzz options.
   * @private
   */
  _validate(options) {
    if ((!options.src || (Array.isArray(options.src) && options.src.length === 0)) && !this._dataUri) {
      throw new Error('You should pass the source for the audio.');
    }
  }

  /**
   * Read the parameters that are specific to BufferBuzz.
   * @param {object} options The buzz options.
   * @private
   */
  _read(options) {
    typeof options.dataUri === 'string' && (this._dataUri = options.dataUri);
    typeof options.cache === 'boolean' && (this._cache = options.cache);
  }

  /**
   * Loads the audio buffer.
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load() {
    return buzzer.load(this._feasibleSrc, this._cache);
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
   * Plays the sound.
   * Fires 'playstart' event before playing and 'playend' event after the sound is played.
   * @param {string=} sound The sound name of the sprite
   * @returns {BaseBuzz}
   */
  play(sound) {
    // If the sound is already in "Playing" state then it's not allowed to play again.
    if (this._state === BuzzState.Playing) {
      return this;
    }

    if (!this._isLoaded) {
      this.on('load', {
        handler: this.play,
        target: this,
        args: [sound],
        once: true
      });

      this.load();

      return this;
    }

    let offset = this._elapsed, duration = this._duration;

    // If we are gonna play a sound in sprite calculate the duration and also check if the offset is within that
    // sound boundaries and if not reset to the starting point.
    if (sound && this._sprite && this._sprite[sound]) {
      const startEnd = this._sprite[sound],
        soundStart = startEnd[0],
        soundEnd = startEnd[1];

      duration = soundEnd - soundStart;
      offset = (offset < soundStart || offset > soundEnd) ? soundStart : offset;
    }

    buzzer._link(this);
    this._clearEndTimer();
    this._bufferSource = this._context.createBufferSource();
    this._bufferSource.buffer = this._buffer;
    this._bufferSource.connect(this._gainNode);
    this._bufferSource.start(0, offset);
    this._startedAt = this._context.currentTime;
    this._endTimer = setTimeout(() => {
      if (this._loop) {
        this._startedAt = 0;
        this._elapsed = 0;
        this._state = BuzzState.Ready;
        this._fire('playend');
        this.play(sound);
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
   * Disconnect the buffer source and stop it.
   * @private
   */
  _stop() {
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
