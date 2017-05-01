/**
 * An event emitter.
 * @class
 */
class EventEmitter {

  /**
   * Events and handlers map.
   * @type {object}
   * @private
   */
  _events = {};

  /**
   * Initialize the private variables.
   * @param {string|string[]} events Events that are supported
   */
  constructor(events) {
    const eventNames = Array.isArray(events) ? events : events.split(',');
    eventNames.forEach(evt => {
      this._events[evt] = [];
    });
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event Name of the event
   * @param {function} handler The event-handler function
   * @param {boolean=} [once = false] Is it one-time subscription or not
   * @returns {EventEmitter}
   */
  on(event, handler, once = false) {
    if (!this._events.hasOwnProperty(event) || typeof handler !== 'function') {
      return this;
    }

    this._events[event].push({
      handler: handler,
      once: once
    });

    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event The event name
   * @param {function} handler The handler function
   * @returns {EventEmitter}
   */
  off(event, handler) {
    if (!this._events.hasOwnProperty(event) || typeof handler !== 'function') {
      return this;
    }

    this._events[event] = this._events[event].filter(eventSubscriber => {
      return eventSubscriber.handler !== handler;
    });

    return this;
  }

  /**
   * Fires an event passing the source and other optional arguments.
   * @param {string} event The event name
   * @param {...*} args The arguments that to be passed to handler
   * @returns {EventEmitter}
   */
  fire(event, ...args) {
    let eventSubscribers = this._events[event];

    for (let i = 0; i < eventSubscribers.length; i++) {
      let eventSubscriber = eventSubscribers[i];

      setTimeout(function (subscriber) {
        subscriber.handler(args);

        if (subscriber.once) {
          this.off(event, subscriber.handler);
        }
      }.bind(this, eventSubscriber), 0);
    }

    return this;
  }

  /**
   * Removes all the event handlers.
   */
  clear() {
    Object.keys(this._events).forEach(evt => {
      this._events[evt] = [];
    });
  }
}

export default EventEmitter;
