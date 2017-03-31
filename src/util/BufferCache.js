/**
 * An in-memory cache to cache audio buffers.
 * @class
 */
class BufferCache {

  /**
   * In-memory cache object.
   * @type {object}
   * @private
   */
  _cache = {};

  /**
   * Returns true if the buffer is available in cache.
   * @param {string} url The audio url
   * @return {boolean}
   */
  hasBuffer(url) {
    return this._cache.hasOwnProperty(url);
  }

  /**
   * Returns the cached buffer.
   * @param {string} url The audio url
   * @return {AudioBuffer}
   */
  getBuffer(url) {
    return this._cache[url];
  }

  /**
   * Stores the buffer.
   * @param {string} url The audio url
   * @param {AudioBuffer} buffer The audio buffer
   */
  setBuffer(url, buffer) {
    this._cache[url] = buffer;
  }

  /**
   * Removes the buffer.
   * @param {string} url The audio url
   */
  removeBuffer(url) {
    delete this._cache[url];
  }

  /**
   * Removes all the cached buffers.
   */
  clearBuffers() {
    this._cache = {};
  }

  /**
   * Returns the number of buffers in cache.
   * @return {Number}
   */
  count() {
    return Object.keys(this._cache).length;
  }
}

export default BufferCache;
