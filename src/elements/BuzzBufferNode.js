import EventEmitter from '../util/EventEmitter';

/**
 * Represents the different states of the BuzzBufferNode.
 * @enum
 * @type {string}
 */
const BuzzBufferNodeState = {
  Playing: 'playing',
  Stopped: 'stopped'
};

/**
 * A simple wrapper over Web Audio's AudioBufferSourceNode.
 */
class BuzzBufferNode {

  /**
   * Audio Context.
   * @type {AudioContext}
   * @private
   */
  _context = null;

  /**
   * Audio buffer.
   * @type {AudioBuffer}
   * @private
   */
  _buffer = null;

  /**
   * Event emitter.
   * @type {EventEmitter|null}
   * @private
   */
  _emitter = null;

  /**
   * Audio buffer source node.
   * @type {AudioBufferSourceNode}
   * @private
   */
  _bufferSourceNode = null;

  /**
   * Sound play back rate.
   * @type {number}
   * @private
   */
  _rate = 1;

  /**
   * True to play the sound repeatedly.
   * @type {boolean}
   * @private
   */
  _loop = false;

  /**
   * Loop start position.
   * @type {number}
   * @private
   */
  _loopStart = 0;

  /**
   * Loop end position.
   * @type {number}
   * @private
   */
  _loopEnd = 0;

  /**
   * Returns whether the node is playing or stopped.
   * @type {BuzzBufferNodeState}
   * @private
   */
  _state = BuzzBufferNodeState.Stopped;

  /**
   * Set the audio context.
   * @param {AudioContext} context The audio context
   * @param {AudioBuffer} buffer The audio buffer
   */
  constructor(context, buffer) {
    this._context = context;
    this._buffer = buffer;
    this._emitter = new EventEmitter('ended');
  }

  /**
   * Returns the underlying audio buffer source node.
   * @return {AudioBufferSourceNode}
   */
  node() {
    return this._bufferSourceNode;
  }

  /**
   * Get/set the playback rate of the audio.
   * @param {number=} rate The playback rate
   * @return {number}
   */
  rate(rate) {
    if (typeof rate !== 'undefined') {
      this._rate = rate;

      if (this._bufferSourceNode) {
        this._bufferSourceNode.playbackRate.value = this._rate;
      }
    }

    return this._rate;
  }

  /**
   * Get/set the loop parameters for the buffer source node.
   * @param {boolean=} loop True to loop the sound
   * @param {number=} loopStart The start position of the loop
   * @param {number=} loopEnd The end position of the loop
   * @return {boolean}
   */
  loop(loop, loopStart, loopEnd) {
    if (typeof loop !== 'undefined') {
      this._loop = loop;
      this._loopStart = loopStart;
      this._loopEnd = loopEnd;

      if (this._bufferSourceNode) {
        this._bufferSourceNode.loop = loop;
        this._bufferSourceNode.loopStart = loopStart;
        this._bufferSourceNode.loopEnd = loopEnd;
      }
    }

    return this._loop;
  }

  /**
   * Plays the node with the passed options.
   * @param {object} options The playback options
   * @param {number=} options.time The time to start playback
   * @param {number=} options.offset The offset
   * @param {number=} options.duration The duration to play
   * @param {number=} options.rate The playback rate
   * @param {boolean=} options.loop True to loop the sound
   * @param {number=} options.loopStart The loop start position
   * @param {number=} options.loopEnd The loop end position
   */
  play(options) {
    this.stop();

    this._bufferSourceNode = new this._context.createBufferSource();
    this._bufferSourceNode.buffer = this._buffer;
    this._bufferSourceNode.addEventListener('ended', this._onEnded.bind(this));

    this.rate(options.rate);
    this.loop(options.loop, options.loopStart, options.loopEnd);

    const time = options.time || this._context.currentTime,
      offset = options.offset || 0,
      duration = options.duration || this._buffer.duration;

    if (typeof this._bufferSourceNode.start !== 'undefined') {
      this._bufferSourceNode.start(time, offset, duration);
    }
    else {
      this._bufferSourceNode.noteGrainOn(time, offset, duration);
    }

    this._state = BuzzBufferNodeState.Playing;
  }

  /**
   * The "ended" event callback.
   * @private
   */
  _onEnded() {
    this._state = BuzzBufferNodeState.Stopped;
    this.stop();
    this._fire('ended', this);
  }

  /**
   * Stops the playing node and destroys it.
   */
  stop() {
    if (this._bufferSourceNode) {
      if (this._state === BuzzBufferNodeState.Playing) {
        if (typeof this._bufferSourceNode.stop !== 'undefined') {
          this._bufferSourceNode.stop();
        }
        else {
          this._bufferSourceNode.noteGrainOff();
        }

        this._state = BuzzBufferNodeState.Stopped;
      }

      this._bufferSourceNode.addEventListener('ended', this._onEnded);
      this._bufferSourceNode.disconnect();
      this._bufferSourceNode = null;
    }
  }

  /**
   * Destroys the node and removes dependencies.
   */
  destroy() {
    this.stop();
    this._buffer = null;
    this._context = null;
    this._emitter = null;
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event Name of the event
   * @param {function} handler The event-handler function
   * @param {boolean=} [once = false] Is it one-time subscription or not
   */
  on(event, handler, once = false) {
    this._emitter.on(event, handler, once);
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event The event name
   * @param {function} handler The handler function
   */
  off(event, handler) {
    this._emitter.off(event, handler);
  }

  /**
   * Fires an event passing the source and other optional arguments.
   * @param {string} event The event name
   * @param {...*} args The arguments that to be passed to handler
   * @protected
   */
  _fire(event, ...args) {
    this._emitter.fire(event, ...args, this);
  }
}

export default BuzzBufferNode;
