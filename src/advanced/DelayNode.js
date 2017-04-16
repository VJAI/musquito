import BaseNode from './BaseNode';

/**
 * Node that creates a delay.
 * @class
 */
class DelayNode extends BaseNode {

  /**
   * Delay duration in seconds.
   * @type {number}
   * @private
   */
  _delay = 0;

  /**
   * Initialize the delay.
   * @param {number} delay Duration in seconds
   */
  constructor(delay) {
    super();
    this._delay = delay;
  }

  /**
   * Executed the node's behavior.
   * @return {Promise}
   * @private
   */
  _execute() {
    return new Promise(resolve => {
      setTimeout(resolve, this._delay * 1000);
    });
  }
}

export { DelayNode as default };
