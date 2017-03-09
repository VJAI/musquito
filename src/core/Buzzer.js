import codecAid from '../util/CodecAid';
import BufferLoader from '../util/BufferLoader';
import EventEmitter from '../util/EventEmitter';

/**
 * Represents the different states of the audio engine.
 * @enum {number}
 */
const BuzzerState = {
  Constructed: 0,
  Ready: 1,
  Idle: 2,
  Done: 3,
  Error: 4
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
    this._buzzes = {};
    this._muted = false;
    this._volume = 1.0;
    this._gainNode = null;
    this._contextType = AudioContext || webkitAudioContext;
    this._eventEmitter = new EventEmitter('suspend,resume,playstart,playend,stop');
    this._state = BuzzerState.Constructed;
  }

  /**
   * Instantiate audio context and other important objects.
   * Returns true if the setup is success.
   * @param {object=} args
   * @param {number=} [args.volume = 1.0]
   * @param {boolean=} [args.saveEnergy = false]
   * @param {AudioContext=} args.context
   * @returns {Buzzer}
   */
  setup(args) {
    const options = args || {};

    if (this._state === BuzzerState.Ready) {
      return true;
    }

    if(!this._contextType) {
      this._state = BuzzerState.Error;
      throw new Error('Web Audio API is unavailable');
    }

    this._context = options.context || new this._contextType();
    const volume = parseFloat(options.volume);
    this._volume = !isNaN(volume) && volume >= 0 && volume <= 1.0 ? volume : this._volume;
    this._saveEnergy = typeof options.saveEnergy === 'boolean' ? options.saveEnergy : true;
    this._bufferLoader = new BufferLoader(this._context);
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = this._volume;
    this._gainNode.connect(this._context.destination);
    this._state = BuzzerState.Ready;
    return this;
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
   * Unloads single or multiple loaded audio buffers from cache.
   * @param {string|string[]} urls
   * @return {Buzzer}
   */
  unload(urls) {
    this._bufferLoader.unload(urls);
    return this;
  }

  /**
   * Set/get the volume for the audio engine that controls global volume for all sounds.
   * @param {number=} vol
   * @returns {Buzzer|number}
   */
  volume(vol) {
    if (typeof vol === 'undefined') {
      return this._volume;
    }

    const volume = parseFloat(vol);

    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return this._volume;
    }

    this._volume = volume;
    this._gainNode && (this._gainNode.gain.value = this._volume);

    return this;
  }

  stop() {
    Object.keys(this._buzzes).forEach(buzz => buzz.stop());
    return this;
  }

  suspend() {

  }

  resume() {

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

  add(buzz) {
    this._buzzes[buzz.id] = buzz;
  }

  remove(buzz) {
    delete this._buzzes[buzz.id];
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

  supportedFormats() {
    return codecAid.supported();
  }
}

const buzzer = new Buzzer();

export { BuzzerState, buzzer as default };
