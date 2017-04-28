/**
 * A simple wrapper class over AudioBufferSourceNode.
 */
class BuzzBufferNode {

  _context = null;

  _buffer = null;

  _bufferSourceNode = null;

  _rate = 1;

  constructor(context, buffer, rate = 1) {
    this._context = context;
    this._buffer = buffer;
    this._rate = rate;
  }

  buffer(buffer) {
    if (typeof buffer === 'undefined') {
      return this._buffer;
    }

    this._buffer = buffer;
  }

  rate(rate) {
    if (this._bufferSourceNode) {
      if (typeof rate === 'undefined') {
        return this._bufferSourceNode.playbackRate.value;
      }

      this._bufferSourceNode.playbackRate.value = rate;
    }

    return 0;
  }

  play(time, offset, duration) {
    if (this._bufferSourceNode) {
      this.stop();
      this._bufferSourceNode.disconnect();
      this._bufferSourceNode = new this._context.createBufferSource();
      this._bufferSourceNode.buffer = this._buffer;

      if (typeof this._bufferSourceNode.start !== 'undefined') {
        this._bufferSourceNode.start(time, offset, duration);
      }
      else {
        this._bufferSourceNode.noteGrainOn(time, offset, duration);
      }
    }
  }

  stop() {
    if (this._bufferSourceNode) {
      if (typeof this._bufferSourceNode.stop !== 'undefined') {
        this._bufferSourceNode.stop();
      }
      else {
        this._bufferSourceNode.noteGrainOff();
      }
    }
  }

  node() {
    return this._bufferSourceNode;
  }

  destroy() {
    if (this._bufferSourceNode) {
      this.stop();
      this._bufferSourceNode.disconnect();
      this._bufferSourceNode = null;
      this._buffer = null;
      this._context = null;
    }
  }
}

export default BuzzBufferNode;
