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
   * Allocates a HTML5 audio node to a particular resource and group.
   * @param {string} src The audio url.
   * @param {string} [groupId] The buzz group id.
   * @return {Audio}
   */
  allocateForGroup(src, groupId) {
    let nodes = this._resourceAudioNodes[src];

    this._resourceAudioNodes[src] = nodes || (nodes = {
      unallocated: [],
      allocated: {}
    });

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

  /**
   * Allocates the pre-laoded HTML5 audio node to a sound.
   * @param {string} src The audio file url.
   * @param {string} groupId The group id.
   * @param {string} soundId The sound id.
   * @return {Audio}
   */
  allocateForSound(src, groupId, soundId) {
    const nodes = this._resourceAudioNodes[src],
      { allocated } = nodes;

    if (!allocated.hasOwnProperty(groupId)) {
      throw new Error(`No audio nodes allocated for the group ${groupId}`);
    }

    const notAllocatedAudioObj = allocated[groupId].find(x => x.soundId === null);
    notAllocatedAudioObj.soundId = soundId;

    return notAllocatedAudioObj.audio;
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
   * Releases all the audio nodes created for a resource.
   * @param {string} src The audio url.
   */
  release(src) {
    const nodes = this._resourceAudioNodes[src],
      { allocated, unallocated } = nodes;

    allocated.forEach(x => this._destroyNode(x));

    Object.keys(unallocated).forEach(groupId => {
      unallocated[groupId].forEach(x => this._destroyNode(x.audio));
    });

    delete this._resourceAudioNodes[src];
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
   * Releases all the audio nodes.
   */
  dispose() {
    Object.keys(this._resourceAudioNodes).forEach(src => this.release(src));
  }
}

export default Html5AudioPool;
