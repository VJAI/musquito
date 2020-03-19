import utility from './Utility';

/**
 * Manages the pool of HTML5 audio nodes.
 * @class
 */
class Html5AudioPool {

  /**
   * Maximum number of audio nodes allowed for a url.
   * @type {number}
   * @private
   */
  _maxNodesPerSource = Infinity;

  /**
   * Created audio nodes for each resource.
   * @type {object}
   * @private
   */
  _resourceAudioNodes = {};

  /**
   * Constructor
   * @param {number} maxNodesPerSource Maximum number of audio nodes allowed for a url.
   */
  constructor(maxNodesPerSource) {
    typeof maxNodesPerSource === 'number' && (this._maxNodesPerSource = maxNodesPerSource);
  }

  /**
   * Allocates an audio node for particular source.
   * @param {string} src The audio url.
   * @return {Audio}
   */
  allocateForSource(src) {
    this._createSrc(src);
    this._checkMaxNodesForSrc(src);

    const nodes = this._resourceAudioNodes[src],
      { unallocated } = nodes;

    const audio = new Audio();
    unallocated.push(audio);

    return audio;
  }

  /**
   * Allocates a HTML5 audio node to a particular resource and group.
   * @param {string} src The audio url.
   * @param {number} [groupId] The buzz group id.
   * @return {Audio}
   */
  allocateForGroup(src, groupId) {
    this._createGroup(src, groupId);
    this._checkMaxNodesForSrc(src);

    const nodes = this._resourceAudioNodes[src],
      { unallocated, allocated } = nodes,
      audio = unallocated.length ? unallocated.shift() : new Audio(),
      groupSounds = allocated[groupId];

    groupSounds.push({
      audio: audio,
      soundId: null
    });

    return audio;
  }

  /**
   * Allocates the pre-loaded HTML5 audio node to a sound.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   * @param {number} soundId The sound id.
   * @return {Audio}
   */
  allocateForSound(src, groupId, soundId) {
    this._createGroup(src, groupId);

    const nodes = this._resourceAudioNodes[src],
      { allocated } = nodes,
      notAllocatedAudioObj = allocated[groupId].find(x => x.soundId === null);

    notAllocatedAudioObj.soundId = soundId;

    return notAllocatedAudioObj.audio;
  }

  /**
   * Releases all the audio nodes created for a resource.
   * @param {string} src The audio url.
   */
  releaseForSource(src) {
    const nodes = this._resourceAudioNodes[src],
      { unallocated, allocated } = nodes;

    unallocated.forEach(x => this._destroyNode(x));

    Object.keys(unallocated).forEach(groupId => {
      allocated[groupId].forEach(x => this._destroyNode(x.audio));
      delete allocated[groupId];
    });

    delete this._resourceAudioNodes[src];
  }

  /**
   * Releases all the audio nodes allocated for a group.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   */
  releaseForGroup(src, groupId) {
    const nodes = this._resourceAudioNodes[src],
      { unallocated, allocated } = nodes;

    const audioNodes = allocated[groupId].map(x => x.audio);
    nodes.unallocated = [...unallocated, ...audioNodes];

    delete allocated[groupId];
  }

  /**
   * Release the audio element that is allocated for the sound.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   * @param {number} soundId The sound id.
   */
  releaseForSound(src, groupId, soundId) {
    const nodes = this._resourceAudioNodes[src],
      { allocated } = nodes;

    const allocatedAudioObj = allocated[groupId].find(x => x.soundId === soundId);
    allocatedAudioObj.soundId = null;
    delete allocated[groupId];
  }

  /**
   * Returns if there are free audio nodes available for a group.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   * @return {boolean}
   */
  hasFreeNodes(src, groupId) {
    if (!this._resourceAudioNodes.hasOwnProperty(src)) {
      return false;
    }

    const nodes = this._resourceAudioNodes[src],
      { allocated } = nodes;

    const unallocatedObjects = allocated[groupId].filter(x => x.soundId === null);
    return unallocatedObjects.length > 0;
  }

  /**
   * Acquires the unallocated audio nodes and removes the excess ones.
   */
  cleanUp() {
    Object.keys(this._resourceAudioNodes).forEach(src => {
      const nodes = this._resourceAudioNodes[src],
        { unallocated, allocated } = nodes;

      let audioNodes = [];

      Object.keys(allocated).forEach(groupId => {
        audioNodes = [...audioNodes, ...allocated[groupId].filter(x => x.soundId === null)];
        allocated[groupId] = allocated[groupId].filter(x => x.soundId !== null);
      });

      nodes.unallocated = [...unallocated, ...audioNodes].slice(0, this._maxNodesPerSource);
    });
  }

  /**
   * Releases all the audio nodes.
   */
  dispose() {
    Object.keys(this._resourceAudioNodes).forEach(src => this.releaseForSource(src));
  }

  /**
   * Creates an entry for the passed source in object if not exists.
   * @param {string} src The audio file.
   * @private
   */
  _createSrc(src) {
    if (this._resourceAudioNodes.hasOwnProperty(src)) {
      return;
    }

    this._resourceAudioNodes[src] = {
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

    const nodes = this._resourceAudioNodes[src],
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
    if (!this._resourceAudioNodes.hasOwnProperty(src)) {
      return;
    }

    const nodes = this._resourceAudioNodes[src],
      { unallocated, allocated } = nodes;

    let totalAllocatedLength = 0;

    Object.keys(allocated).forEach(groupId => {
      totalAllocatedLength = totalAllocatedLength + allocated[groupId].length;
    });

    if (unallocated.length + totalAllocatedLength < this._maxNodesPerSource) {
      return;
    }

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
