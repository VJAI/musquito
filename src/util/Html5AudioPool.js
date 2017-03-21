const AudioPoolState = {
  Idle: 0,
  Monitoring: 1
};

class Html5AudioPool {

  _freeUpInterval = 1;

  _audioNodes = {};

  _intervalId = null;

  _state = AudioPoolState.Idle;

  constructor(options = {}) {
    typeof options.freeUpInterval === 'number' && (this._freeUpInterval = options.freeUpInterval);
  }

  _getNode(src) {
    return this._audioNodes[src];
  }

  allocate(src, id) {
    let nodes = this._getNode(src);

    if(!nodes) {
      nodes = [];
      this._audioNodes[src] = nodes;
    }

    const inActiveNode = nodes.find(node => node.id === null);

    if(inActiveNode) {
      inActiveNode.id = id;
      return inActiveNode;
    }

    const newNode = {
      id: id,
      audio: new Audio()
    };

    nodes.push(newNode);

    return newNode;
  }

  release(src, id) {
    let nodes = this._getNode(src);

    if(!nodes) {
      return;
    }

    const node = nodes.find(node => node.id === id);

    if(node) {
      node.id = null;
    }
  }

  monitor() {
    if(this._state === AudioPoolState.Monitoring) {
      return;
    }

    this._intervalId = setInterval(this._freeInActiveNodes, this._freeUpInterval * 60 * 1000);
    this._state = AudioPoolState.Monitoring;
  }

  stop() {
    if(this._state === AudioPoolState.Idle) {
      return;
    }

    if(this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }

    this._state = AudioPoolState.Idle;
  }

  _freeInActiveNodes() {

  }

  free() {
    this._state = AudioPoolState.Idle;
  }
}

export default Html5AudioPool;
