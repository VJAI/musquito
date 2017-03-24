/**
 * Represents the different statuses of audio pool.
 * @enum {number}
 */
const AudioPoolState = {
  Idle: 0,
  Monitoring: 1
};

/**
 * Manages the pool of HTML5 audio nodes.
 */
class Html5AudioPool {

  /**
   * The duration to run everytime the clean-up process.
   * @type {number}
   * @private
   */
  _cleanUpInterval = 1;

  /**
   * Created audio nodes for each resource.
   * @type {object}
   * @private
   */
  _audioNodes = {};

  /**
   * The clean-up interval timer id.
   * @type {number|null}
   * @private
   */
  _intervalId = null;

  /**
   * The current state of the pool.
   * @type {AudioPoolState}
   * @private
   */
  _state = AudioPoolState.Idle;

  /**
   * Initialize the pool properties.
   * @param {object=} options
   * @param {number=} options.cleanUpInterval
   */
  constructor(options = {}) {
    typeof options.cleanUpInterval === 'number' && (this._cleanUpInterval = options.cleanUpInterval);
  }

  /**
   * Allocates an audio node to a particular resource and sound.
   * @param {string} src
   * @param {string=} id
   * @return {Audio}
   */
  allocate(src, id) {
    let nodes = this._audioNodes[src];

    if(!nodes) {
      nodes = [];
      this._audioNodes[src] = nodes;
    }

    const inActiveNode = nodes.find(node => node.id === null);

    if(inActiveNode) {
      inActiveNode.id;
      return inActiveNode.audio;
    }

    const newNode = {
      id: id,
      audio: new Audio()
    };

    nodes.push(newNode);

    return newNode.audio;
  }

  /**
   * Release the allocated audio nodes.
   * @param src
   * @param id
   */
  release(src, id) {
    let nodes = this._audioNodes[src];

    if(!nodes) {
      return;
    }

    if(id) {
      const node = nodes.find(node => node.id === id);

      if(node) {
        node.id = null;
      }

      return;
    }

    this._audioNodes[src] = nodes.filter(node => {
      if(node.id) {
        return true;
      }

      node.audio.pause();
      return false;
    });
  }

  monitor() {
    if(this._state === AudioPoolState.Monitoring) {
      return;
    }

    this._intervalId = setInterval(this._freeInActiveNodes, this._cleanUpInterval * 60 * 1000);
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
    // TODO: Come-up with a better strategy for cleaning up audio nodes.
  }
}

export default Html5AudioPool;
