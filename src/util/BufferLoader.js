import BufferCache from './BufferCache';
import DownloadResult, {DownloadStatus} from './DownloadResult';

/**
 * Loads the audio sources into audio buffers and returns them.
 * The loaded buffers are cached.
 */
class BufferLoader {

  /**
   * AudioContext.
   * @type {AudioContext|null}
   * @private
   */
  _context = null;

  /**
   * In-memory audio buffer cache store.
   * @type {BufferCache|null}
   * @private
   */
  _bufferCache = null;

  /**
   * Create the cache.
   * @param {AudioContext} context
   */
  constructor(context) {
    this._context = context;
    this._bufferCache = new BufferCache();
  }

  /**
   * Loads single or multiple audio resources into audio buffers.
   * @param {string|string[]} urls
   * @param {boolean} [cache = true]
   * @return {Promise<DownloadResult|Array<DownloadResult>>}
   */
  load(urls, cache = true) {
    if (typeof urls === 'string') {
      return this._load(urls, cache);
    }

    return Promise.all(urls.map(url => this._load(url, cache)));
  }

  /**
   * Loads a single audio resource into audio buffer and cache result if the download is succeeded.
   * @param {string} url
   * @param {boolean} cache
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load(url, cache) {
    return new Promise(resolve => {

      if (this._bufferCache.hasBuffer(url)) {
        resolve(new DownloadResult(url, this._bufferCache.getBuffer(url)));
        return;
      }

      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';

      const reject = err => {
        resolve(new DownloadResult(url, null, err));
      };

      req.addEventListener('load', () => {
        this._context.decodeAudioData(req.response).then(buffer => {
          if(cache) {
            this._bufferCache.setBuffer(url, buffer);
          }
          resolve(new DownloadResult(url, buffer));
        }, reject);
      }, false);

      req.addEventListener('error', reject, false);
      req.send();
    });
  }

  /**
   * Removes the cached audio buffers.
   * @param {string|string[]=} urls
   */
  unload(urls) {
    if (typeof urls === 'string') {
      this._unload(urls);
      return;
    }

    if (Array.isArray(urls)) {
      urls.map(this._unload, this);
      return;
    }

    this._bufferCache.clearBuffers();
  }

  _unload(url) {
    this._bufferCache.removeBuffer(url);
  }

  dispose() {
    this.unload();
    this._bufferCache = null;
    this._context = null;
  }
}

export {DownloadResult, DownloadStatus, BufferLoader as default};
