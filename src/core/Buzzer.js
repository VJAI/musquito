import codecaid from '../util/CodecAid';
import BufferLoader from '../util/BufferLoader';

/**
 * Represents the different states of the audio engine.
 * @enum {number}
 */
const BuzzerState = {
  Constructed: 0,
  Ready: 1,
  Done: 2
};

/**
 * The audio engine.
 * @class
 */
class Buzzer {

  /**
   * Initialize the internal variables.
   * @constructor
   */
  constructor() {
    this._context = null;
    this._bufferLoader = null;
    this._formats = {};
    this._muted = false;
    this._volume = 1.0;
    this._gainNode = null;
    this._contextType = AudioContext || webkitAudioContext;

    if(!this._contextType) {
      throw new Error('Web Audio API is unavailable');
    }

    this._state = BuzzerState.Constructed;
  }

  /**
   * Instantiate audio context and other important objects.
   * Returns true if the setup is success.
   * @param {AudioContext} context
   * @returns {boolean}
   */
  setup(context) {
    if (this._state === BuzzerState.Ready) {
      return true;
    }

    this._context = context || new this._contextType();
    this._bufferLoader = new BufferLoader(this._context);
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = this._volume;
    this._gainNode.connect(this._context.destination);
    this._state = BuzzerState.Ready;
    return true;
  }

  /**
   * Loads single or multiple audio resources into audio buffers.
   * @param {string|string[]} urls
   * @return {Promise}
   */
  load(urls) {
    return this._bufferLoader.load(urls);
  }

  /**
   * Set/get the volume for the audio engine that controls global volume for all sounds.
   * @param {number} vol
   * @returns {Buzzer|number}
   */
  volume(vol) {
    if (typeof vol === 'undefined') {
      return this._volume;
    }

    var volume = parseFloat(vol);

    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return this._volume;
    }

    this._volume = volume;
    this._gainNode && (this._gainNode.gain.value = this._volume);

    return this;
  }

  /**
   * Mute the engine.
   */
  mute() {
    if (this._muted) {
      return;
    }

    this._gainNode && (this._gainNode.gain.value = 0);
    this._muted = true;
  }

  /**
   * Unmute the engine.
   */
  unmute() {
    if (!this._muted) {
      return;
    }

    this._gainNode && (this._gainNode.gain.value = this._volume);
    this._muted = false;
  }

  /**
   * TODO
   */
  tearDown() {
    this._state = BuzzerState.Done;
  }

  /**
   * Returns the created audio context.
   * @returns {AudioContext}
   */
  context() {
    return this._context;
  }

  /**
   * Returns the master gain node.
   * @returns {GainNode}
   */
  gain() {
    return this._gainNode;
  }

  /**
   * Returns whether the engine is currently muted or not.
   * @returns {boolean}
   */
  muted() {
    return this._muted;
  }

  /**
   * Returns the state of the engine.
   * @returns {number}
   */
  state() {
    return this._state;
  }

  /**
   * Returns whether the engine is available or not.
   * @returns {boolean}
   */
  available() {
    return this._state !== BuzzerState.NA;
  }
}

const buzzer = new Buzzer();

export { BuzzerState, buzzer as default };
