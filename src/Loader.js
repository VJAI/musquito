import utility from './Utility';

/**
 * Enum to represent the download status of audio resource.
 * @enum {string}
 */
const DownloadStatus = {
  Success: 'success',
  Failure: 'error'
};

/**
 * Represents the download result of an audio.
 * @class
 */
class DownloadResult {

  /**
   * The url of the audio resource
   * @type {string|null}
   */
  url = null;

  /**
   * AudioBuffer or Html5Audio element
   * @type {AudioBuffer|Audio}
   */
  value = null;

  /**
   * Download error
   * @type {any}
   */
  error = null;

  /**
   * Success or failure status of download.
   * @type {DownloadStatus}
   */
  status = null;

  /**
   * @param {string|null} url The url of the audio resource
   * @param {AudioBuffer|Audio} [value] AudioBuffer or Html5Audio element
   * @param {*} [error] Download error
   */
  constructor(url, value, error) {
    this.url = url;
    this.value = value;
    this.error = error || null;
    this.status = error ? DownloadStatus.Failure : DownloadStatus.Success;
  }
}

/**
 * Loads the audio sources into audio buffers and returns them.
 * The loaded buffers are cached.
 * @class
 */
class Loader {

  /**
   * AudioContext.
   * @type {AudioContext}
   * @private
   */
  _context = null;

  /**
   * In-memory audio buffer cache store.
   * @type {object}
   * @private
   */
  _bufferCache = {};

  /**
   * Dictionary to store the current progress calls and their callbacks.
   * @type {object}
   * @private
   */
  _progressCallsAndCallbacks = {};

  /**
   * True if the loader is disposed.
   * @type {boolean}
   * @private
   */
  _disposed = false;

  /**
   * Create the cache.
   * @param {AudioContext} context The Audio Context
   */
  constructor(context) {
    this._context = context;
  }

  /**
   * Loads single or multiple audio resources into audio buffers.
   * @param {string|string[]} urls Single or array of audio urls
   * @return {Promise<DownloadResult|Array<DownloadResult>>}
   */
  load(urls) {
    if (typeof urls === 'string') {
      return this._load(urls);
    }

    return Promise.all(urls.map(url => this._load(url)));
  }

  /**
   * Removes the cached audio buffers.
   * @param {string|string[]} [urls] Single or array of audio urls
   */
  unload(urls) {
    if (typeof urls === 'string') {
      this._unload(urls);
      return;
    }

    if (Array.isArray(urls)) {
      urls.forEach(url => this._unload(url), this);
      return;
    }

    this._bufferCache = {};
  }

  /**
   * Dispose the loader.
   */
  dispose() {
    if (this._disposed) {
      return;
    }

    this.unload();
    this._bufferCache = {};
    this._progressCallsAndCallbacks = null;
    this._context = null;
    this._disposed = true;
  }

  /**
   * Loads a single audio resource into audio buffer and cache result if the download is succeeded.
   * @param {string} url The Audio url
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load(url) {
    return new Promise(resolve => {
      if (this._bufferCache.hasOwnProperty(url)) {
        resolve(new DownloadResult(url, this._bufferCache[url]));
        return;
      }

      if (this._progressCallsAndCallbacks.hasOwnProperty(url)) {
        this._progressCallsAndCallbacks[url].push(resolve);
        return;
      }

      this._progressCallsAndCallbacks[url] = [];
      this._progressCallsAndCallbacks[url].push(resolve);

      const reject = err => {
        if (this._disposed) {
          return;
        }

        this._progressCallsAndCallbacks[url].forEach(r => r(new DownloadResult(url, null, err)));
        delete this._progressCallsAndCallbacks[url];
      };

      const decodeAudioData = arrayBuffer => {
        if (this._disposed) {
          return;
        }

        this._context.decodeAudioData(arrayBuffer, buffer => {
          this._bufferCache[url] = buffer;
          this._progressCallsAndCallbacks[url].forEach(r => r(new DownloadResult(url, buffer)));
          delete this._progressCallsAndCallbacks[url];
        }, reject);
      };

      if (utility.isBase64(url)) {
        const data = atob(url.split(',')[1]);
        const dataView = new Uint8Array(data.length); // eslint-disable-line no-undef

        for (let i = 0; i < data.length; ++i) {
          dataView[i] = data.charCodeAt(i);
        }

        decodeAudioData(dataView);
        return;
      }

      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';

      req.addEventListener('load', () => decodeAudioData(req.response), false);
      req.addEventListener('error', reject, false);
      req.send();
    });
  }

  /**
   * Removes the single cached audio buffer.
   * @param {string} url Audio url
   * @private
   */
  _unload(url) {
    delete this._bufferCache[url];
  }
}

export { Loader as default, DownloadResult, DownloadStatus };
