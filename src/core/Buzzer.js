import codecAid from '../util/CodecAid';
import BufferLoader from '../util/BufferLoader';
import MediaLoader from '../util/MediaLoder';
import EventEmitter from '../util/EventEmitter';

/**
 * Represents the different states of the audio engine.
 * @enum {number}
 */
const BuzzerState = {
  Constructed: 0,
  Ready: 1,
  Suspended: 2,
  Closing: 3,
  Done: 4,
  Error: 5
};

/**
 * The audio engine.
 * @class
 */
class Buzzer {

  /**
   * True to enable auto-suspend and save energy.
   * @type {boolean}
   * @private
   */
  _saveEnergy = true;

  /**
   * The interval in minutes the auto-suspend process has to run.
   * @type {number}
   * @private
   */
  _autoSuspendInterval = 5;

  /**
   * The auto suspend process timer id.
   * @type {number|null}
   * @private
   */
  _autoSuspendIntervalId = null;

  /**
   * The web audio api's audio context.
   * @type {AudioContext}
   * @private
   */
  _context = null;

  /**
   * True if either Web Audio API or HTML5 audio is available.
   * @type {boolean}
   * @private
   */
  _isAudioAvailable = false;

  /**
   * True if Web Audio API is available.
   * @type {boolean}
   * @private
   */
  _isWebAudioAvailable = false;

  /**
   * True if MediaElementAudioSourceNode is available.
   * @type {boolean}
   * @private
   */
  _isMediaSourceAvailable = false;

  /**
   * BufferLoader.
   * @type {BufferLoader}
   * @private
   */
  _bufferLoader = null;

  /**
   * MediaLoader.
   * @type {MediaLoader}
   * @private
   */
  _mediaLoader = null;

  /**
   * EventEmitter.
   * @type {EventEmitter}
   * @private
   */
  _emitter = new EventEmitter('suspend,resume,done,stop,mute,volume,buzzplaystart,buzzplayend,buzzpause,buzzstop');

  /**
   * Dictionary of buzzes that are currently playing.
   * @type {object}
   * @private
   */
  _buzzes = {};

  /**
   * Represents whether the audio engine is currently muted or not.
   * @type {boolean}
   * @private
   */
  _muted = false;

  /**
   * Represents the global volume.
   * @type {number}
   * @private
   */
  _volume = 1.0;

  /**
   * Represents the master gain node.
   * @type {GainNode|null}
   * @private
   */
  _gainNode = null;

  /**
   * Represents the context type that is available in the environment.
   * @private
   */
  _contextType = AudioContext || webkitAudioContext;

  /**
   * Array of buzz events that the engine broadcast.
   * @type {string[]}
   * @private
   */
  _buzzEvents = ['playstart', 'playend', 'pause', 'stop'];

  /**
   * Represents the current state of the engine.
   * @type {BuzzerState}
   * @private
   */
  _state = BuzzerState.Constructed;

  /**
   * Whether the context is injected from outside or not.
   * @type {boolean}
   * @private
   */
  _isContextInjected = false;

  _scratchBuffer = null;

