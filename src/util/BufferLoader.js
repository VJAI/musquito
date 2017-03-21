import BufferCache from './BufferCache';
import DownloadStatus from './DownloadStatus';

/**
 * Represents the success/failure download result of an audio resource.
 */
class BufferDownloadResult {

  /**
   * @param {string} url
   * @param {AudioBuffer=} value
   * @param {*=} error
   */
  constructor(url, value, error) {
    this.url = url;
    value && (this.value = value);
    error && (this.error = error);
    this.status = value ? DownloadStatus.Success : DownloadStatus.Failure;
  }
}

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
   * @param {boolean} [cache = false]
   * @return {Promise<BufferDownloadResult|Array<BufferDownloadResult>>}
   */
  load(urls, cache = false) {
    if (typeof urls === 'string') {
      return this._load(urls, cache);
    }

    return Promise.all(urls.map(url => this._load(url, cache)));
  }

  /**
   * Loads a single audio resource into audio buffer and cache result if the download is succeeded.
   * @param {string} url
   * @param {boolean} cache
   * @return {Promise<BufferDownloadResult>}
   * @private
   */
  _load(url, cache) {
    return new Promise(resolve => {

      if (this._bufferCache.hasBuffer(url)) {
        resolve(new BufferDownloadResult(url, this._bufferCache.getBuffer(url)));
        return;
      }

      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';

      const reject = err => {
        resolve(new BufferDownloadResult(url, null, err));
      };

      req.addEventListener('load', () => {
        this._context.decodeAudioData(req.response).then(buffer => {
          if(cache) {
            this._bufferCache.setBuffer(url, buffer);
          }
          resolve(new BufferDownloadResult(url, buffer));
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

export {BufferDownloadResult, DownloadStatus, BufferLoader as default};
