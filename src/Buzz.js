import engine, { EngineEvents, EngineState, ErrorType } from './Engine';
import Queue from './Queue';
import utility from './Utility';
import emitter from './Emitter';
import Sound from './Sound';
import DownloadStatus from './DownloadStatus';

/**
 * Enum that represents the different states of a buzz (sound group).
 * @enum {string}
 */
const BuzzState = {
  Ready: 'ready',
  Destroyed: 'destroyed'
};

/**
 * Enum that represents the different events fired by a buzz.
 * @enum {string}
 */
const BuzzEvents = {
  Load: 'load',
  LoadProgress: 'loadprogress',
  UnLoad: 'unload',
  PlayStart: 'playstart',
  PlayEnd: 'playend',
  Pause: 'pause',
  Stop: 'stop',
  Volume: 'volume',
  Mute: 'mute',
  Seek: 'seek',
  Rate: 'rate',
  FadeStart: 'fadestart',
  FadeEnd: 'fadeend',
  FadeStop: 'fadestop',
  Error: 'error',
  Destroy: 'destroy'
};

/**
 * Enum that represents the different states occurs while loading a sound.
 * @enum {string}
 */
const LoadState = {
  NotLoaded: 'notloaded',
  Loading: 'loading',
  Loaded: 'loaded'
};

/**
 * A wrapper class that simplifies dealing with group of sounds.
 */
class Buzz {

  /**
   * Unique id.
   * @type {number}
   * @private
   */
  _id = -1;

  /**
   * Represents the source of the sound. The source can be an url or base64 string.
   * @type {*}
   * @private
   */
  _src = null;

  /**
   * The formats of the passed audio sources.
   * @type {Array<string>}
   * @private
   */
  _format = [];

  /**
   * The sprite definition.
   * @type {object}
   * @private
   */
  _sprite = null;

  /**
   * The current volume of the sound. Should be from 0.0 to 1.0.
   * @type {number}
   * @private
   */
  _volume = 1.0;

  /**
   * The current rate of the playback. Should be from 0.5 to 5.
   * @type {number}
   * @private
   */
  _rate = 1;

  /**
   * True if the sound is currently muted.
   * @type {boolean}
   * @private
   */
  _muted = false;

  /**
   * True if the sound should play repeatedly.
   * @type {boolean}
   * @private
   */
  _loop = false;

  /**
   * True to pre-loaded the sound on construction.
   * @type {boolean}
   * @private
   */
  _preload = false;

  /**
   * True to auto-play the sound on construction.
   * @type {boolean}
   * @private
   */
  _autoplay = false;

  /**
   * True to use HTML5 audio node.
   * @type {boolean}
   * @private
   */
  _stream = false;

  /**
   * Duration of the playback in seconds.
   * @type {number}
   * @private
   */
  _duration = 0;

  /**
   * The best compatible source in the audio sources passed.
   * @type {string|null}
   * @private
   */
  _compatibleSrc = null;

  /**
   * Represents the different states that occurs while loading the sound.
   * @type {LoadState}
   * @private
   */
  _loadState = LoadState.NotLoaded;

  /**
   * Represents the state of this group.
   * @type {BuzzState}
   * @private
   */
  _state = BuzzState.Ready;

  /**
   * The action queue.
   * @type {Queue}
   * @private
   */
  _queue = null;

  /**
   * The audio engine.
   * @type {Engine}
   * @private
   */
  _engine = null;

  /**
   * Web API's audio context.
   * @type {AudioContext}
   * @private
   */
  _context = null;

  /**
   * The group's gain node.
   * @type {GainNode}
   * @private
   */
  _gainNode = null;

  /**
   * True if the group is currently fading.
   * @type {boolean}
   * @private
   */
  _fading = false;

  /**
   * The timer that runs function after the fading is complete.
   * @type {number|null}
   * @private
   */
  _fadeTimer = null;

  /**
   * Number of audio resource loading calls in progress.
   * @type {number}
   * @private
   */
  _noOfLoadCalls = 0;

  /**
   * Array of sounds belongs to this group.
   * @type {Array}
   * @private
   */
  _soundsArray = [];

