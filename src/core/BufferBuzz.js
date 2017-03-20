import BaseBuzz, {BuzzState, ErrorType} from './BaseBuzz';
import DownloadStatus from '../util/DownloadStatus';
import codecAid from '../util/CodecAid';
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
   * Audio Buffer.
   * @type {AudioBuffer|null}
   * @private
   */
  _buffer = null;

  /**
   * AudioBufferSourceNode.
   * @type {AudioBufferSourceNode|null}
   * @private
   */
  _bufferSource = null;

  /**
   * @param {object} args
   * @param {string=} args.id An unique id for the sound.
   * @param {string=} args.src The source of the audio file.
   * @param {string=} args.dataUri The source of the audio in base64 string.
   * @param {object=} args.sprite The sprite definition.
   * @param {number} [args.volume = 1.0] The initial volume of the sound.
   * @param {boolean} [args.muted = false] Should be muted initially.
   * @param {number} [args.loop = false] Whether the sound should play repeatedly.
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
    super(args);
  }

  validate(options) {
    if(this._src.length === 0 && !this._dataUri) {
      throw new Error('You should pass the source for the audio.');
    }
  }

  _read(options) {
    typeof options.dataUri === 'string' && (this._dataUri = options.dataUri);
  }

  /**
   * Load the sound into an audio buffer.
   * Fires 'load' event on successful load and 'error' event on failure.
   * @returns {BufferBuzz}
   */
  load() {
    // If the buffer is already loaded return without reloading again.
    if (this._isLoaded) {
      return this;
    }

    // Set the state to "Loading" to avoid multiple times loading the buffer.
    this._state = BuzzState.Loading;

    const src = codecAid.getSupportedFile(this._src);

    if(!src) {
      this._feasibleSrc = src;
      this._removePlayHandler();
      this._state = BuzzState.Error;
      this._fire('error', {type: ErrorType.LoadError, error: 'None of the audio format you passed is supported'});
      return this;
    }

    buzzer.load(this._feasibleSrc).then(downloadResult => {
      if (downloadResult.status === DownloadStatus.Success) {
        this._buffer = downloadResult.value;
        this._duration = this._buffer.duration;
        this._gainNode = this._context.createGain();
        this._gainNode.gain.value = this._muted ? 0 : this._volume;
        this._isLoaded = true;
        this._state = BuzzState.Ready;
        this._fire('load', downloadResult);
        return;
      }

      this._removePlayHandler();
      this._state = BuzzState.Error;
      this._fire('error', {type: ErrorType.LoadError, error: downloadResult.error});
    });

    return this;
  }

  /**
   * Plays the sound.
   * Fires 'playstart' event before playing and 'playend' event after the sound is played.
   * @param {string=} sound
   * @returns {BufferBuzz}
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

    let offset = this._elapsed;
    let duration = this._duration;

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
      if(this._loop) {
        this._startedAt = 0;
        this._elapsed = 0;
        this._state = BuzzState.Ready;
        this._fire('playend');
        this.play(sound);
      } else {
        this._reset();
        this._state = BuzzState.Ready;
        this._fire('playend');
      }
    }, duration * 1000);
    this._state = BuzzState.Playing;
    this._fire('playstart');

    return this;
  }

  _reset() {
    buzzer._unlink(this);

    if (this._bufferSource) {
      this._bufferSource.disconnect();
      this._bufferSource.stop(0);
      this._bufferSource = null;
    }

    this._startedAt = 0;
    this._elapsed = 0;
    this._clearEndTimer();
  }

  /**
   * Pause the playing sound.
   * @returns {BufferBuzz}
   */
  pause() {
    // Remove the "play" event handler from queue if there is one.
    this._removePlayHandler();

    // We can pause the sound only if it is "playing" state.
    if (this._state !== BuzzState.Playing) {
      return this;
    }

    const startedAt = this._startedAt, elapsed = this._elapsed;
    this._reset();
    this._elapsed = elapsed + this._context.currentTime - startedAt;
    this._state = BuzzState.Paused;
    this._fire('pause');

    return this;
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {BufferBuzz}
   */
  stop() {
    // Remove the "play" event handler from queue if there is one.
    this._removePlayHandler();

    // We can stop the sound either if it "playing" or in "paused" state.
    if (this._state !== BuzzState.Playing && this._state !== BuzzState.Paused) {
      return this;
    }

    this._reset();
    this._state = BuzzState.Stopped;
    this._fire('stop');

    return this;
  }

  /**
   * Destroys the buzz.
   */
  destroy() {
    // TODO: Conditional check missing!

    this.stop();

    this._buffer = null;
    this._context = null;
    this._gainNode = null;
    this._state = BuzzState.Destroyed;

    this._fire('destroy');

    this._emitter.clear();
    this._emitter = null;
  }
}

export {BufferBuzz as default};
