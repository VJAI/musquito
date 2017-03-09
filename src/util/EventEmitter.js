class EventEmitter {

  constructor(events) {
    this._events = {};
    const eventNames = Array.isArray(events) ? events : events.split(',');
    eventNames.forEach(evt => this._events[evt] = []);
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event
   * @param {function|object} options
   * @param {function} options.handler
   * @param {object=} options.target
   * @param {object|Array=} options.args
   * @param {boolean=} [options.once = false]
   * @returns {EventEmitter}
   */
  on(event, options) {
    if (!this._events.hasOwnProperty(event)) {
      return this;
    }

    if(typeof options !== 'function' && typeof options !== 'object') {
      return this;
    }

    if(typeof options === 'function') {
      this._events[event].push({
        handler: options,
        once: false
      });
    } else {
      this._events[event].push({
        handler: options.handler,
        target: options.target,
        args: options.args ? (Array.isArray(options.args) ? options.args : [options.args]) : [],
        once: options.once || false
      });
    }

    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event
   * @param {function} handler
   * @param {object=} target
   * @returns {EventEmitter}
   */
  off(event, handler, target) {
    if (!this._events.hasOwnProperty(event) || typeof handler !== 'function') {
      return this;
    }

    this._events[event] = this._events[event].filter(eventSubscriber => {
      return eventSubscriber.handler !== handler || (target ? eventSubscriber.target !== target : false);
    });

    return this;
  }

  /**
   * Fires an event passing the source and other optional arguments.
   * @param {string} event
   * @param {...*} args
   * @returns {EventEmitter}
   */
  fire(event, ...args) {
    var eventSubscribers = this._events[event];

    for (var i = 0; i < eventSubscribers.length; i++) {
      var eventSubscriber = eventSubscribers[i];

      setTimeout(function (subscriber) {
        subscriber.handler.apply(subscriber.target, (subscriber.args || []).concat(args));

        if (subscriber.once) {
          this.off(event, subscriber.handler, subscriber.target);
        }
      }.bind(this, eventSubscriber), 0);
    }

    return this;
  }

  clear() {
    Object.keys(this._events).forEach(evt => this._events[evt] = []);
  }
}

export default EventEmitter;
