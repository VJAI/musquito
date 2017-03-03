import {DownloadStatus} from '../util/BufferLoader';
import codecAid from '../util/CodecAid';
import buzzer from './Buzzer';
import EventEmitter from '../util/EventEmitter';

/**
 * Enum that represents the different states of a sound.
 * @enum {number}
 */
const BuzzState = {
  Constructed: 0,
  Loading: 1,
  Ready: 2,
  Playing: 3,
  Paused: 4,
  Error: 5
};

/**
 * Enum that represents the different errors thrown by a Buzz object.
 * @enum {number}
 */
const ErrorType = {
  LoadError: 1
};

/**
 * Represents a single sound.
 * @class
 */
class Buzz {

  /**
   * @param {object} args
   * @param {string=} args.id An unique id for the sound.
   * @param {string} args.src The source of the audio file.
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
   * @constructor
   */
  constructor(args) {
    let options = typeof args === 'string' ? {src: args} : args || {};

    if (!options.src && !(options.sprite && options.sprite.src)) {
      throw new Error('You should pass the source of the audio');
    }

    if(!codecAid.isFileSupported(options.src || options.sprite.src)) {
      throw new Error('The audio formats you passed are not supported.');
    }

    this._id = options.id || Math.round(Date.now() * Math.random());
    this._src = options.src || options.sprite.src;
    this._sprite = options.sprite;
    this._volume = options.volume || 1.0;
    this._muted = options.muted || false;
    this._loop = options.loop || false;
    this._preload = options.preload || false;
    this._autoplay = options.autoplay || false;

    const events = ['load', 'error', 'playstart', 'playend', 'stop', 'pause', 'mute'];
    this._emitter = new EventEmitter(events);
    events.forEach(event => options[`on${event}`] && this.on(event, options[`on${event}`]));

    this._buffer = null;
    this._bufferSource = null;
    this._endTimer = null;
    this._duration = 0;
    this._startedAt = 0;
    this._elapsed = 0;
    this._spriteSound = null;

    buzzer.setup(null);

    // Create the simple audio graph.
    this._context = buzzer.context();
    this._gainNode = this._context.createGain();
    this._gainNode.connect(buzzer.gain());
    this._gainNode.gain.value = this._volume;

    this._isLoaded = false;
    this._state = BuzzState.Constructed;

    if (this._autoplay) {
      this.play();
      return;
    }

    if (this._preload) {
      this.load();
    }
  }

  /**
   * Load the sound into an audio buffer.
   * Fires 'load' event on successful load and 'error' event on failure.
   * @returns {Buzz}
   */
  load() {
    // If the buffer is already loaded return without reloading again.
    if(this._isLoaded) {
      return this;
    }

    // Set the state to "Loading" to avoid multiple times loading the buffer.
    this._state = BuzzState.Loading;

    buzzer.load(this._src).then(downloadResult => {
      if (downloadResult.status === DownloadStatus.Success) {
        this._buffer = downloadResult.value;
        this._duration = this._buffer.duration;
        this._isLoaded = true;
        this._state = BuzzState.Ready;
        this._fire('load', downloadResult);
        return;
      }

      this._removePlayHandler();
      this._state = BuzzState.Error;
      this._fire('error', { type: ErrorType.LoadError, error: downloadResult.error });
    });

    return this;
  }

  /**
   * Plays the sound.
   * Fires 'playstart' event before playing and 'playend' event after the sound is played.
   * @param {string?} sound
   * @returns {Buzz}
   */
  play(sound) {
    // If the sound is already in "Playing" state then it's not allowed to play again.
    if (this._state === BuzzState.Playing) {
      return this;
    }

    this._spriteSound = sound;

    // If the sound is already loaded start playing else load and then play.
    if (this._isLoaded) {
      return this._play(sound);
    } else {
      this.on('load', this._play, true);
      this.load();
    }

    return this;
  }