  /**
   * Initializes the internal properties.
   * @param {string|Array<string>|object} args The input parameters of this sound group.
   * @param {string} [args.id] The unique id of the sound.
   * @param {string|string[]} args.src Single or array of audio urls/base64 strings.
   * @param {number} [args.volume = 1.0] The initial volume of the sound. Should be from 0.0 to 1.0.
   * @param {number} [args.rate = 1] The initial playback rate of the sound. Should be from 0.5 to 5.0.
   * @param {boolean} [args.loop = false] True to play the sound repeatedly.
   * @param {boolean} [args.muted = false] True to be muted initially.
   * @param {boolean} [args.preload = false] True to pre-load the sound after construction.
   * @param {boolean} [args.autoplay = false] True to play automatically after construction.
   * @param {boolean} [args.stream = false] True to use HTML5 audio node.
   * @param {string|string[]} [args.format] The file format(s) of the passed audio source(s).
   * @param {object} [args.sprite] The sprite definition.
   * @param {function} [args.onload] Event-handler for the "load" event.
   * @param {function} [args.onloadprogress] Event-handler for the "loadprogress" event (only for non-stream types).
   * @param {function} [args.onunload] Event-handler for the "unload" event.
   * @param {function} [args.onplaystart] Event-handler for the "playstart" event.
   * @param {function} [args.onplayend] Event-handler for the "playend" event.
   * @param {function} [args.onstop] Event-handler for the "stop" event.
   * @param {function} [args.onpause] Event-handler for the "pause" event.
   * @param {function} [args.onmute] Event-handler for the "mute" event.
   * @param {function} [args.onvolume] Event-handler for the "volume" event.
   * @param {function} [args.onrate] Event-handler for the "rate" event.
   * @param {function} [args.onseek] Event-handler for the "seek" event.
   * @param {function} [args.onerror] Event-handler for the "error" event.
   * @param {function} [args.ondestroy] Event-handler for the "destroy" event.
   * @constructor
   */
  constructor(args) {
    this._onLoadProgress = this._onLoadProgress.bind(this);

    // Setup the audio engine.
    this._engine = engine;
    this._engine.setup();

    // If no audio is available throw error.
    if (!this._engine.isAudioAvailable()) {
      this._fire(BuzzEvents.Error, null, { type: ErrorType.NoAudio, error: 'Web Audio is un-available' });
      return this;
    }

    // Store the audio context.
    this._context = this._engine.context();

    // Add the created buzz to the engine and connect the gain nodes.
    this._engine.add(this);
    this._gainNode = this._engine.context().createGain();
    this._gainNode.gain.setValueAtTime(this._muted ? 0 : this._volume, this._context.currentTime);
    this._gainNode.connect(this._engine.masterGain());

    // Subscribe to engine's resume event.
    this._engine.on(EngineEvents.Resume, this._onEngineResume = this._onEngineResume.bind(this));

    if (typeof args === 'string') {
      this._src = [args];
    } else if (Array.isArray(args) && args.length) {
      this._src = args;
    } else if (typeof args === 'object') {
      const {
        id,
        src,
        format,
        sprite,
        volume,
        rate,
        muted,
        loop,
        autoplay,
        stream,
        preload,
        onload,
        onloadprogress,
        onunload,
        onplaystart,
        onplayend,
        onstop,
        onpause,
        onmute,
        onvolume,
        onrate,
        onseek,
        onerror,
        ondestroy
      } = args;

      // Set the passed id or the random one.
      this._id = typeof id === 'number' ? id : utility.id();

      // Set the source.
      if (typeof src === 'string') {
        this._src = [src];
      } else if (Array.isArray(src) && src.length) {
        this._src = src;
      }

      // Set the format.
      if (Array.isArray(format)) {
        this._format = format;
      } else if (typeof format === 'string' && format) {
        this._format = [format];
      }

      // Set other properties.
      typeof sprite === 'object' && (this._sprite = sprite);
      typeof volume === 'number' && volume >= 0 && volume <= 1.0 && (this._volume = volume);
      typeof rate === 'number' && rate >= 0.5 && rate <= 5 && (this._rate = rate);
      typeof muted === 'boolean' && (this._muted = muted);
      typeof loop === 'boolean' && (this._loop = loop);
      typeof autoplay === 'boolean' && (this._autoplay = autoplay);
      typeof stream === 'boolean' && (this._stream = stream);
      typeof preload === 'boolean' && (this._preload = preload);

      // Bind the passed event handlers to events.
      typeof onload === 'function' && this.on(BuzzEvents.Load, onload);
      typeof onloadprogress === 'function' && this.on(BuzzEvents.LoadProgress, onloadprogress);
      typeof onunload === 'function' && this.on(BuzzEvents.UnLoad, onunload);
      typeof onplaystart === 'function' && this.on(BuzzEvents.PlayStart, onplaystart);
      typeof onplayend === 'function' && this.on(BuzzEvents.PlayEnd, onplayend);
      typeof onstop === 'function' && this.on(BuzzEvents.Stop, onstop);
      typeof onpause === 'function' && this.on(BuzzEvents.Pause, onpause);
      typeof onmute === 'function' && this.on(BuzzEvents.Mute, onmute);
      typeof onvolume === 'function' && this.on(BuzzEvents.Volume, onvolume);
      typeof onrate === 'function' && this.on(BuzzEvents.Rate, onrate);
      typeof onseek === 'function' && this.on(BuzzEvents.Seek, onseek);
      typeof onerror === 'function' && this.on(BuzzEvents.Error, onerror);
      typeof ondestroy === 'function' && this.on(BuzzEvents.Destroy, ondestroy);
    }

    // Throw error if source is not passed.
    if (!this._src) {
      throw new Error('You should pass the source for the audio.');
    }

    // Instantiate the dependencies.
    this._queue = new Queue();

    if (this._autoplay) {
      this.play();
    } else if (this._preload) {
      this.load();
    }
  }