  /**
   * Instantiate audio context and other important objects.
   * Returns true if the setup is success.
   * @param {object=} args Input parameters object.
   * @param {number=} [args.volume = 1.0] The global volume of the sound engine.
   * @param {boolean=} [args.saveEnergy = false] Whether to auto-suspend the engine to save energy.
   * @param {number=} [args.autoSuspendInterval = 5] The auto-suspend interval in minutes.
   * @param {function=} args.onsuspend Event-handler for the "suspend" event.
   * @param {function=} args.onresume Event-handler for the "resume" event.
   * @param {function=} args.ondone Event-handler for the "done" event.
   * @param {function=} args.onstop Event-handler for the "stop" event.
   * @param {function=} args.onmute Event-handler for the "mute" event.
   * @param {function=} args.onvolume Event-handler for the "volume" event.
   * @param {function=} args.onbuzzplaystart Event-handler for the "buzzplaystart" event.
   * @param {function=} args.onbuzzplayend Event-handler for the "buzzplayend" event.
   * @param {function=} args.onbuzzpause Event-handler for the "buzzpause" event.
   * @param {function=} args.onbuzzstop Event-handler for the "buzzstop" event.
   * @param {AudioContext=} args.context The Web API audio context.
   * @returns {Buzzer}
   */
  setup(args) {
    const options = args || {};

    if (this._state === BuzzerState.Ready) {
      return this;
    }

    if (!this._contextType) {
      this._state = BuzzerState.Error;
      throw new Error('Web Audio API is unavailable');
    }

    this._isContextInjected = Boolean(options.context);
    this._context = this._isContextInjected ? options.context : new this._contextType();

    if (typeof options.volume === 'number' && options.volume >= 0 && options.volume <= 1.0) {
      this._volume = options.volume;
    }

    typeof options.saveEnergy === 'boolean' && (this._saveEnergy = options.saveEnergy);
    typeof options.autoSuspendInterval === 'number' && (this._autoSuspendInterval = options.autoSuspendInterval);
    this._emitter = new EventEmitter('suspend,resume,done,stop,mute,volume,buzzplaystart,buzzplayend,buzzpause,buzzstop');
    typeof options.onsuspend === 'function' && this.on('suspend', options.onsuspend);
    typeof options.onresume === 'function' && this.on('resume', options.onresume);
    typeof options.ondone === 'function' && this.on('done', options.ondone);
    typeof options.onstop === 'function' && this.on('stop', options.onstop);
    typeof options.onmute === 'function' && this.on('mute', options.onmute);
    typeof options.onvolume === 'function' && this.on('volume', options.onvolume);
    typeof options.onbuzzplaystart === 'function' && this.on('buzzplaystart', options.onbuzzplaystart);
    typeof options.onbuzzplayend === 'function' && this.on('buzzplayend', options.onbuzzplayend);
    typeof options.onbuzzpause === 'function' && this.on('buzzpause', options.onbuzzpause);
    typeof options.onbuzzstop === 'function' && this.on('buzzstop', options.onbuzzstop);

    this._bufferLoader = new BufferLoader(this._context);
    this._mediaLoader = new MediaLoader();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = this._volume;
    this._gainNode.connect(this._context.destination);
    this._saveEnergy && setInterval(this.suspend, this._autoSuspendInterval * 60 * 1000);
    this._scratchBuffer = this._context.createBuffer(1, 1, 22050);
    this._state = BuzzerState.Ready;
    return this;
  }

  /**
   * Loads single or multiple audio resources into audio buffers.
   * @param {string|string[]} urls Single or array of audio urls
   * @param {boolean} [cache = true] Whether to cache the buffer(s) or not
   * @return {Promise}
   */
  load(urls, cache = true) {
    return this._bufferLoader.load(urls, cache);
  }

  /**
   * Unloads single or multiple loaded audio buffers from cache.
   * @param {string|string[]} urls Single or array of audio urls
   * @return {Buzzer}
   */
  unload(urls) {
    this._bufferLoader.unload(urls);
    return this;
  }

  /**
   * Pre-loads HTML5 audio nodes with audio files.
   * @param {string|string[]} urls Single or array of audio urls
   * @param {string=} id Sound id
   * @return {Promise.<DownloadResult|Array<DownloadResult>>}
   */
  loadMedia(urls, id) {
    return this._mediaLoader.load(urls, id);
  }

  /**
   * Release the pre-loaded HTML audio nodes.
   * @param {string|string[]=} urls Single or array of audio urls
   * @param {string} id Sound id
   * @return {Buzzer}
   */
  unloadMedia(urls, id) {
    this._mediaLoader.unload(urls, id);
    return this;
  }

  /**
   * Adds the passed buzz to the internal object.
   * @param buzz
   * @return {Buzzer}
   */
  add(buzz) {
    if (this._buzzes[buzz.id] === undefined) {
      this._buzzes[buzz.id] = buzz;
    }

    return this;
  }

  /**
   * Removes the added buzz from the object.
   * @param buzz
   * @return {Buzzer}
   */
  remove(buzz) {
    delete this._buzzes[buzz.id];
    return this;
  }

  /**
   * Adds the buzz to the internal array for controlling the playback and to the audio graph.
   * @param {BaseBuzz} buzz The buzz object
   * @returns {Buzzer}
   * @private
   */
  _link(buzz) {
    buzz._gainNode.connect(this._gainNode);

    this._buzzEvents.forEach(event => buzz.on(event, {
      handler: this._fireBuzzEvent,
      target: this,
      args: event
    }));

    return this;
  }

