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
   * @param {string|string[]} events Event names that are supported
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
   * @param {function|object} options Handler function or subscription options
   * @param {string=} options.key An unique key to sign the subscription
   * @param {function} options.handler Handler function
   * @param {object=} options.target Scope the handler should be invoked
   * @param {number=} options.priority Priority
   * @param {object|Array=} options.args Additional arguments that should be passed to the handler
   * @param {boolean=} [options.once = false] One-time listener or not
   * @returns {EventEmitter}
   */
  on(event, options) {
    if (!this._events.hasOwnProperty(event)) {
      return this;
    }

    if (typeof options !== 'function' && typeof options !== 'object') {
      return this;
    }

    if (typeof options === 'function') {
      this._events[event].push({
        handler: options,
        once: false
      });
    } else {
      this._events[event].push({
        key: options.key || null,
        handler: options.handler,
        target: options.target,
        args: options.args ? (Array.isArray(options.args) ? options.args : [options.args]) : [],
        priority: typeof options.priority === 'number' ? options.priority : 0,
        once: options.once || false
      });
    }

    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event The event name
   * @param {function} handler The handler function
   * @param {string=} key The subscription key
   * @param {object=} target Scope of the handler to be invoked
   * @returns {EventEmitter}
   */
  off(event, handler, key, target) {
    if (!this._events.hasOwnProperty(event) || (typeof keyOrHandler !== 'string' && typeof keyOrHandler !== 'function')) {
      return this;
    }

    this._events[event] = this._events[event].filter(eventSubscriber => {
      return eventSubscriber.handler !== handler ||
        (key ? eventSubscriber.key !== key : false) ||
        (target ? eventSubscriber.target !== target : false);
    });

    return this;
  }

  isSubscribed(event, handler, key, target) {
    return true;
  }

  /**
   * Fires an event passing the source and other optional arguments.
   * @param {string} event The event name
   * @param {...*} args The arguments that to be passed to handler
   * @returns {EventEmitter}
   */
  fire(event, ...args) {
    let eventSubscribers = this._events[event].sort((event1, event2) => event2.priority - event1.priority);

    for (let i = 0; i < eventSubscribers.length; i++) {
      let eventSubscriber = eventSubscribers[i];

      setTimeout(function (subscriber) {
        subscriber.handler.apply(subscriber.target, (subscriber.args || []).concat(args));

        if (subscriber.once) {
          this.off(event, subscriber.handler, subscriber.target);
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