  /**
   * Loads the sound to the underlying audio object.
   * @param {number} [soundId] The id of the sound to be loaded (for stream types).
   * @return {Buzz}
   */
  load(soundId) {
    if (soundId) {
      const sound = this.sound(soundId);
      sound && sound.load();
      return this;
    }

    // If the sound is not of stream and the source is loaded or currently loading then return.
    if (!this._stream && (this.isLoaded() || this._loadState === LoadState.Loading)) {
      return this;
    }

    // Set the state to loading.
    this._loadState = LoadState.Loading;

    // Increment the calls which is needed for stream types.
    this._noOfLoadCalls = this._noOfLoadCalls + 1;

    const src = this._compatibleSrc || (this._compatibleSrc = this.getCompatibleSource());

    // Load the audio source.
    const load$ = this._stream ? this._engine.allocateForGroup(src, this._id) : this._engine.load(src, this._onLoadProgress);
    load$.then(downloadResult => {
      this._noOfLoadCalls > 0 && (this._noOfLoadCalls = this._noOfLoadCalls - 1);

      if (this._stream && this._state === BuzzState.Destroyed) {
        this._engine.releaseForGroup(this._compatibleSrc, this._id);
        return;
      }

      if (this._state === BuzzState.Destroyed || this._loadState === LoadState.NotLoaded) {
        return;
      }

      // If loading succeeded,
      // i. Save the result.
      // ii. Set the load state as loaded.
      // iii. Fire the load event.
      // iv. Run the methods that are queued to run after successful load.
      if (downloadResult.status === DownloadStatus.Success) {
        if (this._stream) {
          this._duration = downloadResult.value.duration;
        } else {
          this._buffer = downloadResult.value;
          this._duration = this._buffer.duration;
        }

        this._loadState = LoadState.Loaded;
        this._fire(BuzzEvents.Load, null, downloadResult);

        if (this._engine.state() !== EngineState.Ready) {
          this._queue.remove('after-load');
          return;
        }

        this._queue.run('after-load');

        return;
      }

      this._onLoadFailure(downloadResult.error);
    });

    return this;
  }

  /**
   * Returns the first compatible source based on the passed sources and the format.
   * @return {string}
   */
  getCompatibleSource() {
    // If the user has passed "format", check if it is supported or else retrieve the first supported source from the array.
    return this._format.length ?
      this._src[this._format.indexOf(utility.getSupportedFormat(this._format))] :
      utility.getSupportedSource(this._src);
  }

