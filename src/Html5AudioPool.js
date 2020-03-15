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
   * Allocates an audio node for particular source.
   * @param {string} src The audio url.
   * @return {Audio}
   */
  allocateForSource(src) {
    this._createSrc(src);

    const nodes = this._resourceAudioNodes[src],
      { allocated } = nodes;

    const audio = new Audio();
    allocated.push(audio);

    return audio;
  }

  /**
   * Allocates a HTML5 audio node to a particular resource and group.
   * @param {string} src The audio url.
   * @param {string} [groupId] The buzz group id.
   * @return {Audio}
   */
  allocateForGroup(src, groupId) {
    this._createGroup(src, groupId);

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
   * Allocates the pre-laoded HTML5 audio node to a sound.
   * @param {string} src The audio file url.
   * @param {string} groupId The group id.
   * @param {string} soundId The sound id.
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
      { allocated, unallocated } = nodes;

    allocated.forEach(x => this._destroyNode(x));

    Object.keys(unallocated).forEach(groupId => {
      unallocated[groupId].forEach(x => this._destroyNode(x.audio));
    });

    delete this._resourceAudioNodes[src];
  }

  /**
   * Releases all the audio nodes allocated for a group.
   * @param {string} src The audio file url.
   * @param {string} groupId The group id.
   */
  releaseForGroup(src, groupId) {
    const nodes = this._resourceAudioNodes[src],
      { allocated, unallocated } = nodes;

    const audioNodes = allocated[groupId].map(x => x.audio);
    nodes.unallocated = [...unallocated, ...audioNodes];
  }

  /**
   * Release the audio element that is allocated for the sound.
   * @param {string} src The audio file url.
   * @param {string} groupId The group id.
   * @param {string} soundId The sound id.
   */
  releaseForSound(src, groupId, soundId) {
    const nodes = this._resourceAudioNodes[src],
      { allocated } = nodes;

    const allocatedAudioObj = allocated[groupId].find(x => x.soundId === soundId);
    allocatedAudioObj.soundId = null;
    delete allocated[groupId];
  }

  /**
   * Releases all the audio nodes.
   */
  dispose() {
    Object.keys(this._resourceAudioNodes).forEach(src => this.release(src));
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
   * @param {string} groupId The group id.
   * @private
   */
  _createGroup(src, groupId) {
    this._createSrc(src);

    const nodes = this._resourceAudioNodes[src],
      { unallocated } = nodes;

    if (unallocated.hasOwnProperty(groupId)) {
      return;
    }

    unallocated[groupId] = [];
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
