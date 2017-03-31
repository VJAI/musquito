/**
 * Manages the pool of HTML5 audio nodes.
 * @class
 */
class Html5AudioPool {

  /**
   * Created audio nodes for each resource.
   * @type {object}
   * @private
   */
  _audioNodes = {};

  /**
   * Allocates an audio node to a particular resource and sound.
   * @param {string} src The audio url
   * @param {string=} id The sound id
   * @return {Audio}
   */
  allocate(src, id) {
    // Retrieve all the allocated nodes for the resource
    // and check is there are inactive nodes, if there are
    // assign the sound to the first one.
    // If there are no inactive nodes, create a new node
    // and add to the array.
    let nodes = this._audioNodes[src];

    if (!nodes) {
      nodes = [];
      this._audioNodes[src] = nodes;
    }

    const inActiveNode = nodes.find(node => node.id === null);

    if (inActiveNode) {
      inActiveNode.id = id;
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
   * @param {string=} src The audio url
   * @param {string=} id The sound id
   */
  release(src, id) {
    // If the user hasn't passed any parameter then release inactive nodes linked to all the sources.
    // If the user has passed only the source then dispose all the inactive nodes linked to the source.
    // If id is passed relinquish the audio node from the sound.
    if (arguments.length === 0) {
      Object.keys(this._audioNodes).forEach(url => {
        this._releaseSourceNodes(url);
      });
      return;
    }

    let nodes = this._audioNodes[src];

    if (!nodes) {
      return;
    }

    if (id) {
      const node = nodes.find(n => n.id === id);

      if (node) {
        node.id = null;
      }

      return;
    }

    this._releaseSourceNodes(src);
  }

  /**
   * Release the audio nodes linked to a source.
   * @param {string} src The audio url
   * @param {boolean=} [onlyFree = true] Release only the un-allocated audio nodes?
   * @private
   */
  _releaseSourceNodes(src, onlyFree = true) {
    this._audioNodes[src] = this._audioNodes[src].filter(node => {
      if (onlyFree && node.id) {
        return true;
      }

      node.audio.pause();
      node.audio = null;
      return false;
    });
  }

  /**
   * Releases all the audio nodes.
   */
  dispose() {
    Object.keys(this._audioNodes).forEach(src => {
      this._releaseSourceNodes(src, false);
      delete this._audioNodes[src];
    });
  }
}

export default Html5AudioPool;