  /**
   * Plays the passed sound defined in the sprite or the sound that belongs to the passed id.
   * @param {string|number} [soundOrId] The sound name defined in sprite or the sound id.
   * @return {Buzz|number}
   */
  play(soundOrId) {
    const isIdPassed = typeof soundOrId === 'number';

    // If id is passed then get the sound from the engine and play it.
    if (isIdPassed) {
      const sound = this.sound(soundOrId);
      sound && this._play(sound);
      return this;
    }

    const newSoundId = utility.id(),
      playSound = () => {
        const soundArgs = {
          id: newSoundId,
          buffer: this._buffer,
          stream: this._stream,
          audio: this._stream ? this._engine.allocateForSound(this._compatibleSrc, this._id, newSoundId) : null,
          volume: this._volume,
          rate: this._rate,
          muted: this._muted,
          loop: this._loop,
          playEndCallback: () => this._fire(BuzzEvents.PlayEnd, newSoundId),
          destroyCallback: () => {
            this._removeSound(newSoundId);
            this._fire(BuzzEvents.Destroy, newSoundId);
            emitter.clear(newSoundId);
          },
          fadeEndCallback: () => this._fire(BuzzEvents.FadeEnd, newSoundId),
          audioErrorCallback: (sound, err) => {
            this._fire(BuzzEvents.Error, newSoundId, { type: ErrorType.LoadError, error: err });
            sound.destroy();
          },
          loadCallback: () => {
            this._fire(BuzzEvents.Load, newSoundId);
          }
        };

        if (typeof soundOrId === 'string' && this._sprite && this._sprite.hasOwnProperty(soundOrId)) {
          const positions = this._sprite[soundOrId];
          soundArgs.startPos = positions[0];
          soundArgs.endPos = positions[1];
        }

        const newSound = new Sound(soundArgs);
        newSound._gain().connect(this._gainNode);
        this._soundsArray.push(newSound);
        this._play(newSound);
      };

    // If the sound is not yet loaded push an action to the queue to play the sound once it's loaded.
    if (!this.isLoaded()) {
      this._queue.add('after-load', `play-${newSoundId}`, () => playSound());
      this.load();
    } else {
      playSound();
    }

    return newSoundId;
  }

  /**
   * Pauses the sound belongs to the passed id or all the sounds belongs to this group.
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  pause(id) {
    const isGroup = typeof id === 'undefined';
    this._removePlayActions(id);
    isGroup && this.fadeStop();
    this._sounds(id).forEach(sound => sound.pause());
    this._fire(BuzzEvents.Pause, id);

    return this;
  }

  /**
   * Stops the sound belongs to the passed id or all the sounds belongs to this group.
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  stop(id) {
    const isGroup = typeof id === 'undefined';
    this._removePlayActions(id);
    isGroup && this.fadeStop();
    this._sounds(id).forEach(sound => sound.stop());
    this._fire(BuzzEvents.Stop, id);

    return this;
  }

  /**
   * Mutes the sound belongs to the passed id or all the sounds belongs to this group.
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  mute(id) {
    const isGroup = typeof id === 'undefined';

    if (isGroup) {
      this.fadeStop();
      this._gainNode.gain.setValueAtTime(0, this._context.currentTime);
      this._muted = true;
    } else {
      const sound = this.sound(id);
      sound && sound.mute();
    }

    this._fire(BuzzEvents.Mute, id, this._muted);

    return this;
  }

  /**
   * Un-mutes the sound belongs to the passed id or all the sounds belongs to this group.
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  unmute(id) {
    const isGroup = typeof id === 'undefined';

    if (isGroup) {
      this.fadeStop();
      this._gainNode.gain.setValueAtTime(this._volume, this._context.currentTime);
      this._muted = false;
    } else {
      const sound = this.sound(id);
      sound && sound.unmute();
    }

    this._fire(BuzzEvents.Mute, id, this._muted);

    return this;
  }

  /**
   * Gets/sets the volume of the passed sound or the group.
   * @param {number} [volume] Should be from 0.0 to 1.0.
   * @param {number} [id] The sound id.
   * @return {Buzz|number}
   */
  volume(volume, id) {
    const isGroup = typeof id === 'undefined';

    if (typeof volume === 'number' && volume >= 0 && volume <= 1.0) {
      if (isGroup) {
        this.fadeStop();
        this._gainNode.gain.setValueAtTime(this._muted ? 0 : volume, this._context.currentTime);
        this._volume = volume;
      } else {
        const sound = this.sound(id);
        sound && sound.volume(volume);
      }

      this._fire(BuzzEvents.Volume, id, this._volume);
      return this;
    }

    if (!isGroup) {
      const sound = this.sound(id);
      return sound ? sound.volume() : null;
    }

    return this._volume;
  }

