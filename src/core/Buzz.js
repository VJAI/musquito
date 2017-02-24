import {DownloadStatus} from '../util/BufferLoader';
import codecAid from '../util/CodecAid';
import buzzer from './Buzzer';

/**
 * Enum that represents the different states of a sound.
 * @enum {number}
 */
const BuzzState = {
  Constructed: 0,
  Playing: 1,
  Paused: 2,
  Stopped: 3
};

/**
 * Enum that represents the different states of loading the audio.
 * @enum {number}
 */
const AudioLoadState = {
  NotLoaded: 0,
  Loading: 1,
  Loaded: 2,
  Error: 3
};

/**
 * Enum that represents the different errors thrown by a Buzz object.
 * @enum {number}
 */
const ErrorType = {
  AudioUnAvailable: 1,
  LoadError: 2
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
   * @param {function=} args.onend Event-handler for the "end" event.
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
    this._subscribers = {
      'load': [],
      'error': [],
      'playstart': [],
      'end': [],
      'stop': [],
      'pause': [],
      'mute': []
    };
    Object.keys(this._subscribers).forEach(event => options[`on${event}`] && this.on(event, options[`on${event}`]));

    this._buffer = null;
    this._bufferSource = null;
    this._endTimer = null;
    this._duration = 0;
    this._startedAt = 0;
    this._elapsed = 0;

    buzzer.setup(null);

    this._context = buzzer.context();
    this._gainNode = this._context.createGain();
    this._gainNode.connect(buzzer.gain());
    this._gainNode.gain.value = this._volume;

    this._loadStatus = AudioLoadState.NotLoaded;
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
    // If the loading is in progress or already the buffer is loaded return.
    if (this._loadStatus === AudioLoadState.Loading || this._loadStatus === AudioLoadState.Loaded) {
      return this;
    }

    this._loadStatus = AudioLoadState.Loading;

    buzzer.load(this._src).then(downloadResult => {
      if (downloadResult.status === DownloadStatus.Success) {
        this._buffer = downloadResult.value;
        this._duration = this._buffer.duration;
        this._loadStatus = AudioLoadState.Loaded;
        this._fire('load', downloadResult);
        return;
      }

      this._loadStatus = AudioLoadState.Error;
      this._fire('error', {type: ErrorType.LoadError, error: downloadResult.error});
    });

    return this;
  }

  /**
   * Plays the sound.
   * Fires 'playstart' event before playing and 'end' event after the sound is played.
   * @param {string?} sound
   * @returns {Buzz}
   */
  play(sound) {
    if (this._state === BuzzState.Playing) {
      return this;
    }

    if (this._loadStatus === AudioLoadState.Loaded) {
      return this._play(sound);
    } else {
      this.on('load', () => this._play(sound), true);
      this.load();
    }

    return this;
  }

  _play(sound) {
    let offset = this._elapsed;
    let duration = this._duration;

    if(this._sprite && this._sprite.map[sound]) {
      const startEnd = this._sprite.map[sound],
        soundStart = startEnd[0],
        soundEnd = startEnd[1];
      duration = soundEnd - soundStart;

      if(offset === 0) {
        offset = soundStart;
      }
    }

    if (this._endTimer) {
      clearTimeout(this._endTimer);
      this._endTimer = null;
    }

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
    this._bufferSource.disconnect();
    this._bufferSource.stop(0);
    this._bufferSource = null;
    this._startedAt = 0;
    this._elapsed = 0;
    this._endTimer = null;
    this._state = BuzzState.Stopped;
    this._fire('end');
  }

  /**
   * Stops the sound that is playing or in paused state.
   * @returns {Buzz}
   */
  stop() {
    // We can stop the sound either if it "playing" or in "paused" state.
    if (this._state !== BuzzState.Playing && this._state !== BuzzState.Paused) {
      return this;
    }

    this._bufferSource.disconnect();
    this._bufferSource.stop(0);
    this._bufferSource = null;
    this._startedAt = 0;
    this._elapsed = 0;
    this.off('load', this._playEnd);
    this._endTimer && clearTimeout(this._endTimer);
    this._endTimer = null;
    this._state = BuzzState.Stopped;
    this._fire('stop');

    return this;
  }

  /**
   * Pause the playing sound.
   * @returns {Buzz}
   */
  pause() {
    // We can pause the sound only if it is "playing".
    if (this._state !== BuzzState.Playing) {
      return this;
    }

    this._bufferSource.disconnect();
    this._bufferSource.stop(0);
    this._bufferSource = null;
    this.off('load', this._playEnd);
    this._elapsed += this._context.currentTime - this._startedAt;
    this._endTimer && clearTimeout(this._endTimer);
    this._endTimer = null;
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
      return;
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

  fadeOut() {
    throw new Error('Not Implemented');
  }

  fadeIn() {
    throw new Error('Not Implemented');
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
    if (!this._subscribers.hasOwnProperty(event)) return this;
    if (typeof fn !== 'function') return this;

    this._subscribers[event].push({fn: fn, once: once || false});

    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event
   * @param {function} fn
   * @returns {Buzz}
   */
  off(event, fn) {
    if (!this._subscribers.hasOwnProperty(event)) return this;
    if (typeof fn !== 'function') return this;

    var eventSubscribers = this._subscribers[event];

    for (var i = 0; i < eventSubscribers.length; i++) {
      var eventSubscriber = eventSubscribers[i];
      if (eventSubscriber.fn === fn) {
        eventSubscribers.splice(i, 1);
        break;
      }
    }

    return this;
  }

  /**
   * Method to subscribe to an event only once.
   * @param {string} event
   * @param {function} fn
   * @returns {*|Buzz}
   */
  once(event, fn) {
    return this.on(event, fn, true);
  }

  /**
   * Fires an event passing the sound and other optional arguments.
   * @param {string} event
   * @param {object=} args
   * @returns {Buzz}
   * @private
   */
  _fire(event, args) {
    var eventSubscribers = this._subscribers[event];

    for (var i = 0; i < eventSubscribers.length; i++) {
      var eventSubscriber = eventSubscribers[i];

      setTimeout(function (subscriber) {
        subscriber.fn(this, args);

        if (subscriber.once) {
          this.off(event, subscriber.fn);
        }
      }.bind(this, eventSubscriber), 0);
    }

    return this;
  }
}

export {BuzzState, AudioLoadState, ErrorType, Buzz as default};
