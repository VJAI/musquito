import BaseBuzz, { BuzzState } from './BaseBuzz';

/**
 * Plays auto-generated sounds that are passed as audio graphs.
 */
class GraphBuzz extends BaseBuzz {

  /**
   *
   * @param args
   * @return {*}
   * @private
   */
  _validate(args) {

    let options = {};

    return options;
  }

  /**
   * Plays the audio graph
   * @param {boolean} fireEvent True to fire event
   * @private
   */
  _play(fireEvent = true) {
    throw new Error('Not yet implemented');
  }

  /**
   * Pause the playing audio graph
   * @param {boolean} fireEvent True to fire event
   * @private
   */
  _pause(fireEvent = true) {
    throw new Error('Not yet implemented');
  }

  /**
   * Stop the playing audio graph
   * @param {boolean} fireEvent True to fire event
   * @private
   */
  _stop(fireEvent = true) {
    throw new Error('Not yet implemented');
  }

  /**
   * Set the playbackrate for the underlying graph.
   * @param {number} rate The playback rate
   * @private
   */
  _setRate(rate) {
    throw new Error('Not yet implemented');
  }

  /**
   * Returns the current position in the playback.
   * @protected
   */
  _getSeek() {
    throw new Error('Not yet implemented');
  }
}

export { GraphBuzz as default };
