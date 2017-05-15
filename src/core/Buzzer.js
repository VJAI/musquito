import codecAid from '../util/CodecAid';
import BufferLoader from '../util/BufferLoader';
import MediaLoader from '../util/MediaLoder';
import EventEmitter from '../util/EventEmitter';
import ErrorType from '../util/ErrorType';
import mobileAudioEnabler from '../util/MobileAudioEnabler';

/**
 * Represents the different states of the audio engine.
 * @enum {number}
 */
const BuzzerState = {
  NotReady: 'notready',
  Idle: 'idle',
  Suspended: 'suspended',
  Closing: 'closing',
  Done: 'done',
  NoAudio: 'no-audio'
};

/**
 * The audio engine that orchestrates all the sounds.
 * @class
 */
class Buzzer {

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
   * True if HTML5 audio is available.
   * @type {boolean}
   * @private
   */
  _isHTML5AudioAvailable = false;

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
   * The supported play ready event in HTML5 audio.
   * @type {string|null}
   * @protected
   */
  _canPlayEvent = null;

  /**
   * True to auto-suspend AudioContext when no sounds are playing.
   * @type {boolean}
   * @private
   */
  _saveEnergy = true;

  /**
   * The duration in minutes the auto-suspend process has to run.
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
  _emitter = null;

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
   * @type {GainNode}
   * @private
   */
  _gainNode = null;

  /**
   * Represents the context type that is available in the running environment.
   * @type {function}
   * @private
   */
  _contextType = null;

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
  _state = BuzzerState.NotReady;

  /**
   * Whether the context is injected from outside or not.
   * @type {boolean}
   * @private
   */
  _isContextInjected = false;

  /**
   * A 1-sample long scratch buffer to clear out the reference to buffer in AudioBufferSourceNodes
   * Ref; http://stackoverflow.com/questions/24119684
   * @type {AudioBuffer}
   * @private
   */
  _scratchBuffer = null;

  /**
   * Instantiate the audio context and other dependencies.
   * @param {object=} args Input parameters object.
   * @param {number=} [args.volume = 1.0] The global volume of the sound engine.
   * @param {boolean=} [args.saveEnergy = false] Whether to auto-suspend the AudioContext to save energy.
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

    // If the setup is already done return.
    if (this._state !== BuzzerState.NotReady) {
      return this;
    }

    const options = args || {}, testAudio = new Audio();

    this._contextType = AudioContext || webkitAudioContext;

    if (this._contextType) {
      this._isWebAudioAvailable = true;
      this._isContextInjected = typeof options.context === 'object';
      this._context = this._isContextInjected ? options.context : new this._contextType();

      try {
        this._context.createMediaElementSource(testAudio);
        this._isMediaSourceAvailable = true;
      } catch (e) {
        this._isMediaSourceAvailable = false;
      }
    }

    if (typeof Audio !== 'undefined') {
      this._isHTML5AudioAvailable = true;
      this._canPlayEvent = testAudio.oncanplaythrough === 'undefined' ? 'canplay' : 'canplaythrough';
    }

    this._isAudioAvailable = this._isWebAudioAvailable || this._isHTML5AudioAvailable;

    // Instantiate the emitter.
    this._emitter = new EventEmitter('error, suspend,resume,done,stop,mute,volume,buzzplaystart,buzzplayend,buzzpause,buzzstop');

    // If no Web Audio and HTML5 audio is available fire an error event.
    if (!this._isAudioAvailable) {
      this._state = BuzzerState.NoAudio;
      this._fire('error', { type: ErrorType.NoAudio, error: 'No audio support is available' });
      return this;
    }

    // Set the properties from the passed options.
    typeof options.volume === 'number' && options.volume >= 0 && options.volume <= 1.0 && (this._volume = options.volume);
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

    // Instantiate other dependencies
    this._bufferLoader = new BufferLoader(this._context);
    this._mediaLoader = new MediaLoader();

    // Create the audio graph if web audio is available
    if (this._isWebAudioAvailable) {

      // Auto-enable audio for the mobile devices in the first touch.
      mobileAudioEnabler.enable(this._context);

      // Create the audio graph.
      this._gainNode = this._context.createGain();
      this._gainNode.gain.value = this._volume;
      this._gainNode.connect(this._context.destination);

      this._saveEnergy && setInterval(this.suspend, this._autoSuspendInterval * 60 * 1000);
      this._scratchBuffer = this._context.createBuffer(1, 1, 22050);
    }

    this._state = BuzzerState.Idle;

    return this;
  }

  /**
   * Loads single or multiple audio resources into audio buffers and returns them.
   * @param {string|string[]} urls Single or array of audio urls
   * @return {Promise}
   */
  load(urls) {
    return this._bufferLoader.load(urls);
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
   * Pre-loads HTML5 audio nodes with audio and returns them.
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
   * @param {BaseBuzz} buzz The buzz
   * @return {Buzzer}
   */
  add(buzz) {
    if (this._buzzes[buzz.id()] === undefined) {
      this._buzzes[buzz.id()] = buzz;
    }

    return this;
  }

  /**
   * Removes the added buzz from the object.
   * @param {BaseBuzz} buzz The buzz
   * @return {Buzzer}
   */
  remove(buzz) {
    delete this._buzzes[buzz.id()];
    return this;
  }

  /**
   * Adds the buzz to the internal array for controlling the playback and to the audio graph.
   * @param {BaseBuzz} buzz The buzz object
   * @returns {Buzzer}
   * @private
   */
  _link(buzz) {
    if (buzz._gainNode && this._gainNode) {
      buzz._gainNode.connect(this._gainNode);
    }

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
    this._nonWebAudioBuzzes().forEach(buzz => buzz._setVolume(vol));

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
    this._nonWebAudioBuzzes().forEach(buzz => buzz._muteNode());

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
    this._nonWebAudioBuzzes().forEach(buzz => buzz._unMuteNode());

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
   * Returns the array of buzzes that are not using Web Audio for playing sounds.
   * @return {BaseBuzz[]}
   * @private
   */
  _nonWebAudioBuzzes() {
    return Object.keys(this._buzzes).filter(buzz => !buzz.usingWebAudio());
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
