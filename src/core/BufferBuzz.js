import BaseBuzz, { BuzzState } from './BaseBuzz';
import buzzer from './Buzzer';

/**
 * Employs Web Audio's AudioBufferSourceNode for playing sounds.
 * @class
 */
class BufferBuzz extends BaseBuzz {

  /**
   * The audio buffer.
   * @type {AudioBuffer}
   * @private
   */
  _buffer = null;

  /**
   * The AudioBufferSourceNode that plays the audio buffer assigned to it.
   * @type {AudioBufferSourceNode}
   * @private
   */
  _bufferSourceNode = null;

  /**
   * The time at which the playback started.
   * @type {number}
   * @protected
   */
  _startTime = 0;

  /**
   * Download the audio file and loads into an audio buffer.
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load() {
    return buzzer.loadBuffer(this._compatibleSrc);
  }

  /**
   * Create the gain node and set it's gain value.
   * @protected
   */
  _createGainNode() {
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = this._muted ? 0 : this._volume;
  }

  /**
   * Store the buffer, duration from the download result.
   * @param {DownloadResult} downloadResult The download result
   * @private
   */
  _save(downloadResult) {
    this._buffer = downloadResult.value;
    this._duration = this._buffer.duration;
  }

  /**
   * Creates a new AudioBufferSourceNode, set it's properties and play it.
   * @param {function} cb Callback that should be called after the node started playing.
   * @private
   */
  _playNode(cb) {
    let [seek, duration] = this._getTimeVars();

    // Create a new node
    this._bufferSourceNode = this._context.createBufferSource();

    // Set the buffer, playback rate and loop parameters
    this._bufferSourceNode.buffer = this._buffer;
    this._bufferSourceNode.playbackRate.value = this._rate;
    this._setLoop();
    this._bufferSourceNode.loop = this._loop;
    this._bufferSourceNode.loopStart = this._startPos;
    this._bufferSourceNode.loopEnd = this._endPos;

    // Connect the node to the audio graph.
    this._bufferSourceNode.connect(this._gainNode);

    // Call the supported method to play the sound
    if (typeof this._bufferSourceNode.start !== 'undefined') {
      this._bufferSourceNode.start(this._context.currentTime, seek, duration);
    }
    else {
      this._bufferSourceNode.noteGrainOn(this._context.currentTime, seek, duration);
    }

    this._startTime = this._context.currentTime;

    cb();
  }

  /**
   * Callback that is invoked after the playback is ended.
   * @private
   */
  _onEnded() {
    if (this._loop) {
      this._fire('playend');

      // Reset the seek positions
      this._currentPos = this._startPos;
      this._rateSeek = 0;

      // Reset the play start time
      this._startTime = this._context.currentTime;

      // Create a new timer
      let [, duration] = this._getTimeVars();
      this._endTimer = setTimeout(this._onEnded, duration);

      this._fire('playstart');
    } else {
      // Reset the seek positions
      this._currentPos = 0;
      this._rateSeek = 0;

      // Clear the end timer
      this._clearEndTimer();

      // Destroy the node (AudioBufferSourceNodes are one-time use and throw objects).
      this._destroyBufferNode();

      // Reset the state to allow future actions
      this._state = BuzzState.Idle;

      this._fire('playend');
    }
  }

  /**
   * Resets the timer and destroys the node.
   * @private
   */
  _pauseNode() {
    this._stopBufferNode();
    this._destroyBufferNode();
  }

  /**
   * Resets the timer and destroys the node.
   * @private
   */
  _stopNode() {
    this._stopBufferNode();
    this._destroyBufferNode();
  }

  /**
   * Stops the playing buffer source node and destroys it.
   * @private
   */
  _stopBufferNode() {
    if (!this._bufferSourceNode) {
      return;
    }

    if (typeof this._bufferSourceNode.stop !== 'undefined') {
      this._bufferSourceNode.stop();
    }
    else {
      this._bufferSourceNode.noteGrainOff();
    }

    this._destroyBufferNode();
  }

  /**
   * Destroys the buffer source node.
   * @private
   */
  _destroyBufferNode() {
    if (!this._bufferSourceNode) {
      return;
    }

    this._bufferSourceNode.disconnect();
    this._bufferSourceNode.onended = null;

    try {
      this._bufferSourceNode.buffer = buzzer.scratchBuffer();
    }
    catch (e) {
    }

    this._bufferSourceNode = null;
  }

  /**
   * Sets the playbackrate for the buffer source node.
   * @param {number=} rate The playback rate
   * @private
   */
  _setRate(rate) {
    this._startTime = this._context.currentTime;
    this._bufferSourceNode && (this._bufferSourceNode.playbackRate.value = rate);
  }

  /**
   * Returns the current position of the playback.
   * @return {number}
   * @private
   */
  _getSeek() {
    const realTime = this.isPlaying() ? this._context.currentTime - this._startTime : 0;
    const rateElapsed = this._rateSeek ? this._rateSeek - this._currentPos : 0;

    return this._currentPos + (rateElapsed + realTime * this._rate);
  }

  /**
   * Seek the playback to the passed position.
   * @param {number} seek The seek position
   * @param {function} cb The callback function
   * @protected
   */
  _setSeek(seek, cb) {
    this._currentPos = seek;
    cb();
  }

  /**
   * Set the sound to play repeatedly or not.
   * @private
   */
  _setLoop() {
    if (this._bufferSourceNode) {
      this._bufferSourceNode.loop = this._loop;

      if (this._loop) {
        this._bufferSourceNode.loopStart = this._startPos;
        this._bufferSourceNode.loopEnd = this._endPos;
      }
    }
  }

  /**
   * Null the buffer.
   * @private
   */
  _destroy() {
    this._buffer = null;
  }
}

export { BufferBuzz as default };