  /**
   * Fades the group's or passed sound's volume to the passed value in the passed duration.
   * @param {number} to The destination volume.
   * @param {number} duration The period of fade in seconds.
   * @param {string} [type = linear] The fade type (linear or exponential).
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  fade(to, duration, type = 'linear', id) {
    const isGroup = typeof id === 'undefined';

    if (isGroup && this._fading) {
      return this;
    }

    this._fire(BuzzEvents.FadeStart, id);

    if (isGroup) {
      this._fading = true;

      if (type === 'linear') {
        this._gainNode.gain.linearRampToValueAtTime(to, this._context.currentTime + duration);
      } else {
        this._gainNode.gain.exponentialRampToValueAtTime(to, this._context.currentTime + duration);
      }

      this._fadeTimer = setTimeout(() => {
        this.volume(to);

        clearTimeout(this._fadeTimer);

        this._fadeTimer = null;
        this._fading = false;
        this._fire(BuzzEvents.FadeEnd);
      }, duration * 1000);
    } else {
      const sound = this.sound(id);
      sound && sound.fade(to, duration, type);
    }

    return this;
  }

  /**
   * Stops the group's or passed sound's current running fade.
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  fadeStop(id) {
    const isGroup = typeof id === 'undefined';

    if (isGroup) {
      if (!this._fading) {
        return this;
      }

      this._gainNode.gain.cancelScheduledValues(this._context.currentTime);

      if (this._fadeTimer) {
        clearTimeout(this._fadeTimer);
        this._fadeTimer = null;
      }

      this._fading = false;
    } else {
      const sound = this.sound(id);
      sound && sound.fadeStop();
    }

    this._fire(BuzzEvents.FadeStop, id);

    return this;
  }

  /**
   * Gets/sets the rate of the passed sound or the group.
   * @param {number} [rate] Should be from 0.5 to 5.0.
   * @param {number} [id] The sound id.
   * @return {Buzz|number}
   */
  rate(rate, id) {
    const isGroup = typeof id === 'undefined';

    if (typeof rate === 'number' && rate >= 0.5 && rate <= 5) {
      this._sounds(id).forEach(sound => sound.rate(rate));
      isGroup && (this._rate = rate);
      this._fire(BuzzEvents.Rate, id, this._rate);
      return this;
    }

    if (!isGroup) {
      const sound = this.sound(id);
      return sound ? sound.rate() : null;
    }

    return this._rate;
  }

  /**
   * Gets/sets the current playback position of the sound.
   * @param {number} id The sound id
   * @param {number} [seek] The seek position.
   * @return {Buzz|number}
   */
  seek(id, seek) {
    if (!id) {
      return this;
    }

    const sound = this.sound(id);

    if (!sound) {
      return this;
    }

    if (typeof seek === 'number') {
      // If the audio source is not yet loaded push an item to the queue to seek after the sound is loaded
      // and load the sound.
      if (!this.isLoaded()) {
        this._queue.add('after-load', `seek-${id}`, () => this.seek(id, seek));
        this.load();
        return this;
      }

      sound.seek(seek);
      this._fire(BuzzEvents.Seek, id, seek);
      return this;
    }

    return sound.seek();
  }

  /**
   * Gets/sets the looping behavior of a sound or the group.
   * @param {boolean} [loop] True to loop the sound.
   * @param {number} [id] The sound id.
   * @return {Buzz|boolean}
   */
  loop(loop, id) {
    const isGroup = typeof id === 'undefined';

    if (typeof loop === 'boolean') {
      this._sounds(id).forEach(sound => sound.loop(loop));
      isGroup && (this._loop = loop);
      return this;
    }

    if (!isGroup) {
      const sound = this.sound(id);
      return sound ? sound.loop() : null;
    }

    return this._loop;
  }

  /**
   * Returns true if the passed sound is playing.
   * @param {number} id The sound id.
   * @return {boolean}
   */
  playing(id) {
    const sound = this.sound(id);
    return sound ? sound.isPlaying() : null;
  }

  /**
   * Returns true if the passed sound is muted or the group is muted.
   * @param {number} [id] The sound id.
   * @return {boolean}
   */
  muted(id) {
    if (typeof id === 'undefined') {
      return this._muted;
    }

    const sound = this.sound(id);
    return sound ? sound.muted() : null;
  }

  /**
   * Returns the state of the passed sound or the group.
   * @param {number} [id] The sound id.
   * @return {BuzzState|SoundState}
   */
  state(id) {
    if (typeof id === 'undefined') {
      return this._state;
    }

    const sound = this.sound(id);
    return sound ? sound.state() : null;
  }

