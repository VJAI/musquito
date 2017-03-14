import BaseBuzz, {BuzzState, ErrorType} from './BaseBuzz';

/**
 * Represents a single sound.
 * @class
 */
class MediaBuzz extends BaseBuzz {

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

  /**
   * Load the sound into an audio buffer.
   * Fires 'load' event on successful load and 'error' event on failure.
   * @returns {MediaBuzz}
   */
  load() {
  }

  /**
   * Plays the sound.
   * Fires 'playstart' event before playing and 'playend' event after the sound is played.
   * @param {string=} sound
   * @returns {MediaBuzz}
   */
  play(sound) {
  }

  /**
   * Pause the playing sound.
   * @returns {MediaBuzz}
   */
  pause() {
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {MediaBuzz}
   */
  stop() {
  }

  /**
   * Destroys the buzz.
   */
  destroy() {
  }
}

export {MediaBuzz as default};
