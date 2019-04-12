import Loader from './Loader';
import emitter from './Emitter';
import Heap from './Heap';
import Queue from './Queue';
import utility from './Utility';
import Sound from './Sound';

/**
 * Enum that represents the different type of errors thrown by Engine and Buzzes.
 * @enum {string}
 */
const ErrorType = {
  NoAudio: 'no-audio',
  LoadError: 'load',
  PlayError: 'play',
  EngineError: 'engine'
};

/**
 * Represents the different states of the audio engine.
 * @enum {string}
 */
const EngineState = {
  NotReady: 'notready',
  Ready: 'ready',
  Suspending: 'suspending',
  Suspended: 'suspended',
  Resuming: 'resuming',
  Destroying: 'destroying',
  Done: 'done',
  NoAudio: 'no-audio'
};

/**
 * Enum that represents the different events by engine.
 * @enum {string}
 */
const EngineEvents = {
  Add: 'add',
  Remove: 'remove',
  Volume: 'volume',
  Mute: 'mute',
  Pause: 'pause',
  Stop: 'stop',
  Suspend: 'suspend',
  Resume: 'resume',
  Error: 'error',
  Done: 'done'
};

/**
 * Array of event names.
 * @type {string[]}
 */
const userInputEventNames = [
  'click',
  'contextmenu',
  'auxclick',
  'dblclick',
  'mousedown',
  'mouseup',
  'pointerup',
  'touchend',
  'keydown',
  'keyup'
];

/**
 * The audio engine that orchestrates all the sounds.
 * @class
 */
class Engine {

  /**
   * Unique id of the engine.
   * @type {number}
   * @private
   */
  _id = utility.id();

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
   * The heap clean-up period.
   * @type {number}
   * @private
   */
  _cleanUpInterval = 5;

  /**
   * Auto-enables audio in first user interaction.
   * @type {boolean}
   * @private
   */
  _autoEnable = true;

  /**
   * The clean-up interval id.
   * @type {number|null}
   * @private
   */
  _intervalId = null;

  /**
   * True if Web Audio API is available.
   * @type {boolean}
   * @private
   */
  _isAudioAvailable = false;

  /**
   * Represents the current state of the engine.
   * @type {EngineState}
   * @private
   */
  _state = EngineState.NotReady;

  /**
   * The Web Audio API's audio context.
   * @type {AudioContext}
   * @private
   */
  _context = null;

  /**
   * The master gain node.
   * @type {GainNode}
   * @private
   */
  _gainNode = null;

  /**
   * The action queue.
   * @type {Queue}
   * @private
   */
  _queue = null;

  /**
   * The sound heap.
   * @type {Heap}
   * @private
   */
  _heap = null;

  /**
   * Loader - the component that loads audio buffers with audio data.
   * @type {Loader}
   * @private
   */
  _loader = null;

  /**
   * Instantiates the heap and action queue.
   * @constructor
   */
  constructor() {
    this._heap = new Heap();
    this._queue = new Queue();
    this._resumeAndRemoveListeners = this._resumeAndRemoveListeners.bind(this);
  }

