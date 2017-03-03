class EventEmitter {

  constructor(events) {
    this._events = {};
    events.forEach(evt => this._events[evt] = []);
  }

  /**
   * Method to subscribe to an event.
   * @param {string} event
   * @param {function} fn
   * @param {boolean} [once = false]
   * @returns {EventEmitter}
   */
  on(event, fn, once) {
    if (!this._events.hasOwnProperty(event)) return this;
    if (typeof fn !== 'function') return this;

    this._events[event].push({fn: fn, once: once || false});

    return this;
  }

  /**
   * Method to un-subscribe from an event.
   * @param {string} event
   * @param {function} fn
   * @returns {EventEmitter}
   */
  off(event, fn) {
    if (!this._events.hasOwnProperty(event)) return this;
    if (typeof fn !== 'function') return this;

    var eventSubscribers = this._events[event];

    for (var i = 0; i < eventSubscribers.length; i++) {
      var eventSubscriber = eventSubscribers[i];
      if (eventSubscriber.fn === fn) {
        eventSubscribers.splice(i, 1);
        break;
      }
    }

    return this;
  }

  /**
   * Method to subscribe to an event only once.
   * @param {string} event
   * @param {function} fn
   * @returns {EventEmitter}
   */
  once(event, fn) {
    return this.on(event, fn, true);
  }

  /**
   * Fires an event passing the sound and other optional arguments.
   * @param {string} event
   * @param {object=} args
   * @returns {EventEmitter}
   */
  fire(event, obj, args) {
    var eventSubscribers = this._events[event];

    for (var i = 0; i < eventSubscribers.length; i++) {
      var eventSubscriber = eventSubscribers[i];

      setTimeout(function (subscriber) {
        subscriber.fn.call(obj, args);

        if (subscriber.once) {
          this.off(event, subscriber.fn);
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
