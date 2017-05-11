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
   * The underlying node that plays the audio.
   * @type {AudioBufferSourceNode}
   * @private
   */
  _bufferSourceNode = null;

  /**
   * Download the audio file and loads into an audio buffer.
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load() {
    return buzzer.load(this._compatibleSrc);
  }

  /**
   * Store the buffer and duration from the download result.
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
   * Called after the playback ends.
   * @private
   */
  _onEnded() {
    if (this._loop) {
      this._fire('playend');

      // Reset the seek positions
      this._seek = this._startPos;
      this._rateSeek = 0;

      // Reset the play start time
      this._startTime = this._context.currentTime;

      // Create a new timer
      let [, duration] = this._getTimeVars();
      this._endTimer = setTimeout(this._onEnded, duration);

      this._fire('playstart');
    } else {
      this._seek = 0;
      this._rateSeek = 0;
      this._clearEndTimer();
      this._destroyBufferNode();
      this._state = BuzzState.Idle;
      this._fire('playend');
    }
  }

  /**
   * Reset the timer and destroy the node.
   * @private
   */
  _pauseNode() {
    this._stopBufferNode();
    this._destroyBufferNode();
  }

  /**
   * Reset the timer and destroy the node.
   * @private
   */
  _stopNode() {
    this._stopBufferNode();
    this._destroyBufferNode();
  }

  /**
   * Set the playbackrate for the buffer source node.
   * @param {number=} rate The playback rate
   * @private
   */
  _setRate(rate) {
    this._startTime = this._context.currentTime;
    this._bufferSourceNode && (this._bufferSourceNode.playbackRate.value = rate);
  }

  /**
   * Get/set the seek position.
   * @param {number=} seek The seek position
   * @return {BufferBuzz|number}
   */
  seek(seek) {
    if (typeof seek === 'undefined') {
      const realTime = this.isPlaying() ? this._context.currentTime - this._startTime : 0;
      const rateElapsed = this._rateSeek ? this._rateSeek - this._elapsed : 0;

      return this._elapsed + (rateElapsed + realTime * this._rate);
    }

    if (typeof seek !== 'number' || seek < 0) {
      return this;
    }

    if (!this.isLoaded()) {
      this._actionQueue.add('seek', () => this.seek(seek));
      this._load();
      return this;
    }

    if (seek > this._duration) {
      return this;
    }

    const isPlaying = this.isPlaying();
    if (isPlaying) {
      this._pause(false);
    }

    this._elapsed = seek;
    this._fire('seek', seek);

    if (isPlaying) {
      this._play(null, false);
    }

    return this;
  }

  _getSeek() {
    const realTime = this.isPlaying() ? this._context.currentTime - this._startTime : 0;
    const rateElapsed = this._rateSeek ? this._rateSeek - this._elapsed : 0;

    return this._elapsed + (rateElapsed + realTime * this._rate);
  }

  _setSeek(seek) {

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
   * Null the buffer.
   * @private
   */
  _destroy() {
    this._buffer = null;
  }
}

export { BufferBuzz as default };