  /**
   * Removes the buzz from the array and the graph.
   * @param {BaseBuzz} buzz The buzz object
   * @returns {Buzzer}
   * @private
   */
  _unlink(buzz) {
    this._buzzEvents.forEach(event => buzz.off(event, this._fireBuzzEvent));

    if (buzz._gainNode) {
      buzz._gainNode.disconnect();
    }

    return this;
  }

  /**
   * Publish the buzz playback events.
   * @param {string} event Event name
   * @param {...*} args The arguments that to be passed to handler
   * @private
   */
  _fireBuzzEvent(event, ...args) {
    this._fire(`buzz${event}`, ...args);
  }

  /**
   * Set/get the volume for the audio engine that controls global volume for all sounds.
   * @param {number=} vol Should be within 0.0 to 1.0
   * @returns {Buzzer|number}
   */
  volume(vol) {
    if (vol === undefined) {
      return this._volume;
    }

    if (typeof vol !== 'number' || vol < 0 || vol > 1.0) {
      return this;
    }

    this._volume = vol;
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
      return this;
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
      return this;
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
    if (this._state === BuzzerState.Suspended) {
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
    if (this._state === BuzzerState.Ready) {
      return this;
    }

    this._fire('resume');
    return this;
  }

  /**
   * Shuts down the engine.
   * @return {Buzzer}
   */
  tearDown() {
    if (this._state !== BuzzerState.Ready || this._state !== BuzzerState.Suspended) {
      return this;
    }

    this._state = BuzzerState.Closing;

    // Destroy all the playing sounds.
    Object.keys(this._buzzes).forEach(buzz => buzz.destroy());

    // Remove the Master Gain node.
    this._gainNode.disconnect();
    this._gainNode = null;

    // Clear the cache and remove the loader.
    this._bufferLoader.unload();
    this._bufferLoader = null;

    // Dispose the MediaLoader.
    this._mediaLoader.dispose();
    this._mediaLoader = null;

    // Close the context.
    if (!this._isContextInjected) {
      this._context.close().then(() => {
        this._context = null;

        this._state = BuzzerState.Done;

        // Fire the "done" event.
        this._fire('done');

        this._emitter.clear();
        this._emitter = null;
      });
    }

    return this;
  }

  /**
   * Returns the created audio context.
   * @returns {AudioContext}
   */
  context() {
    return this._context;
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
   * Returns true if audio is available.
   * @return {boolean}
   */
  isAudioAvailable() {
    return this._isAudioAvailable;
  }

  /**
   * Returns true if Web Audio API is available.
   * @return {boolean}
   */
  isWebAudioAvailable() {
    return this._isWebAudioAvailable;
  }

  /**
   * Returns true if MediaElementAudioSource is available.
   * @return {boolean}
   */
  isMediaSourceAvailable() {
    return this._isMediaSourceAvailable;
  }

  /**
   * Returns the supported audio formats.
   * @return {object}
   */
  supportedFormats() {
    return codecAid.supportedFormats();
  }

  /**
   * Returns a small buffer that can be used to dispose AudioBufferSourceNodes.
   * @return {AudioBuffer}
   */
  scratchBuffer() {
    return this._scratchBuffer;
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event Name of the event
   * @param {function} handler The event-handler function
   * @param {boolean=} [once = false] Is it one-time subscription or not
   * @returns {Buzzer}
   */
  on(event, handler, once = false) {
    this._emitter.on(event, handler, once);
    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event The event name
   * @param {function} handler The handler function
   * @returns {Buzzer}
   */
  off(event, handler) {
    this._emitter.off(event, handler);
    return this;
  }

  /**
   * Fires an event passing the source and other optional arguments.
   * @param {string} event The event name
   * @param {...*} args The arguments that to be passed to handler
   * @returns {Buzzer}
   * @private
   */
  _fire(event, ...args) {
    this._emitter.fire(event, ...args, this);
    return this;
  }
}

const buzzer = new Buzzer();

export { BuzzerState, Buzzer, buzzer as default };
