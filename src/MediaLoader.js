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
   */
  constructor() {
    this._audioPool = new Html5AudioPool();
  }

  /**
   * Preload the HTML5 audio nodes with audio and return them.
   * @param {string|string[]} urls Single or array of audio file urls
   * @param {string} [id] The sound id
   * @return {Promise<DownloadResult|Array<DownloadResult>>}
   */
  load(urls, id) {
    if (typeof urls === 'string') {
      return this._load(urls, id);
    }

    return Promise.all(urls.map(url => this._load(url)));
  }

  /**
   * Preload the HTML5 audio element with the passed audio file and allocate it to the passed sound (if any).
   * @param {string} url The audio file url
   * @param {string} [id] Sound id
   * @return {Promise}
   * @private
   */
  _load(url, id) {
    return new Promise(resolve => {
      const audio = this._audioPool.allocate(url, id);

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
        this._audioPool.destroy(audio, url);
        resolve(new DownloadResult(url, null, err));
      };

      audio.addEventListener('canplaythrough', onCanPlayThrough);
      audio.addEventListener('error', onError);

      this._bufferingAudios.push({
        url: url,
        id: id,
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

  /**
   * Releases the allocated audio node(s).
   * @param {string|string[]} [urls] Single or array of audio file urls.
   * @param {boolean} [onlyFree = true] Release only the un-allocated audio nodes.
   */
  unload(urls, onlyFree = true) {
    const removeAudioObjOfUrl = url => {
      const audioObj = this._bufferingAudios.find(a => a.url === url);
      audioObj && this._cleanUp(audioObj);
    };

    if (!urls) {
      [...this._bufferingAudios].forEach(audioObj => this._cleanUp(audioObj));
    } else if (typeof urls === 'string') {
      removeAudioObjOfUrl(urls);
    } else if (Array.isArray(urls) && urls.length) {
      urls.forEach(url => removeAudioObjOfUrl(url));
    }

    this._audioPool.release(urls, onlyFree);
  }

  /**
   * Release the allocated audio element for the sound.
   * @param {string} id The sound id.
   * @param {boolean} destroy True to destroy the audio node.
   */
  unloadForSound(id, destroy = false) {
    const audioObj = this._bufferingAudios.find(obj => obj.id === id);
    audioObj && this._cleanUp(audioObj);
    this._audioPool.releaseForSound(id, destroy);
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
}

export default MediaLoader;
