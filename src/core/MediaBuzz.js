import BaseBuzz, {BuzzState, ErrorType} from './BaseBuzz';
import codecAid from '../util/CodecAid';
import {MediaDownloadResult} from '../util/MediaLoder';

/**
 * Represents a single sound.
 * @class
 */
class MediaBuzz extends BaseBuzz {

  _audio = null;

  _mediaElementAudioSourceNode = null;

  /**
   * @param {object} args
   * @param {string=} args.id An unique id for the sound.
   * @param {string=} args.src The source of the audio file.
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
    this._audio = new Audio();
  }

  _validate(options) {
    if(this._src.length === 0) {
      throw new Error('You should pass the source for the audio.');
    }
  }

  /**
   * Load the sound into an audio buffer.
   * Fires 'load' event on successful load and 'error' event on failure.
   * @returns {MediaBuzz}
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

    if(this._audio.readyState === 4) {
      this._onLoad();
      return this;
    }

    this._audio.preload = 'auto';
    this._audio.addEventListener('canplaythrough', this._onLoad);
    this._audio.src = src;
    this._audio.load();
    return this;
  }

  _onLoad() {
    this._duration = this._audio.duration;
    this._mediaElementAudioSourceNode = this._context.createMediaElementSource(this._audio);
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = this._muted ? 0 : this._volume;
    this._isLoaded = true;
    this._state = BuzzState.Ready;
    this._fire('load', new MediaDownloadResult(this._feasibleSrc, this._audio));
  }

  /**
   * Plays the sound.
   * Fires 'playstart' event before playing and 'playend' event after the sound is played.
   * @param {string=} sound
   * @returns {MediaBuzz}
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


  }

  /**
   * Pause the playing sound.
   * @returns {MediaBuzz}
   */
  pause() {
    throw new Error('Not Implemented');
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {MediaBuzz}
   */
  stop() {
    throw new Error('Not Implemented');
  }

  /**
   * Destroys the buzz.
   */
  destroy() {
    throw new Error('Not Implemented');
  }
}

export {MediaBuzz as default};