  _play() {
    let offset = this._elapsed;
    let duration = this._duration;

    // If we are gonna play a sound in sprite calculate the duration and also check if the offset is within that
    // sound boundaries and if not reset to the starting point.
    if(typeof this._spriteSound !== 'undefined' && this._sprite && this._sprite.map[this._spriteSound]) {
      const startEnd = this._sprite.map[this._spriteSound], soundStart = startEnd[0], soundEnd = startEnd[1];
      duration = soundEnd - soundStart;

      if(offset < soundStart || offset > soundEnd) {
        offset = soundStart;
      }
    }

    this._clearEndTimer();
    this._bufferSource = this._context.createBufferSource();
    this._bufferSource.buffer = this._buffer;
    this._bufferSource.connect(this._gainNode);
    this._bufferSource.start(0, offset);
    this._startedAt = this._context.currentTime;
    this._endTimer = setTimeout(this._playEnd.bind(this), duration * 1000);
    this._state = BuzzState.Playing;
    this._fire('playstart');

    return this;
  }

  _playEnd() {
    this._reset();
    this._state = BuzzState.Ready;
    this._fire('playend');
  }

  _removePlayHandler() {
    this.off('load', this._play);
  }

  _clearEndTimer() {
    if (this._endTimer) {
      clearTimeout(this._endTimer);
      this._endTimer = null;
    }
  }

  _reset() {
    if(this._bufferSource) {
      this._bufferSource.disconnect();
      this._bufferSource.stop(0);
      this._bufferSource = null;
    }

    this._startedAt = 0;
    this._elapsed = 0;
    this._clearEndTimer();
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {Buzz}
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
   * Pause the playing sound.
   * @returns {Buzz}
   */
  pause() {
    // Remove the "play" event handler from queue if there is one.
    this._removePlayHandler();

    // We can pause the sound only if it is "playing" state.
    if (this._state !== BuzzState.Playing) {
      return this;
    }

    const startedAt = this._startedAt;
    this._reset();
    this._elapsed += this._context.currentTime - startedAt;
    this._state = BuzzState.Paused;
    this._fire('pause');

    return this;
  }

  /**
   * Mute the sound.
   * @returns {Buzz}
   */
  mute() {
    if (this._muted) {
      return this;
    }

    this._gainNode && (this._gainNode.gain.value = 0);
    this._muted = true;

    return this;
  }

  /**
   * Unmute the sound.
   * @returns {Buzz}
   */
  unmute() {
    if (!this._muted) {
      return this;
    }

    this._gainNode && (this._gainNode.gain.value = this._volume);
    this._muted = false;

    return this;
  }

  /**
   * Set/get the volume.
   * @param {number=} vol
   * @returns {Buzz|number}
   */
  volume(vol) {
    if (typeof vol === 'undefined') {
      return this._volume;
    }

    var volume = parseFloat(vol);

    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return this;
    }

    this._volume = volume;
    this._gainNode && (this._gainNode.gain.value = this._volume);

    return this;
  }

  /**
   * Returns whether sound is muted or not.
   * @returns {boolean}
   */
  muted() {
    return this._muted;
  }

  /**
   * Returns the state of the sound.
   * @returns {number}
   */
  state() {
    return this._state;
  }

  /**
   * Returns the duration of the sound.
   * @returns {number}
   */
  duration() {
    return this._duration;
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event
   * @param {function} fn
   * @param {boolean} [once = false]
   * @returns {Buzz}
   */
  on(event, fn, once) {
    this._emitter.on(event, fn, once);
    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event
   * @param {function} fn
   * @returns {Buzz}
   */
  off(event, fn) {
    this._emitter.off(event, fn);
    return this;
  }

  /**
   * Method to subscribe to an event only once.
   * @param {string} event
   * @param {function} fn
   * @returns {Buzz}
   */
  once(event, fn) {
    this._emitter.once(event, fn);
    return this;
  }

  /**
   * Fires an event passing the sound and other optional arguments.
   * @param {string} event
   * @param {object=} args
   * @returns {Buzz}
   * @private
   */
  _fire(event, args) {
    this._emitter.fire(event, args);
    return this;
  }
}

export {BuzzState, ErrorType, Buzz as default};
