/**
 * A simple wrapper over Web Audio API's AudioBufferSourceNode.
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
   * Returns whether the node is playing or not.
   * @type {string}
   * @private
   */
  _state = 'stopped';

  /**
   * Set the audio context.
   * @param {AudioContext} context The audio context
   * @param {AudioBuffer} buffer The audio buffer
   */
  constructor(context, buffer) {
    this._context = context;
    this._buffer = buffer;
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
   * @param {boolean=} loop True to loop the playing
   * @param {number=} loopStart The start position of the buffer
   * @param {number=} loopEnd The end position of the buffer
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
   * @param {object} options The play options
   * @param {number=} options.time The time to start playback
   * @param {number=} options.offset The elapsed time
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
    /*this._bufferSourceNode.addEventListener('ended', () => {
      this._state = 'stopped';
      this.stop();
    });*/

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

    this._state = 'playing';
  }

  /**
   * Stops the playing node and destroys it.
   */
  stop() {
    if (this._bufferSourceNode) {
      if (this._state === 'playing') {
        if (typeof this._bufferSourceNode.stop !== 'undefined') {
          this._bufferSourceNode.stop();
        }
        else {
          this._bufferSourceNode.noteGrainOff();
        }
      }

      this._bufferSourceNode.onended = null;
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
  }
}

export default BuzzBufferNode;
