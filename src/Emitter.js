/**
 * Singleton global event emitter.
 * @class
 */
class Emitter {

  /**
   * Dictionary that maps the objects with their events and handlers.
   * @type {object}
   * @private
   */
  _objectsEventsHandlersMap = {};

  /**
   * Subscribes to an event of the passed object.
   * @param {number} id The unique id of the object.
   * @param {string} eventName Name of the event
   * @param {function} handler The event-handler function
   * @param {boolean} [once = false] Is it one-time subscription or not?
   * @return {Emitter}
   */
  on(id, eventName, handler, once = false) {
    if (!this._hasObject(id)) {
      this._objectsEventsHandlersMap[id] = {};
    }

    const objEvents = this._objectsEventsHandlersMap[id];

    if (!objEvents.hasOwnProperty(eventName)) {
      objEvents[eventName] = [];
    }

    objEvents[eventName].push({
      handler: handler,
      once: once
    });

    return this;
  }

  /**
   * Un-subscribes from an event of the passed object.
   * @param {number} id The unique id of the object.
   * @param {string} eventName The event name.
   * @param {function} [handler] The handler function.
   * @return {Emitter}
   */
  off(id, eventName, handler) {
    if (!this._hasEvent(id, eventName)) {
      return this;
    }

    const objEvents = this._objectsEventsHandlersMap[id];

    if (!handler) {
      objEvents[eventName] = [];
    } else {
      objEvents[eventName] = objEvents[eventName].filter(eventSubscriber => {
        return eventSubscriber.handler !== handler;
      });
    }

    return this;
  }

  /**
   * Fires an event of the object passing the source and other optional arguments.
   * @param {number} id The unique id of the object.
   * @param {string} eventName The event name
   * @param {...*} args The arguments that to be passed to handler
   * @return {Emitter}
   */
  fire(id, eventName, ...args) {
    if (!this._hasEvent(id, eventName)) {
      return this;
    }

    let eventSubscribers = this._objectsEventsHandlersMap[id][eventName];

    for (let i = 0; i < eventSubscribers.length; i++) {
      let eventSubscriber = eventSubscribers[i];

      setTimeout(function (subscriber) {
        const { handler, once } = subscriber;

        handler(...args);

        if (once) {
          this.off(id, eventName, handler);
        }
      }.bind(this, eventSubscriber), 0);
    }

    return this;
  }

  /**
   * Clears the event handlers of the passed object.
   * @param {number} [id] The unique id of the object.
   * @return {Emitter}
   */
  clear(id) {
    if (!id) {
      this._objectsEventsHandlersMap = {};
      return this;
    }

    if (this._hasObject(id)) {
      delete this._objectsEventsHandlersMap[id];
    }

    return this;
  }

  /**
   * Returns true if the object is already registered.
   * @param {number} id The object id.
   * @return {boolean}
   * @private
   */
  _hasObject(id) {
    return this._objectsEventsHandlersMap.hasOwnProperty(id);
  }

  /**
   * Returns true if the passed object has an entry of the passed event.
   * @param {number} id The object id.
   * @param {string} eventName The event name.
   * @return {boolean}
   * @private
   */
  _hasEvent(id, eventName) {
    return this._hasObject(id) && this._objectsEventsHandlersMap[id].hasOwnProperty(eventName);
  }
}

export default new Emitter();
