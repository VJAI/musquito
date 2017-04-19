import Html5AudioPool from './Html5AudioPool';
import DownloadResult, { DownloadStatus } from './DownloadResult';

/**
 * Loads and the HTML5 audio nodes with resources and return them.
 * @class
 */
class MediaLoader {

  /**
   * HtmlAudioPool.
   * @type {Html5AudioPool}
   * @private
   */
  _audioPool = null;

  /**
   * Creates the audio pool.
   */
  constructor() {
    this._audioPool = new Html5AudioPool();
  }

  /**
   * Preload the HTML5 audio nodes with audio and return them.
   * @param {string|string[]} urls Single or array of audio file urls
   * @param {string=} id The sound id
   * @return {Promise<DownloadResult|Array<DownloadResult>>}
   */
  load(urls, id) {
    if (typeof urls === 'string') {
      return this._load(urls, id);
    }

    return Promise.all(urls.map(url => this._load(url, id)));
  }

  /**
   * Preload the HTML5 audio element with the passed audio file and allocate it to the passed sound (if any).
   * @param {string} url The audio file url
   * @param {string} id Sound id
   * @return {Promise}
   * @private
   */
  _load(url, id) {
    return new Promise((resolve, reject) => {
      const audio = this._audioPool.allocate(url, id);

      if (audio.readyState === 4) {
        resolve(new DownloadResult(url, audio));
        return;
      }

      const onCanPlayThrough = () => {
        audio.removeEventListener('canplaythrough', onCanPlayThrough);
        resolve(new DownloadResult(url, audio));
      };

      const onError = err => {
        audio.removeEventListener('error', onError);
        reject(new DownloadResult(url, null, err));
      };

      audio.addEventListener('canplaythrough', onCanPlayThrough);
      audio.addEventListener('error', onError);
      audio.src = url;
      audio.load();
    });
  }

  /**
   * Releases the allocated audio node(s).
   * @param {string|string[]=} urls Single or array of audio file urls
   * @param {string=} id Sound id
   */
  unload(urls, id) {
    if (Array.isArray(urls)) {
      urls.forEach(url => this._audioPool.release(url));
      return;
    }

    this._audioPool.release(urls, id);
  }

  /**
   * Dispose the pool.
   */
  dispose() {
    this._audioPool.dispose();
    this._audioPool = null;
  }
}

export { DownloadResult, DownloadStatus, MediaLoader as default };
