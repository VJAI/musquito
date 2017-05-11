import BaseBuzz from './BaseBuzz';
import createBuzz from '../util/BuzzFactory';

/**
 * Represents a collection of buzzes.
 * @class
 */
class BuzzCollection {

  /**
   * Array of buzzes.
   * @type {Array<BaseBuzz>}
   * @private
   */
  _buzzes = [];

  /**
   * Creates the buzzes from the passed options.
   * @param {Array<BaseBuzz|object|string>=} buzzes Array of buzzes.
   */
  constructor(buzzes) {
    if (Array.isArray(buzzes)) {
      this._buzzes = buzzes.map(buzz => {
        if (buzz instanceof BaseBuzz) {
          return buzz;
        }

        return createBuzz(buzz);
      });
    }
  }

  /**
   * Adds a new buzz to the collection.
   * @param {BaseBuzz|object|string} buzz The buzz
   * @return {BuzzCollection}
   */
  add(buzz) {
    this._buzzes.push(buzz instanceof BaseBuzz ? buzz : createBuzz(buzz));
    return this;
  }

  /**
   * Removes the passed buzz from the collection.
   * @param {BaseBuzz} buzz The buzz
   * @return {BuzzCollection}
   */
  remove(buzz) {
    this._buzzes.splice(this.getIndex(buzz, 1));
    return this;
  }

  /**
   * Returns the index position of the passed buzz.
   * @param {BaseBuzz} buzz The buzz
   * @return {number}
   */
  getIndex(buzz) {
    return this._buzzes.indexOf(buzz);
  }

  /**
   * Returns the stored buzz in the index.
   * @param {number} index The index position.
   * @return {BaseBuzz}
   */
  getBuzz(index) {
    return this._buzzes[index];
  }

  /**
   * Loads the unloaded buzzes in the collection.
   * @return {BuzzCollection}
   */
  load() {
    return this;
  }

  /**
   * Plays all the buzzes in the collection.
   * @return {BuzzCollection}
   */
  play() {
    this._buzzes.forEach(buzz => buzz.play());
    return this;
  }

  /**
   * Pauses all the playing buzzes in the collection.
   * @return {BuzzCollection}
   */
  pause() {
    this._buzzes.forEach(buzz => buzz.pause());
    return this;
  }

  /**
   * Stops all the playing buzzes in the collection.
   * @return {BuzzCollection}
   */
  stop() {
    this._buzzes.forEach(buzz => buzz.stop());
    return this;
  }

  /**
   * Mutes all the buzzes in the collection.
   * @return {BuzzCollection}
   */
  mute() {
    this._buzzes.forEach(buzz => buzz.mute());
    return this;
  }

  /**
   * Unmutes all the buzzes in the collection.
   * @return {BuzzCollection}
   */
  unmute() {
    this._buzzes.forEach(buzz => buzz.unmute());
    return this;
  }

  /**
   * Set's the passed volume to all buzzes.
   * @param {number} volume Should be from 0.0 to 1.0.
   * @return {BuzzCollection}
   */
  volume(volume) {
    this._buzzes.forEach(buzz => buzz.volume(volume));
    return this;
  }

  /**
   * Destroys all the buzzes from the collection.
   * @return {BuzzCollection}
   */
  destroy() {
    this._buzzes.forEach(buzz => buzz.destroy());
    this._buzzes = [];
    return this;
  }
}

export { BuzzCollection as default };