  /**
   * Instantiate the audio context and other dependencies.
   * @param {object} [args] Input parameters object.
   * @param {number} [args.volume = 1.0] The global volume of the sound engine.
   * @param {boolean} [args.muted = false] Stay muted initially or not.
   * @param {number} [args.cleanUpInterval = 5] The heap clean-up interval period in minutes.
   * @param {boolean} [args.autoEnable = true] Auto-enables audio in first user interaction.
   * @param {function} [args.onadd] Event-handler for the "add" event.
   * @param {function} [args.onremove] Event-handler for the "remove" event.
   * @param {function} [args.onstop] Event-handler for the "stop" event.
   * @param {function} [args.onpause] Event-handler for the "pause" event.
   * @param {function} [args.onmute] Event-handler for the "mute" event.
   * @param {function} [args.onvolume] Event-handler for the "volume" event.
   * @param {function} [args.onsuspend] Event-handler for the "suspend" event.
   * @param {function} [args.onresume] Event-handler for the "resume" event.
   * @param {function} [args.onerror] Event-handler for the "error" event.
   * @param {function} [args.ondone] Event-handler for the "done" event.
   * @return {Engine}
   */
  setup(args) {
    // If the setup is already done return.
    if (this._state !== EngineState.NotReady) {
      return this;
    }

    this._context = utility.getContext();

    // Determine the audio stuff available in the current platform and set the flags accordingly.
    this._isAudioAvailable = Boolean(this._context);

    // If no Web Audio and HTML5 audio is available fire an error event.
    if (!this._isAudioAvailable) {
      this._state = EngineState.NoAudio;
      this._fire(EngineEvents.Error, { type: ErrorType.NoAudio, error: 'Web Audio API is not available' });
      return this;
    }

    // Read the input parameters from the options.
    const {
      volume,
      muted,
      cleanUpInterval,
      autoEnable,
      onadd,
      onremove,
      onstop,
      onpause,
      onmute,
      onvolume,
      onsuspend,
      onresume,
      onerror,
      ondone
    } = args || {};

    // Set the properties from the read parameters.
    typeof volume === 'number' && volume >= 0 && volume <= 1.0 && (this._volume = volume);
    typeof muted === 'boolean' && (this._muted = muted);
    typeof cleanUpInterval === 'number' && (this._cleanUpInterval = cleanUpInterval);
    typeof autoEnable === 'boolean' && (this._autoEnable = autoEnable);
    typeof onadd === 'function' && this.on(EngineEvents.Add, onadd);
    typeof onremove === 'function' && this.on(EngineEvents.Remove, onremove);
    typeof onstop === 'function' && this.on(EngineEvents.Stop, onstop);
    typeof onpause === 'function' && this.on(EngineEvents.Pause, onpause);
    typeof onmute === 'function' && this.on(EngineEvents.Mute, onmute);
    typeof onvolume === 'function' && this.on(EngineEvents.Volume, onvolume);
    typeof onsuspend === 'function' && this.on(EngineEvents.Suspend, onsuspend);
    typeof onresume === 'function' && this.on(EngineEvents.Resume, onresume);
    typeof onerror === 'function' && this.on(EngineEvents.Error, onerror);
    typeof ondone === 'function' && this.on(EngineEvents.Done, ondone);

    // Create the buffer loader.
    this._loader = new Loader(this._context);

    // Auto-enable audio in first user interaction.
    // https://developers.google.com/web/updates/2018/11/web-audio-autoplay#moving-forward
    if (this._autoEnable && this._context.state === 'suspended') {
      userInputEventNames.forEach(eventName => document.addEventListener(eventName, this._resumeAndRemoveListeners));
    }

    // Create the audio graph.
    this._gainNode = this._context.createGain();
    this._gainNode.gain.setValueAtTime(this._muted ? 0 : this._volume, this._context.currentTime);
    this._gainNode.connect(this._context.destination);

    this._intervalId = window.setInterval(this._heap.free, this._cleanUpInterval * 60 * 1000);

    this._state = this._context.state !== 'suspended' ? EngineState.Ready : EngineState.Suspended;

    return this;
  }

  /**
   * Loads single or multiple audio resources into audio buffers and returns them.
   * @param {string|string[]} urls Single or array of audio urls.
   * @return {Promise}
   */
  load(urls) {
    return this._loader.load(urls);
  }

  /**
   * Unloads single or multiple loaded audio buffers from cache.
   * @param {string|string[]} [urls] Single or array of audio urls.
   * @return {Engine}
   */
  unload(urls) {
    this._loader.unload(urls);
    return this;
  }

  /**
   * Mutes the engine.
   * @return {Engine}
   */
  mute() {
    // If the engine is already muted return.
    if (this._muted) {
      return this;
    }

    // Set the value of gain node to 0.
    this._gainNode.gain.setValueAtTime(0, this._context.currentTime);

    // Set the muted property true.
    this._muted = true;

    // Fire the "mute" event.
    this._fire(EngineEvents.Mute, this._muted);

    return this;
  }

  /**
   * Un-mutes the engine.
   * @return {Engine}
   */
  unmute() {
    // If the engine is not muted return.
    if (!this._muted) {
      return this;
    }

    // Reset the gain node's value back to volume.
    this._gainNode.gain.setValueAtTime(this._volume, this._context.currentTime);

    // Set the muted property to false.
    this._muted = false;

    // Fire the "mute" event.
    this._fire(EngineEvents.Mute, this._muted);

    return this;
  }

  /**
   * Gets/sets the volume for the audio engine that controls global volume for all sounds.
   * @param {number} [vol] Should be within 0.0 to 1.0.
   * @return {Engine|number}
   */
  volume(vol) {
    // If no parameter is passed then return the current volume.
    if (vol === undefined) {
      return this._volume;
    }

    // If passed volume is not an acceptable value return.
    if (typeof vol !== 'number' || vol < 0 || vol > 1.0) {
      return this;
    }

    // Set the gain's value to the passed volume.
    this._gainNode.gain.setValueAtTime(this._muted ? 0 : vol, this._context.currentTime);

    // Set the volume to the property.
    this._volume = vol;

    // Fire the "volume" event.
    this._fire(EngineEvents.Volume, this._volume);

    return this;
  }

  /**
   * Stops all the currently playing sounds.
   * @return {Engine}
   */
  stop() {
    // Stop all the sounds.
    this._heap.sounds().forEach(sound => sound.stop());

    // Fire the "stop" event.
    this._fire(EngineEvents.Stop);

    return this;
  }

  /**
   * Stops all the playing sounds and suspends the audio context immediately.
   * @return {Engine}
   */
  suspend() {
    // If the context is resuming then suspend after resumed.
    if (this._state === EngineState.Resuming) {
      this._queue.add('after-resume', 'suspend', () => this.suspend());
      return this;
    }

    // If the state is not ready return.
    if (this._state !== EngineState.Ready) {
      return this;
    }

    // Stop all the playing sounds.
    this.stop();

    // Set the state to suspending.
    this._state = EngineState.Suspending;

    // Suspend the Audio Context.
    this._context.suspend().then(() => {
      this._state = EngineState.Suspended;
      this._queue.run('after-suspend');
      this._fire(EngineEvents.Suspend);
    });

    return this;
  }

