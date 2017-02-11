/**
 * Represents an in-memory cache store.
 */
class Cache {
  
  /**
   * Initializes the in-memory cache object.
   * @constructor
   */
  constructor() {
    this._cache = {};
  }
  
  /**
   * Stores the value in cache to the passed key.
   * @param {string} key
   * @param {*} value
   */
  store(key, value) {
    this._cache[key] = value;
  }
  
  /**
   * Returns the stored value for the key.
   * @param {string} key
   * @returns {*}
   */
  retrieve(key) {
    return this._cache[key];
  }
  
  /**
   * Removes the stored item for the key.
   * @param {string} key
   */
  remove(key) {
    delete this._cache[key];
  }
  
  /**
   * Returns the number of items in the cache.
   * @returns {number}
   */
  count() {
    return Object.keys(this._cache).length;
  }
  
  /**
   * Returns true if the item exist in the cache.
   * @param key
   * @returns {boolean}
   */
  exists(key) {
    return this._cache.hasOwnProperty(key);
  }
  
  /**
   * Removes all items from cache.
   */
  flush() {
    this._cache = {};
  }
}

const cache = new Cache();
export default cache;
