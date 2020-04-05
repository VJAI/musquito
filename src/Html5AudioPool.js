import utility from './Utility';

/**
 * Manages the pool of HTML5 audio nodes.
 * @class
 */
class Html5AudioPool {

  /**
   * Maximum number of HTML5 audio nodes that can be allocated for a resource.
   * @type {number}
   * @private
   */
  _maxNodesPerSource = 100;

  /**
   * The sounds store.
   * @type {Heap}
   * @private
   */
  _heap = null;

  /**
   * Created audio nodes for each resource.
   * @type {object}
   * @private
   */
  _resourceNodesMap = {};

  /**
   * True if the heap is cleaned manually.
   * @type {boolean}
   * @private
   */
  _heapCleaned = false;

  /**
   * Constructor
   * @param {number} maxNodesPerSource Maximum number of audio nodes allowed for a resource.
   * @param {Heap} heap The sounds store.
   */
  constructor(maxNodesPerSource, heap) {
    this._maxNodesPerSource = maxNodesPerSource;
    this._heap = heap;
  }

  /**
   * Allocates an audio node for the passed source.
   * @param {string} src The audio url.
   * @return {Audio}
   */
  allocateForSource(src) {
    this._createSrc(src);
    this._checkMaxNodesForSrc(src);

    const nodes = this._resourceNodesMap[src],
      { unallocated } = nodes;

    const audio = new Audio();
    unallocated.push(audio);

    return audio;
  }

  /**
   * Allocates a HTML5 audio node to a particular group.
   * @param {string} src The audio url.
   * @param {number} [groupId] The buzz group id.
   * @return {Audio}
   */
  allocateForGroup(src, groupId) {
    this._createGroup(src, groupId);
    this._checkMaxNodesForSrc(src);

    const nodes = this._resourceNodesMap[src],
      { unallocated, allocated } = nodes,
      audio = unallocated.length ? unallocated.shift() : new Audio();

    allocated[groupId].push(audio);

    return audio;
  }

  /**
   * Allocates the pre-loaded HTML5 audio node to a sound.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   * @return {Audio}
   */
  allocateForSound(src, groupId) {
    this._createGroup(src, groupId);

    const nodes = this._resourceNodesMap[src],
      { allocated } = nodes;

    const groupSounds = allocated[groupId];

    if (!groupSounds.length) {
      throw new Error(`No free audio nodes available in the group ${groupId}`);
    }

    return groupSounds.shift();
  }

  /**
   * Releases the audio nodes allocated for all resources.
   */
  release() {
    Object.keys(this._resourceNodesMap).forEach(src => this.releaseForSource(src));
  }

  /**
   * Releases the audio nodes allocated for a resource.
   * @param {string} src The audio url.
   */
  releaseForSource(src) {
    const nodes = this._resourceNodesMap[src],
      { unallocated, allocated } = nodes;

    unallocated.forEach(x => this._destroyNode(x));

    Object.keys(allocated).forEach(groupId => this.releaseForGroup(src, groupId));

    delete this._resourceNodesMap[src];
  }

  /**
   * Releases the audio nodes allocated for a group.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   */
  releaseForGroup(src, groupId) {
    const nodes = this._resourceNodesMap[src],
      { allocated } = nodes;

    allocated[groupId].forEach(audio => this._destroyNode(audio));
    delete allocated[groupId];
  }

  /**
   * Destroys the audio node reserved for sound.
   * @param {string} src The audio file url.
   * @param {Audio} audio The sound id.
   * @param {number} groupId The buzz id.
   */
  releaseAudio(src, audio, groupId) {
    const nodes = this._resourceNodesMap[src],
      { allocated, unallocated } = nodes;

    this._destroyNode(audio);

    if (groupId) {
      allocated[groupId] = allocated[groupId].filter(x => x !== audio);
    } else {
      nodes.unallocated = unallocated.filter(x => x !== audio);
    }

    groupId && !allocated[groupId].length && delete allocated[groupId];
    !unallocated.length && !Object.keys(allocated).length && delete this._resourceNodesMap[src];
  }

  /**
   * Acquires the unallocated audio nodes and removes the excess ones.
   */
  cleanUp() {
    Object.keys(this._resourceNodesMap).forEach(src => {
      const nodes = this._resourceNodesMap[src],
        { unallocated, allocated } = nodes;

      let audioNodes = [];

      Object.keys(allocated).forEach(groupId => {
        audioNodes = [...audioNodes, ...allocated[groupId]];
        delete allocated[groupId];
      });

      nodes.unallocated = [...unallocated, ...audioNodes].slice(0, this._maxNodesPerSource);
    });
  }

  /**
   * Releases all the audio nodes.
   */
  dispose() {
    Object.keys(this._resourceNodesMap).forEach(src => this.releaseForSource(src));
    this._heap = null;
  }

  /**
   * Returns true if there are free audio nodes available for a group.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   * @return {boolean}
   */
  hasFreeNodes(src, groupId) {
    if (!this._resourceNodesMap.hasOwnProperty(src)) {
      return false;
    }

    const nodes = this._resourceNodesMap[src],
      { allocated } = nodes;

    return allocated[groupId].length > 0;
  }

  /**
   * Creates an entry for the passed source in object if not exists.
   * @param {string} src The audio file.
   * @private
   */
  _createSrc(src) {
    if (this._resourceNodesMap.hasOwnProperty(src)) {
      return;
    }

    this._resourceNodesMap[src] = {
      unallocated: [],
      allocated: {}
    };
  }

  /**
   * Creates an entry for the passed source and group if not exists.
   * @param {string} src The audio file.
   * @param {number} groupId The group id.
   * @private
   */
  _createGroup(src, groupId) {
    this._createSrc(src);

    const nodes = this._resourceNodesMap[src],
      { allocated } = nodes;

    if (allocated.hasOwnProperty(groupId)) {
      return;
    }

    allocated[groupId] = [];
  }

  /**
   * Chekcks and throws error if max audio nodes reached for the passed resource.
   * @param {string} src The source url.
   * @private
   */
  _checkMaxNodesForSrc(src) {
    if (!this._resourceNodesMap.hasOwnProperty(src)) {
      return;
    }

    const nodes = this._resourceNodesMap[src],
      { unallocated, allocated } = nodes;

    let totalAllocatedLength = 0;

    Object.keys(allocated).forEach(groupId => {
      totalAllocatedLength = totalAllocatedLength + allocated[groupId].length;
    });

    if (unallocated.length + totalAllocatedLength < this._maxNodesPerSource) {
      return;
    }

    if (!this._heapCleaned) {
      this._heap.free(src);
      this._heapCleaned = true;
      this._checkMaxNodesForSrc(src);
    }

    this._heapCleaned = false;

    throw new Error(`Maximum nodes reached for resource ${src}`);
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
}

export default Html5AudioPool;
