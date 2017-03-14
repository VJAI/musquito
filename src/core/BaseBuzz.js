import buzzer from './Buzzer';
import {DownloadStatus} from '../util/BufferLoader';
import codecAid from '../util/CodecAid';
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
  Error: 5,
  Destroyed: 6
};

/**
 * Enum that represents the different errors thrown by a Buzz object.
 * @enum {number}
 */
const ErrorType = {
  LoadError: 1
};

/**
 * Represents the base class for a sound.
 * @class
 */
class BaseBuzz {

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
    let options = typeof args === 'string' ? {src: args} : args || {};

    if (typeof options.src === 'undefined' && typeof options.dataUri === 'undefined') {
      throw new Error('You should pass the source of the audio');
    }

    this._id = typeof options.id === 'string' ? options.id : Math.round(Date.now() * Math.random());
    this._src = Array.isArray(options.src) ? options.src : [options.src];
    this._dataUri = options.dataUri;
    this._sprite = typeof options.sprite === 'object' ? options.sprite : undefined;
    const volume = parseFloat(options.volume);
    this._volume = !isNaN(volume) && volume >= 0 && volume <= 1.0 ? volume : 1.0;
    this._muted = typeof options.muted === 'boolean' ? options.muted : false;
    this._loop = typeof options.loop === 'boolean' ? options.loop : false;
    this._preload = typeof options.preload === 'boolean' ? options.preload : false;
    this._autoplay = typeof options.autoplay === 'boolean' ? options.autoplay : false;
    typeof options.onload === 'function' && this.on('load', options.onload);
    typeof options.onerror === 'function' && this.on('error', options.onerror);
    typeof options.onplaystart === 'function' && this.on('playstart', options.onplaystart);
    typeof options.onplayend === 'function' && this.on('playend', options.onplayend);
    typeof options.onstop === 'function' && this.on('stop', options.onstop);
    typeof options.onpause === 'function' && this.on('pause', options.onpause);
    typeof options.onmute === 'function' && this.on('mute', options.onmute);
    typeof options.onvolume === 'function' && this.on('volume', options.onvolume);
    typeof options.ondestroy === 'function' && this.on('destroy', options.ondestroy);

    this._emitter = new EventEmitter('load,error,playstart,playend,stop,pause,mute,volume');
    this._buffer = null;
    this._bufferSource = null;
    this._endTimer = null;
    this._duration = 0;
    this._startedAt = 0;
    this._elapsed = 0;
    this._isLoaded = false;

    buzzer.setup(null);

    this._context = buzzer.context();
    this._state = BuzzState.Constructed;

    if (this._autoplay) {
      this.play();
      return;
    }

    if (this._preload) {
      this.load();
    }
  }

  load() {
    throw new Error('Not Implemented');
  }

  play() {
    throw new Error('Not Implemented');
  }
}

export {BaseBuzz as default, BuzzState, ErrorType};
