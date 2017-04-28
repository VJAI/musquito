class BuzzBufferNode {

  _context = null;

  _bufferSourceNode = null;

  constructor(context) {
    this._context = context;
  }

  create(buffer) {
    this._bufferSourceNode = new this._context.createBufferSource();
    this._bufferSourceNode.buffer = buffer;
  }

  rate(rate) {
    if (this._bufferSourceNode) {
      this._bufferSourceNode.playbackRate.value = rate;
    }
  }

  destroy() {
    if (this._bufferSourceNode) {
      this._bufferSourceNode.disconnect();
      this._bufferSourceNode = null;

    }
  }
}

export default BuzzBufferNode;
