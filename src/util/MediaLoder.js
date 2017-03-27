import Html5AudioPool from './Html5AudioPool';
import DownloadResult, {DownloadStatus} from './DownloadResult';

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
   * Preload the audio nodes with audio and return them.
   * @param {string|string[]} urls
   * @param {string=} id
   * @return {Promise<DownloadResult|Array<DownloadResult>>}
   */
  load(urls, id) {
    if(typeof urls === 'string') {
      return this._load(urls, id);
    }

    return Promise.all(urls.map(url => this._load(url, id)));
  }

  _load(url, id) {
    return new Promise((resolve, reject) => {
      const audio = this._audioPool.allocate(url, id);

      if(audio.readyState === 4) {
        resolve(new DownloadResult(url, audio));
        return;
      }

      audio.addEventListener('canplaythrough', () => {
        resolve(new DownloadResult(url, audio));
      });

      audio.addEventListener('error', err => {
        reject(new DownloadResult(url, null, err));
      });

      audio.src = url;
      audio.load();
    });
  }

  /**
   * Releases the allocated audio node(s).
   * @param {string|string[]=} urls
   * @param {string=} id
   */
  unload(urls, id) {
    if(Array.isArray(urls)) {
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

export {DownloadResult, DownloadStatus, MediaLoader as default};
