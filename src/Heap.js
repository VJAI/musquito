/**
 * Represents a heap item.
 */
class HeapItem {

  /**
   * The sound object.
   * @type {Sound}
   */
  sound = null;

  /**
   * The group id.
   * @type {number|null}
   */
  groupId = null;

  /**
   * Set the group id and sound.
   * @param {number} groupId The group id.
   * @param {Sound} sound The sound instance.
   */
  constructor(groupId, sound) {
    this.groupId = groupId;
    this.sound = sound;
  }
}

/**
 * Represents a collection of sounds belong to an audio resource.
 */
class HeapItemCollection {

  /**
   * The audio source url.
   * @type {string|null}
   */
  url = null;

  /**
   * The collection of sound objects.
   * @type {object}
   */
  items = {};

  /**
   * Adds a new sound item to the collection.
   * @param {number} groupId The group id.
   * @param {Sound} sound The sound instance.
   */
  add(groupId, sound) {
    const soundId = sound.id().toString();

    if (this.items.hasOwnProperty(soundId)) {
      return;
    }

    this.items[soundId] = new HeapItem(groupId, sound);
  }

  /**
   * Removes the sounds.
   * @param {boolean} [idle = true] True to destroy only the idle sounds.
   * @param {number} [groupId] The group id.
   */
  free(idle = true, groupId) {
    Object.values(this.items).forEach(item => {
      const { sound, soundGroupId } = item;

      if(idle && (sound.isPlaying() || sound.isPaused())) {
        return;
      }

      if (!Boolean(groupId) || soundGroupId === groupId) {
        sound.destroy();
        delete this.items[sound.id()];
      }
    });
  }

  /**
   * Returns the sounds belong to the group or all the sounds in the collection.
   * @param {number} [groupId] The group id.
   * @return {Array<HeapItem>}
   */
  sounds(groupId) {
    const itemsArray = Object.values(this.items);
    const items = groupId ? itemsArray.filter(item => item.groupId === groupId) : itemsArray;
    return items.map(item => item.sound);
  }

  /**
   * Destroys all the sounds.
   */
  destroy() {
    Object.values(this.items).forEach(item => item.sound.destroy());
    this.items = {};
  }
}

/**
 * Stores all the created sounds.
 */
class Heap {

  /**
   * The sound collections.
   * @type {object}
   * @private
   */
  _collections = {};

  /**
   * Initialize stuff.
   */
  constructor() {
    this.free = this.free.bind(this);
  }

  /**
   * Adds a new sound to the respective collection.
   * @param {string} url The audio source url or base64 string.
   * @param {number} groupId The group id.
   * @param {Sound} sound The sound instance.
   */
  add(url, groupId, sound) {
    if (!this._collections.hasOwnProperty(url)) {
      this._collections[url] = new HeapItemCollection();
    }

    this._collections[url].add(groupId, sound);
  }

  /**
   * Returns the sound based on the id.
   * @param {number} id The sound id.
   */
  sound(id) {
    return this.sounds().find(sound => sound.id() === id);
  }

  /**
   * Returns the sounds belongs to a particular group or all of them.
   * @param {number} [groupId] The group id.
   * @return {Array}
   */
  sounds(groupId) {
    const sounds = [];
    Object.values(this._collections).forEach(col => sounds.push(...col.sounds(groupId)));
    return sounds;
  }

  /**
   * Removes sounds from the collections.
   * @param {boolean} [idle = true] True to destroy only the idle sounds.
   * @param {number} [groupId] The group id.
   */
  free(idle = true, groupId) {
    Object.values(this._collections).forEach(col => col.free(idle, groupId));
  }

  /**
   * Destroys all the sounds.
   */
  destroy() {
    Object.values(this._collections).forEach(col => col.destroy());
    this._collections = {};
  }
}

export default Heap;