  /**
   * Returns the duration of the passed sound or the total duration of the sound.
   * @param {number} [id] The sound id.
   * @return {number}
   */
  duration(id) {
    if (typeof id === 'undefined') {
      return this._duration;
    }

    const sound = this.sound(id);
    return sound ? sound.duration() : null;
  }

  /**
   * Unloads the loaded audio buffer or free audio nodes.
   * @return {Buzz}
   */
  unload() {
    this._queue.remove('after-load');
    this._stream && this._engine.releaseForGroup(this._compatibleSrc, this._id);
    this._buffer = null;
    this._stream && (this._duration = 0);
    this._loadState = LoadState.NotLoaded;
    this._noOfLoadCalls = 0;
    this._fire(BuzzEvents.UnLoad);
    return this;
  }

  /**
   * Stops and destroys all the sounds belongs to this group and release other dependencies.
   * @param {number} [soundId] The sound id.
   */
  destroy(soundId) {
    if (soundId) {
      const sound = this.sound(soundId);
      sound && sound.destroy();
      return;
    }

    if (this._state === BuzzState.Destroyed) {
      return;
    }

    this.stop();
    this._soundsArray.forEach(sound => sound.destroy());
    this._queue.clear();
    this._engine.off(EngineEvents.Resume, this._onEngineResume);
    this._engine.releaseForGroup(this._compatibleSrc, this._id);
    this._gainNode.disconnect();
    this._engine.remove(this);

    this._soundsArray = [];
    this._buffer = null;
    this._queue = null;
    this._context = null;
    this._engine = null;
    this._gainNode = null;
    this._state = BuzzState.Destroyed;

    this._fire(BuzzEvents.Destroy);

    emitter.clear(this._id);
  }

  /**
   * Makes the passed sound persistent that means it can't be auto-destroyed.
   * @param {number} soundId The sound id.
   */
  persist(soundId) {
    const sound = this.sound(soundId);
    sound && sound.persist();
  }

  /**
   * Makes the passed sound un-persistent that means it can be auto-destroyed.
   * @param {number} soundId The sound id.
   */
  abandon(soundId) {
    const sound = this.sound(soundId);
    sound && sound.abandon();
  }

  /**
   * Removes the inactive sounds.
   */
  free() {
    const now = new Date();

    this._soundsArray = this._soundsArray.filter(sound => {
      const inactiveDurationInSeconds = (now - sound.lastPlayed()) / 1000;

      if (sound.isPersistent() ||
        sound.isPlaying() ||
        sound.isPaused() ||
        inactiveDurationInSeconds < this._engine.inactiveTime() * 60) {
        return true;
      }

      sound.destroy();
      return false;
    });
  }

  /**
   * Subscribes to an event for the sound or the group.
   * @param {string} eventName The event name.
   * @param {function} handler The event handler.
   * @param {boolean} [once = false] True for one-time event handling.
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  on(eventName, handler, once = false, id) {
    emitter.on(id || this._id, eventName, handler, once);
    return this;
  }

  /**
   * Un-subscribes from an event for the sound or the group.
   * @param {string} eventName The event name.
   * @param {function} handler The event handler.
   * @param {number} [id] The sound id.
   * @return {Buzz}
   */
  off(eventName, handler, id) {
    emitter.off(id || this._id, eventName, handler);
    return this;
  }

  /**
   * Returns the unique id of the sound.
   * @return {number}
   */
  id() {
    return this._id;
  }

  /**
   * Returns the gain node.
   * @return {GainNode}
   */
  gain() {
    return this._gainNode;
  }

  /**
   * Returns the audio resource loading status.
   * @return {LoadState}
   */
  loadState() {
    return this._loadState;
  }

  /**
   * Returns true if the audio source is loaded.
   * @return {boolean}
   */
  isLoaded() {
    return this._stream ? this._engine.hasFreeNodes(this._compatibleSrc, this._id) : this._loadState === LoadState.Loaded;
  }

  /**
   * Returns the sound for the passed id.
   * @param {number} id The sound id.
   * @return {Sound}
   */
  sound(id) {
    return this._soundsArray.find(x => x.id() === id);
  }

  /**
   * Returns all the sounds.
   * @return {Array<Sound>}
   */
  sounds() {
    return this._soundsArray;
  }