  /**
   * Resumes the audio context from the suspended mode.
   * @return {Engine}
   */
  resume() {
    // If the context is suspending then resume after suspended.
    if (this._state === EngineState.Suspending) {
      this._queue.add('after-suspend', 'resume', () => this.resume());
      return this;
    }

    if (this._state !== EngineState.Suspended) {
      return this;
    }

    this._state = EngineState.Resuming;

    this._context.resume().then(() => {
      this._state = EngineState.Ready;
      this._queue.run('after-resume');
      this._fire(EngineEvents.Resume);
    });

    return this;
  }

  /**
   * Shuts down the engine.
   * @return {Engine}
   */
  terminate() {
    if (this._state === EngineState.Done || this._state === EngineState.Destroying) {
      return this;
    }

    const cleanUp = () => {
      // Un-listen from user input events.
      userInputEventNames.forEach(eventName => document.addEventListener(eventName, this._resumeAndRemoveListeners));

      // Stop the timer.
      this._intervalId && window.clearInterval(this._intervalId);
      this._intervalId = null;

      // Destroy the heap.
      this._heap.destroy();
      this._heap = null;

      // Clear the cache and remove the loader.
      if (this._loader) {
        this._loader.dispose();
        this._loader = null;
      }

      this._context = null;
      this._queue.clear();
      this._queue = null;
      this._state = EngineState.Done;

      // Fire the "done" event.
      this._fire(EngineEvents.Done);

      emitter.clear(this._id);
    };

    // Close the context.
    if (this._context) {
      if (this._state === EngineState.Suspending) {
        this._queue.remove('after-suspend');
        this._queue.add('after-suspend', 'destroy', () => this.terminate());
        return this;
      } else if (this._state === EngineState.Resuming) {
        this._queue.remove('after-resume');
        this._queue.add('after-resume', 'destroy', () => this.terminate());
        return this;
      }

      this._state = EngineState.Destroying;
      this._context && this._context.close().then(() => cleanUp());
    } else {
      this._state = EngineState.Destroying;
      cleanUp();
    }

    return this;
  }

  /**
   * Subscribes to an event.
   * @param {string} eventName Name of the event.
   * @param {function} handler The event-handler function.
   * @param {boolean} [once = false] Is it one-time subscription or not.
   * @return {Engine}
   */
  on(eventName, handler, once = false) {
    emitter.on(this._id, eventName, handler, once);
    return this;
  }

  /**
   * Un-subscribes from an event.
   * @param {string} eventName The event name.
   * @param {function} [handler] The handler function.
   * @return {Engine}
   */
  off(eventName, handler) {
    emitter.off(this._id, eventName, handler);
    return this;
  }

  /**
   * Returns the existing sound in heap or create a new one and return.
   * @param {number|string} idOrUrl The sound id or audio url/base64 string.
   * @param {number} [groupId] The group id.
   * @param {object} [args] The sound creation arguments.
   * @return {Sound}
   */
  sound(idOrUrl, groupId, args) {
    if (typeof idOrUrl === 'number') {
      return this._heap.sound(idOrUrl);
    }

    const sound = new Sound(args);
    this._heap.add(idOrUrl, groupId, sound);
    sound._gain().connect(this._gainNode);

    return sound;
  }

  /**
   * Returns the sounds belongs to a group or all the sounds from the heap.
   * @param {number} [groupId] The group id.
   * @return {Array<Sound>}
   */
  sounds(groupId) {
    return this._heap.sounds(groupId);
  }

  /**
   * Destroys the sounds belong to the passed group.
   * @param {boolean} idle True to destroy only the idle sounds.
   * @param {number} groupId The group id.
   * @return {Engine}
   */
  free(idle, groupId) {
    this._heap.free(idle, groupId);
    return this;
  }

  /**
   * Returns whether the engine is currently muted or not.
   * @return {boolean}
   */
  muted() {
    return this._muted;
  }

  /**
   * Returns the state of the engine.
   * @return {EngineState}
   */
  state() {
    return this._state;
  }

  /**
   * Returns the created audio context.
   * @return {AudioContext}
   */
  context() {
    return this._context;
  }

  /**
   * Returns true if Web Audio API is available.
   * @return {boolean}
   */
  isAudioAvailable() {
    return this._isAudioAvailable;
  }

  /**
   * Fires an event of engine.
   * @param {string} eventName The event name.
   * @param {...*} args The arguments that to be passed to handler.
   * @return {Engine}
   * @private
   */
  _fire(eventName, ...args) {
    emitter.fire(this._id, eventName, ...args, this);
    return this;
  }

  /**
   * Resume the context and un-listen from user input events.
   * @private
   */
  _resumeAndRemoveListeners() {
    this.resume();
    userInputEventNames.forEach(eventName => document.addEventListener(eventName, this._resumeAndRemoveListeners));
  }
}

const engine = new Engine();
export { engine as default, EngineState, EngineEvents, ErrorType };
