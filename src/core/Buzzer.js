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
  Suspended: 2,
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
    this._buzzEvents = ['playstart', 'playend', 'pause', 'stop'];
    this._emitter = new EventEmitter('suspend,resume,stop,mute,volume,buzzplaystart,buzzplayend,buzzpause,buzzstop');
    this._state = BuzzerState.Constructed;
  }

  /**
   * Instantiate audio context and other important objects.
   * Returns true if the setup is success.
   * @param {object=} args
   * @param {number=} [args.volume = 1.0]
   * @param {boolean=} [args.saveEnergy = false]
   * @param {function=} args.onsuspend Event-handler for the "suspend" event.
   * @param {function=} args.onresume Event-handler for the "resume" event.
   * @param {function=} args.onstop Event-handler for the "stop" event.
   * @param {function=} args.onmute Event-handler for the "mute" event.
   * @param {function=} args.onvolume Event-handler for the "volume" event.
   * @param {function=} args.onbuzzplaystart Event-handler for the "buzzplaystart" event.
   * @param {function=} args.onbuzzplayend Event-handler for the "buzzplayend" event.
   * @param {function=} args.onbuzzpause Event-handler for the "buzzpause" event.
   * @param {function=} args.onbuzzstop Event-handler for the "buzzstop" event.
   * @param {AudioContext=} args.context
   * @returns {Buzzer}
   */
  setup(args) {
    const options = args || {};

    if (this._state === BuzzerState.Ready) {
      return this;
    }

    if(!this._contextType) {
      this._state = BuzzerState.Error;
      throw new Error('Web Audio API is unavailable');
    }

    this._context = options.context || new this._contextType();
    const volume = parseFloat(options.volume);
    this._volume = !isNaN(volume) && volume >= 0 && volume <= 1.0 ? volume : this._volume;
    this._saveEnergy = typeof options.saveEnergy === 'boolean' ? options.saveEnergy : true;
    typeof options.onsuspend === 'function' && this.on('suspend', options.onsuspend);
    typeof options.onresume === 'function' && this.on('resume', options.onresume);
    typeof options.onstop === 'function' && this.on('stop', options.onstop);
    typeof options.onmute === 'function' && this.on('mute', options.onmute);
    typeof options.onvolume === 'function' && this.on('volume', options.onvolume);
    typeof options.onbuzzplaystart === 'function' && this.on('buzzplaystart', options.onbuzzplaystart);
    typeof options.onbuzzplayend === 'function' && this.on('buzzplayend', options.onbuzzplayend);
    typeof options.onbuzzpause === 'function' && this.on('buzzpause', options.onbuzzpause);
    typeof options.onbuzzstop === 'function' && this.on('buzzstop', options.onbuzzstop);
    
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
   * Adds the buzz to the internal array for controlling the playback.
   * @param {Buzz} buzz
   * @returns {Buzzer}
   */
  add(buzz) {
    this._buzzes[buzz.id] = buzz;
    this._buzzEvents.forEach(event => buzz.on(event, {
      handler: this._fireBuzzEvent,
      target: this,
      args: event
    }));
    return this;
  }
  
  /**
   * TODO: Add proper description.
   * @param {string} event
   * @param {...*} args
   * @private
   */
  _fireBuzzEvent(event, ...args) {
    this._fire(`buzz${event}`, ...args);
  }
  
  /**
   * Removes the buzz from the array.
   * @param {Buzz} buzz
   * @returns {Buzzer}
   */
  remove(buzz) {
    this._buzzEvents.forEach(event => buzz.off(event, this._fireBuzzEvent));
    delete this._buzzes[buzz.id];
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
    this._fire('volume', this._volume, this);

    return this;
  }

  /**
   * Mute the engine.
   * @returns {Buzzer}
   */
  mute() {
    if (this._muted) {
      return;
    }

    this._gainNode && (this._gainNode.gain.value = 0);
    this._muted = true;
    this._fire('mute', this._muted);
    
    return this;
  }

  /**
   * Unmute the engine.
   * @returns {Buzzer}
   */
  unmute() {
    if (!this._muted) {
      return;
    }

    this._gainNode && (this._gainNode.gain.value = this._volume);
    this._muted = false;
    this._fire('mute', this._muted);
  
    return this;
  }
  
  /**
   * Stops all the currently playing sounds.
   * @return {Buzzer}
   */
  stop() {
    Object.keys(this._buzzes).forEach(buzz => buzz.stop());
    this._fire('stop');
    return this;
  }
  
  /**
   * Suspends the audio context to save energy.
   * @returns {Buzzer}
   */
  suspend() {
    if(this._state === BuzzerState.Suspended) {
      return this;
    }
    
    this._fire('suspend');
    return this;
  }
  
  /**
   * Resumes the audio context from the suspended mode.
   * @returns {Buzzer}
   */
  resume() {
    if(this._state === BuzzerState.Ready) {
      return this;
    }
    
    this._fire('resume');
    return this;
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

  supportedFormats() {
    return codecAid.supported();
  }
  
  /**
   * Method to subscribe to an event.
   * @param {string} event
   * @param {function|object} options
   * @param {function} options.handler
   * @param {object=} options.target
   * @param {object|Array=} options.args
   * @param {boolean=} [options.once = false]
   * @returns {Buzzer}
   */
  on(event, options) {
    this._emitter.on(event, options);
    return this;
  }
  
  /**
   * Method to un-subscribe from an event.
   * @param {string} event
   * @param {function} handler
   * @param {object=} target
   * @returns {Buzzer}
   */
  off(event, handler, target) {
    this._emitter.off(event, handler, target);
    return this;
  }
  
  /**
   * Fires an event passing the sound and other optional arguments.
   * @param {string} event
   * @param {...*} args
   * @returns {Buzzer}
   * @private
   */
  _fire(event, ...args) {
    this._emitter.fire(event, ...args, this);
    return this;
  }
}

const buzzer = new Buzzer();

export { BuzzerState, buzzer as default };