  /**
   * Returns true if the passed sound exists.
   * @param {number} id The sound id.
   * @return {boolean}
   */
  alive(id) {
    return Boolean(this.sound(id));
  }

  /**
   * Called on failure of loading audio source.
   * @param {*} error The audio source load error.
   * @private
   */
  _onLoadFailure(error) {
    // Remove the queued actions from this class that are supposed to run after load.
    this._noOfLoadCalls === 0 && this._queue.remove('after-load');

    // Set the load state back to not loaded.
    this._loadState = LoadState.NotLoaded;

    // Fire the error event.
    this._fire(BuzzEvents.Error, null, { type: ErrorType.LoadError, error: error });
  }

  /**
   * The resource load progress handler.
   * @param {object} evt The progress data.
   * @private
   */
  _onLoadProgress(evt) {
    this._fire(BuzzEvents.LoadProgress, null, evt.percentageDownloaded);
  }

  /**
   * Whenever the engine resume run the actions queued for it.
   * @private
   */
  _onEngineResume() {
    this._queue.run('after-engine-resume');
  }

  /**
   * Checks the engine state and plays the passed sound.
   * @param {Sound} sound The sound.
   * @private
   */
  _play(sound) {
    if (this._engine.state() === EngineState.Destroying || this._engine.state() === EngineState.Done) {
      this._fire(BuzzEvents.Error, null, { type: ErrorType.PlayError, error: 'The engine is stopping/stopped' });
      return;
    }

    if (this._engine.state() === EngineState.NoAudio) {
      this._fire(BuzzEvents.Error, null, { type: ErrorType.NoAudio, error: 'Web Audio is un-available' });
      return;
    }

    const playAndFire = () => {
      sound.play();
      this._fire(BuzzEvents.PlayStart, sound.id());
    };

    if ([EngineState.Suspending, EngineState.Suspended, EngineState.Resuming].indexOf(this._engine.state()) > -1) {
      this._queue.add('after-engine-resume', `sound-${sound.id()}`, () => playAndFire());
      this._engine.state() !== EngineState.Resuming && this._engine.resume();
      return;
    }

    playAndFire();
  }

  /**
   * Remove the play actions queued from the queue.
   * @param {number} [id] The sound id.
   * @private
   */
  _removePlayActions(id) {
    this._queue.remove('after-load', id ? `play-${id}` : null);
    this._queue.remove('after-engine-resume', id ? `sound-${id}` : null);
  }

  /**
   * Returns the sound for the passed id or all the sounds belong to this group.
   * @param {number} [id] The sound id.
   * @return {Array<Sound>}
   * @private
   */
  _sounds(id) {
    if (typeof id === 'number') {
      const sound = this._soundsArray.find(x => x.id() === id);
      return sound ? [sound] : [];
    }

    return this._soundsArray;
  }

  /**
   * Removes the passed sound from the array.
   * @param {number|Sound} sound The sound.
   * @private
   */
  _removeSound(sound) {
    if (typeof sound === 'number') {
      this._soundsArray = this._soundsArray.filter(x => x.id() === sound);
    }

    this._soundsArray.splice(this._soundsArray.indexOf(sound), 1);
  }

  /**
   * Fires an event of group or sound.
   * @param {string} eventName The event name.
   * @param {number} [id] The sound id.
   * @param {...*} args The arguments that to be passed to handler.
   * @return {Buzz}
   * @private
   */
  _fire(eventName, id, ...args) {
    if (id) {
      emitter.fire(id, eventName, ...args, this.sound(id), this);
      emitter.fire(this._id, eventName, ...args, this.sound(id), this);
    } else {
      emitter.fire(this._id, eventName, ...args, this);
    }

    return this;
  }
}

const $buzz = args => new Buzz(args);
[
  'setup',
  'load',
  'loadMedia',
  'unload',
  'unloadMedia',
  'mute',
  'unmute',
  'volume',
  'stop',
  'suspend',
  'resume',
  'terminate',
  'muted',
  'state',
  'context',
  'masterGain',
  'isAudioAvailable',
  'bufferLoader',
  'mediaLoader',
  'on',
  'off'
].forEach(method => {
  $buzz[method] = function () {
    const result = engine[method](...arguments);
    return result === engine ? $buzz : result;
  };
});

module.exports = $buzz;
