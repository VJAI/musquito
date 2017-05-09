import BufferCache from './BufferCache';
import DownloadResult, { DownloadStatus } from './DownloadResult';
import codecAid from './CodecAid';

/**
 * Loads the audio sources into audio buffers and returns them.
 * The loaded buffers are cached.
 * @class
 */
class BufferLoader {

  /**
   * AudioContext.
   * @type {AudioContext}
   * @private
   */
  _context = null;

  /**
   * In-memory audio buffer cache store.
   * @type {BufferCache}
   * @private
   */
  _bufferCache = null;

  /**
   * Create the cache.
   * @param {AudioContext} context The Audio Context
   */
  constructor(context) {
    this._context = context;
    this._bufferCache = new BufferCache();
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
   * Loads a single audio resource into audio buffer and cache result if the download is succeeded.
   * @param {string} url The Audio url
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load(url) {
    return new Promise(resolve => {
      if (this._bufferCache.hasBuffer(url)) {
        resolve(new DownloadResult(url, this._bufferCache.getBuffer(url)));
        return;
      }

      const reject = err => {
        resolve(new DownloadResult(url, null, err));
      };

      const decodeAudioData = (arrayBuffer) => {
        this._context.decodeAudioData(arrayBuffer).then(buffer => {
          this._bufferCache.setBuffer(url, buffer);
          resolve(new DownloadResult(url, buffer));
        }, reject);
      };

      if (codecAid.isBase64(url)) {
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

      req.addEventListener('load', () => {
        this._context.decodeAudioData(req.response).then(buffer => {
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
   * @param {string|string[]=} urls Single or array of audio urls
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

  /**
   * Removes the single cached audio buffer.
   * @param {string} url Audio url
   * @private
   */
  _unload(url) {
    this._bufferCache.removeBuffer(url);
  }

  /**
   * Dispose the loader.
   */
  dispose() {
    this._bufferCache.clearBuffers();
    this._bufferCache = null;
    this._context = null;
  }
}

export { DownloadResult, DownloadStatus, BufferLoader as default };
