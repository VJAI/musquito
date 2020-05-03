import Html5AudioPool from './Html5AudioPool';
import DownloadResult from './DownloadResult';

/**
 * Loads the HTML5 audio nodes and returns them.
 * @class
 */
class MediaLoader {

  /**
   * HTML5 audio pool.
   * @type {Html5AudioPool}
   * @private
   */
  _audioPool = null;

  /**
   * Store the array of audio elements that are currently in buffering state.
   * @type {Array}
   * @private
   */
  _bufferingAudios = [];

  /**
   * True if the loader is disposed.
   * @type {boolean}
   * @private
   */
  _disposed = false;

  /**
   * Creates the audio pool.
   * @param {number} maxNodesPerSource Maximum number of audio nodes allowed for a url.
   * @param {number} inactiveTime The period after which HTML5 audio node is marked as inactive.
   * @param {function} soundCleanUpCallback The inactive sounds cleanup callback.
   */
  constructor(maxNodesPerSource, inactiveTime, soundCleanUpCallback) {
    this._audioPool = new Html5AudioPool(maxNodesPerSource, inactiveTime, soundCleanUpCallback);
  }

  /**
   * Preloads the HTML5 audio nodes with audio and return them.
   * @param {string|string[]} urls Single or array of audio file urls.
   * @return {Promise<DownloadResult|Array<DownloadResult>>}
   */
  load(urls) {
    if (typeof urls === 'string') {
      return this._load(urls);
    }

    return Promise.all(urls.map(url => this._load(url)));
  }

  /**
   * Allocates audio node for a group.
   * @param {string} url The audio file url.
   * @param {number} groupId The group id.
   * @return {Promise<DownloadResult>}
   */
  allocateForGroup(url, groupId) {
    return this._load(url, groupId);
  }

  /**
   * Allocates an audio node for sound and returns it.
   * @param {string} src The audio file url.
   * @param {number} groupId The buzz id.
   * @param {number} soundId The sound id.
   * @return {Audio}
   */
  allocateForSound(src, groupId, soundId) {
    return this._audioPool.allocateForSound(src, groupId, soundId);
  }

  /**
   * Releases the allocated audio node(s) for the passed urls.
   * @param {string|string[]} [urls] Single or array of audio file urls.
   */
  unload(urls) {
    const removeAudioObjOfUrl = url => {
      const audioObj = this._bufferingAudios.find(a => a.url === url);
      audioObj && this._cleanUp(audioObj);
    };

    if (!urls) {
      this._bufferingAudios.forEach(audioObj => this._cleanUp(audioObj));
      this._audioPool.release();
    } else if (typeof urls === 'string') {
      removeAudioObjOfUrl(urls);
      this._audioPool.releaseForSource(urls);
    } else if (Array.isArray(urls) && urls.length) {
      urls.forEach(url => {
        removeAudioObjOfUrl(url);
        this._audioPool.releaseForSource(url);
      });
    }
  }

  /**
   * Releases the allocated audio node for the passed group.
   * @param {string} url The audio file url.
   * @param {number} groupId The group id.
   */
  releaseForGroup(url, groupId) {
    this._bufferingAudios
      .filter(a => a.groupId === groupId)
      .forEach(a => this._cleanUp(a));

    this._audioPool.releaseForGroup(url, groupId);
  }

  /**
   * Destroys the audio node reserved for sound.
   * @param {string} src The audio file url.
   * @param {number} groupId The buzz id.
   * @param {number} soundId The sound id.
   */
  releaseForSound(src, groupId, soundId) {
    this._audioPool.releaseAudio(src, groupId, soundId);
  }

  /**
   * Returns if there are free audio nodes available for a group.
   * @param {string} src The audio file url.
   * @param {number} groupId The group id.
   * @return {boolean}
   */
  hasFreeNodes(src, groupId) {
    return this._audioPool.hasFreeNodes(src, groupId);
  }

  /**
   * Acquires the unallocated audio nodes and removes the excess ones.
   */
  cleanUp() {
    this._audioPool.cleanUp();
  }

  /**
   * Clear the event handlers of buffering audio elements and dispose the pool.
   */
  dispose() {
    if (this._disposed) {
      return;
    }

    [...this._bufferingAudios].forEach(audioObj => this._cleanUp(audioObj));
    this._bufferingAudios = null;
    this._audioPool.dispose();
    this._audioPool = null;
    this._disposed = true;
  }

  /**
   * Preload the HTML5 audio element with the passed audio file and allocate it to the passed sound (if any).
   * @param {string} url The audio file url.
   * @param {number} [groupId] The buzz id.
   * @return {Promise}
   * @private
   */
  _load(url, groupId) {
    return new Promise(resolve => {
      const audio = groupId ? this._audioPool.allocateForGroup(url, groupId) : this._audioPool.allocateForSource(url);

      const onCanPlayThrough = () => {
        if (this._disposed) {
          return;
        }

        const audioObj = this._bufferingAudios.find(obj => obj.audio === audio);
        audioObj && this._cleanUp(audioObj);
        resolve(new DownloadResult(url, audio));
      };

      const onError = (err) => {
        if (this._disposed) {
          return;
        }

        const audioObj = this._bufferingAudios.find(obj => obj.audio === audio);
        audioObj && this._cleanUp(audioObj);
        this._audioPool.releaseAudio(url, audio, groupId);
        resolve(new DownloadResult(url, null, err));
      };

      audio.addEventListener('canplaythrough', onCanPlayThrough);
      audio.addEventListener('error', onError);

      this._bufferingAudios.push({
        url: url,
        groupId: groupId,
        audio: audio,
        canplaythrough: onCanPlayThrough,
        error: onError
      });

      if (!audio.src) { // new audio element?
        audio.src = url;
        audio.load();
        return;
      }

      audio.currentTime = 0;

      if (audio.readyState >= 3) {
        onCanPlayThrough();
      }
    });
  }

  /**
   * Removes the event-handlers from the audio element.
   * @param {object} audioObj The buffering audio object.
   * @private
   */
  _cleanUp(audioObj) {
    ['canplaythrough', 'error'].forEach(evt => audioObj.audio.removeEventListener(evt, audioObj[audioObj]));
    this._bufferingAudios.splice(this._bufferingAudios.indexOf(audioObj), 1);
  }
}

export default MediaLoader;
