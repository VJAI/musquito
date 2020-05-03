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
   * Inactive time of sound/HTML5 audio.
   * @type {number}
   * @private
   */
  _inactiveTime = 2;

  /**
   * The sounds store.
   * @type {function}
   * @private
   */
  _soundCleanUpCallback = null;

  /**
   * Created audio nodes for each resource.
   * @type {object}
   * @private
   */
  _resourceNodesMap = {};

  /**
   * True if the `soundCleanUpCallback` called.
   * @type {boolean}
   * @private
   */
  _cleanUpCalled = false;

  /**
   * Constructor
   * @param {number} maxNodesPerSource Maximum number of audio nodes allowed for a resource.
   * @param {number} inactiveTime The period after which HTML5 audio node is marked as inactive.
   * @param {function} soundCleanUpCallback The inactive sounds cleanup callback.
   */
  constructor(maxNodesPerSource, inactiveTime, soundCleanUpCallback) {
    this._maxNodesPerSource = maxNodesPerSource;
    this._inactiveTime = inactiveTime;
    this._soundCleanUpCallback = soundCleanUpCallback;
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
    unallocated.push({ audio: audio, time: new Date() });

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
      audio = unallocated.length ? unallocated.shift().audio : new Audio();

    allocated[groupId].push({ soundId: null, audio: audio, time: new Date() });

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

    const nodes = this._resourceNodesMap[src],
      { allocated } = nodes,
      notAllocatedAudioObj = allocated[groupId].find(x => x.soundId === null);

    if (!notAllocatedAudioObj) {
      throw new Error(`No free audio nodes available in the group ${groupId}`);
    }

    notAllocatedAudioObj.soundId = soundId;

    return notAllocatedAudioObj.audio;
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

    unallocated.forEach(x => this._destroyNode(x.audio));

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

    allocated[groupId].map(x => x.audio).forEach(node => this._destroyNode(node));
    delete allocated[groupId];
  }

  /**
   * Destroys the audio node reserved for sound.
   * @param {string} src The audio file url.
   * @param {number} groupId The buzz id.
   * @param {number|Audio} soundIdOrAudio The sound id or audio.
   */
  releaseAudio(src, groupId, soundIdOrAudio) {
    const nodes = this._resourceNodesMap[src],
      { allocated, unallocated } = nodes;

    if (soundIdOrAudio instanceof Audio) {
      this._destroyNode(soundIdOrAudio);

      if (groupId) {
        allocated[groupId] = allocated[groupId].filter(x => x.audio !== soundIdOrAudio);
      } else {
        nodes.unallocated = unallocated.filter(x => x.audio !== soundIdOrAudio);
      }
    } else {
      const allocatedAudioObj = allocated[groupId].find(x => x.soundId === soundIdOrAudio);
      this._destroyNode(allocatedAudioObj.audio);
      allocated[groupId] = allocated[groupId].filter(x => x.soundId !== soundIdOrAudio);
    }

    groupId && !allocated[groupId].length && delete allocated[groupId];
    !unallocated.length && !Object.keys(allocated).length && delete this._resourceNodesMap[src];
  }

  /**
   * Removes inactive HTML5 audio nodes.
   */
  cleanUp() {
    const now = new Date();

    Object.keys(this._resourceNodesMap).forEach(src => {
      const nodes = this._resourceNodesMap[src],
        { unallocated, allocated } = nodes;

      Object.keys(allocated).forEach(groupId => {
        const inactiveNodes = allocated[groupId]
          .filter(x => x.soundId === null && ((now - x.time) / 1000 > this._inactiveTime * 60));

        allocated[groupId] = allocated[groupId].filter(x => inactiveNodes.indexOf(x) === -1);

        inactiveNodes.forEach(x => this._destroyNode(x.audio));
      });

      const inactiveNodes = unallocated.filter(x => ((now - x.time) / 1000 > this._inactiveTime * 60));
      nodes.unallocated = unallocated.filter(x => inactiveNodes.indexOf(x) === -1);

      inactiveNodes.forEach(x => this._destroyNode(x.audio));
    });
  }

  /**
   * Releases all the audio nodes.
   */
  dispose() {
    Object.keys(this._resourceNodesMap).forEach(src => this.releaseForSource(src));
  }

  /**
   * Returns true if there are free audio nodes available for a source or group.
   * @param {string} src The audio file url.
   * @param {number} [groupId] The group id.
   * @return {boolean}
   */
  hasFreeNodes(src, groupId) {
    if (!this._resourceNodesMap.hasOwnProperty(src)) {
      return false;
    }

    const nodes = this._resourceNodesMap[src],
      { unallocated, allocated } = nodes;

    return !groupId ? unallocated.length > 0 : allocated[groupId].filter(x => x.soundId === null).length > 0;
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
   * Checks and throws error if max audio nodes reached for the passed resource.
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

    if (!this._cleanUpCalled) {
      this.cleanUp();
      this._soundCleanUpCallback(src);
      this._cleanUpCalled = true;
      this._checkMaxNodesForSrc(src);
    }

    this._cleanUpCalled = false;

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
