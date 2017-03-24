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
   * Stores the audio pool.
   * @param {Html5AudioPool} audioPool
   */
  constructor(audioPool) {
    this._audioPool = audioPool;
  }

  /**
   * Load the audio nodes and return them.
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
        return new DownloadResult(url, audio);
      });
      audio.addEventListener('error', err => {
        return new DownloadResult(url, null, err);
      });
      audio.src = url;
      audio.load();
    });
  }

  /**
   * TODO:
   * @param {string|string[]} urls
   * @param {string=} id
   * @return {Promise<DownloadResult>}
   */
  unload(urls, id) {
    this._audioPool.release(urls, id);
  }

  dispose() {
    this._audioPool.dispose();
    this._audioPool = null;
  }
}

export {DownloadResult, DownloadStatus, MediaLoader as default};
