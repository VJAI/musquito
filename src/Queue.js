/**
 * Stores queue of actions that has to be run before or after specific events.
 */
class Queue {

  _eventActions = {};

  /**
   * Queues the passed action to the event.
   * @param {string} eventName The event name.
   * @param {string} actionIdentifier The action identifier.
   * @param {function} action The action function.
   * @param {boolean} [removeAfterRun = true] Remove the action once it's run.
   */
  add(eventName, actionIdentifier, action, removeAfterRun = true) {
    if (!this.hasEvent(eventName)) {
      this._eventActions[eventName] = {};
    }

    this._eventActions[eventName][actionIdentifier] = { fn: action, removeAfterRun: removeAfterRun };
  }

  /**
   * Returns true if there is a event exists for the passed name.
   * @param {string} eventName The event name.
   * @return {boolean}
   */
  hasEvent(eventName) {
    return this._eventActions.hasOwnProperty(eventName);
  }

  /**
   * Returns true if the passed action is already queued-up.
   * @param {string} eventName The event name.
   * @param {string} actionIdentifier The action identifier.
   * @return {boolean}
   */
  hasAction(eventName, actionIdentifier) {
    if (!this.hasEvent(eventName)) {
      return false;
    }

    return this._eventActions[eventName].hasOwnProperty(actionIdentifier);
  }

  /**
   * Runs all the actions queued up for the passed event.
   * @param {string} eventName The event name.
   * @param {string} [actionIdentifier] The action identifier.
   */
  run(eventName, actionIdentifier) {
    if (!this.hasEvent(eventName)) {
      return;
    }

    if (typeof actionIdentifier !== 'undefined') {
      if (!this.hasAction(eventName, actionIdentifier)) {
        return;
      }

      this._run(eventName, actionIdentifier);

      return;
    }

    Object.keys(this._eventActions[eventName]).forEach(action => this._run(eventName, action));
  }

  /**
   * Removes the event or a queued action for the event.
   * @param {string} eventName The event name.
   * @param {string} [actionIdentifier] The action identifier.
   */
  remove(eventName, actionIdentifier) {
    if (!this._eventActions.hasOwnProperty(eventName)) {
      return;
    }

    if (!actionIdentifier) {
      delete this._eventActions[eventName];
      return;
    }

    delete this._eventActions[eventName][actionIdentifier];
  }

  /**
   * Clears all the stored events and the queued-up actions.
   */
  clear() {
    this._eventActions = {};
  }

  /**
   * Runs a single action.
   * @param {string} eventName The event name.
   * @param {string} actionIdentifier The action identifier.
   * @private
   */
  _run(eventName, actionIdentifier) {
    const queued = this._eventActions[eventName][actionIdentifier];
    queued.fn();
    queued.removeAfterRun && this.remove(eventName, actionIdentifier);
  }
}

export default Queue;
