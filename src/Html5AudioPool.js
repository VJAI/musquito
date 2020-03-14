import utility from './Utility';

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
  _resourceAudioNodes = {};

  /**
   * Allocates an audio node to a particular resource and sound.
   * @param {string} src The audio url.
   * @param {string} [groupId] The buzz group id.
   * @return {Audio}
   */
  allocateForGroup(src, groupId) {
    const nodes = this._resourceAudioNodes[src];

    this._resourceAudioNodes[src] = nodes || {
      unallocated: [],
      allocated: {}
    };

    const { unallocated, allocated } = nodes;
    const audio = unallocated.length ? unallocated.shift() : new Audio();

    let groupSounds = [];

    if (allocated.hasOwnProperty(groupId)) {
      groupSounds = allocated[groupId];
    } else {
      allocated[groupId] = groupSounds;
    }

    groupSounds.push({
      audio: audio,
      soundId: null
    });

    return audio;
  }

  allocateForSound(src, groupId, soundId) {
    const nodes = this._resourceAudioNodes[src],
      { allocated } = nodes;

    if (!allocated.hasOwnProperty(groupId)) {
      return;
    }

    const notAllocatedAudioObj = allocated[groupId].find(x => x.soundId === null);
    notAllocatedAudioObj.soundId = soundId;
  }

  /**
   * Release all the allocated audio nodes or the ones mapped to a resource.
   * @param {string|string[]} [urls] The audio url.
   * @param {boolean} [onlyFree = true] Release only the un-allocated audio nodes.
   */
  release(urls, onlyFree = true) {
    /*if (!urls) {
      Object.keys(this._resourceAudioNodes).forEach(url => {
        this._destroyNodes(url, onlyFree);
      });

      return;
    }

    if (Array.isArray(urls)) {
      urls.forEach(url => this._destroyNodes(url, onlyFree));
      return;
    }

    this._destroyNodes(urls, onlyFree);*/
    throw new Error('Not implemented');
  }

  /**
   * Release the audio nodes linked to a source.
   * @param {string} src The audio url
   * @param {boolean} onlyFree Release only the un-allocated audio nodes?
   * @private
   */
  _destroyNodes(src, onlyFree) {
    if (!this._resourceAudioNodes.hasOwnProperty(src)) {
      return;
    }

    this._resourceAudioNodes[src] = this._resourceAudioNodes[src].filter(node => {
      if (onlyFree && node.id) {
        return true;
      }

      if (node.audio) {
        this._destroyNode(node.audio);
        node.audio = null;
      }

      return false;
    });
  }

  /**
   * Destroys the passed audio node.
   * @param {Audio} audio The HTML5 audio element.
   * @private
   */
  _destroyNode(audio) {
    audio.pause();
    utility.isIE() && (audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
    audio.onerror = null;
    audio.onend = null;
    audio.canplaythrough = null;
  }

  /**
   * Release the audio element that is allocated for the sound.
   * @param {string} id The sound id.
   * @param {boolean} destroy True to destroy the audio node.
   */
  releaseForSound(id, destroy = false) {
    Object.keys(this._resourceAudioNodes).forEach(src => {
      const node = this._getNodeById(src, id);

      if (node) {
        if (!destroy) {
          node.id = null;
        } else {
          const nodes = this._resourceAudioNodes[src];
          nodes.splice(nodes.indexOf(node), 1);
          this._destroyNode(node.audio);
          node.audio = null;
        }
      }
    });
  }

  /**
   * Returns the node allocated for the sound.
   * @param {string} src The audio url.
   * @param {string} id The sound id.
   * @return {object}
   * @private
   */
  _getNodeById(src, id) {
    if (!this._resourceAudioNodes[src]) {
      return null;
    }

    const nodes = this._resourceAudioNodes[src];
    return nodes.find(node => node.id === id);
  }

  /**
   * Destroys the no-more-usable audio element.
   * @param {Audio} audio The failed audio element.
   * @param {string} url The url.
   */
  destroy(audio, url) {
    const nodes = this._resourceAudioNodes[url],
      node = nodes.forEach(n => n.audio === audio);

    nodes.splice(nodes.indexOf(node), 1);
    this._destroyNode(audio);
  }

  /**
   * Releases all the audio nodes.
   */
  dispose() {
    Object.keys(this._resourceAudioNodes).forEach(src => {
      this._destroyNodes(src, false);
      delete this._resourceAudioNodes[src];
    });
  }
}

export default Html5AudioPool;
