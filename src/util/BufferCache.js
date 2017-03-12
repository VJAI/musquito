/**
 * An in-memory cache to cache audio buffers.
 */
class BufferCache {
  
  /**
   * Initialize the in-memory cache object. The key is the url and the value is the buffer.
   */
  constructor() {
    this._cache = {};
  }
  
  /**
   * Returns true if the buffer is available in cache.
   * @param {string} url
   * @return {boolean}
   */
  hasBuffer(url) {
    return this._cache.hasOwnProperty(url);
  }
  
  /**
   * Returns the cached buffer.
   * @param {string} url
   * @return {AudioBuffer}
   */
  getBuffer(url) {
    return this._cache[url];
  }
  
  /**
   * Stores the buffer.
   * @param {string} url
   * @param {AudioBuffer} buffer
   */
  setBuffer(url, buffer) {
    this._cache[url] = buffer;
  }
  
  /**
   * Removes the buffer.
   * @param {string} url
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
