/**
 * An in-memory cache class that is used to cache the loaded audio buffers.
 */
class BufferCache {

  /**
   * Initialize the cache object.
   */
  constructor() {
    this._cache = {};
  }

  /**
   * Returns true if the buffer for the url is available in cache.
   * @param {string} url
   * @return {boolean}
   */
  hasBuffer(url) {
    return this._cache.hasOwnProperty(url);
  }

  /**
   * Returns the cached buffer for the url.
   * @param {string} url
   * @return {AudioBuffer}
   */
  getBuffer(url) {
    return this._cache[url];
  }

  /**
   * Store the audio buffer.
   * @param {string} url
   * @param {AudioBuffer} buffer
   */
  setBuffer(url, buffer) {
    this._cache[url] = buffer;
  }

  /**
   * Remove the cached buffer of the url.
   * @param {string} url
   */
  removeBuffer(url) {
    delete this._cache[url];
  }

  /**
   * Remove all the cached buffers.
   */
  clearBuffers() {
    this._cache = {};
  }

  /**
   * Returns the no. of buffers in cache.
   * @return {Number}
   */
  count() {
    return Object.keys(this._cache).length;
  }
}

/**
 * Enum to represent the download status of audio resource.
 * @enum {number}
 */
const DownloadStatus = {
  Success: 1,
  Failure: 0
};

/**
 * Represents the success/failure download result of an audio resource.
 */
class DownloadResult {

  /**
   * @constructor
   * @param {string} url
   * @param {AudioBuffer} value
   * @param {*} error
   */
  constructor(url, value, error) {
    this.url = url;
    value && (this.value = value);
    error && (this.error = error);
    this.status = value ? DownloadStatus.Success : DownloadStatus.Failure;
  }
}

/**
 * The class that downloads the audio files, load them into audio buffers, cache them and returns.
 */
class BufferLoader {

  /**
   * @constructor
   * @param cache
   */
  constructor(cache) {
    this._bufferCache = cache || new BufferCache();
  }

  /**
   * Loads a single or multiple audio resources into audio buffers.
   * @param {string|string[]} urls
   * @param {AudioContext} context
   * @return {Promise}
   */
  load(urls, context) {
    if (typeof urls === 'string') {
      return this._load(urls, context);
    }

    return Promise.all(urls.map(url => this._load(url, context)));
  }

  /**
   * Loads a single audio resource into audio buffer and cache result if the download is succeeded.
   * @param {string} url
   * @param {AudioContext} context
   * @return {Promise}
   * @private
   */
  _load(url, context) {
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
        context.decodeAudioData(req.response).then(buffer => {
          this._bufferCache.setBuffer(url, buffer);
          resolve(new DownloadResult(url, buffer));
        }, reject);
      }, false);

      req.addEventListener('error', reject, false);
      req.send();
    });
  }

  /**
   * Removes the cached audio buffers.
   * @param {string|string[]} urls
   */
  unload(urls) {
    if (typeof urls === "string") {
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
}

const bufferLoader = new BufferLoader();
export {BufferCache, DownloadResult, DownloadStatus, bufferLoader as default};
