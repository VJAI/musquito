import EventEmitter from './EventEmitter';

describe('EventEmitter', () => {

  let eventEmitter;

  beforeAll(() => {
    eventEmitter = new EventEmitter(['load', 'error']);
  });

  afterAll(() => {
    eventEmitter.clear();
  });

  describe('on constructed with passing event names', () => {

    it('should initialize an events object with keys as event names', () => {
      expect(eventEmitter._events).toEqual({ 'load': [], 'error': [] });
    });
  });

  describe('on subscribing to an event', () => {

    const listener = () => {};

    describe('with that event name not exists', () => {

      beforeAll(() => {
        eventEmitter.on('unload', listener);
      });

      afterAll(() => {
        eventEmitter.clear();
      });

      it('should not store the listener', () => {
        expect(eventEmitter._events['unload']).toBeUndefined();
      });
    });

    describe('by passing only the handler function', () => {

      beforeAll(() => {
        eventEmitter.on('load', listener);
      });

      afterAll(() => {
        eventEmitter.clear();
      });

      it('should store the listener', () => {
        expect(eventEmitter._events['load']).toEqual([{ handler: listener, once: false }]);
      });
    });

    describe('by passing the handler function and other parameters', () => {

      const target = {}, args = 'test';

      beforeAll(() => {
        eventEmitter.on('load', { handler: listener, target: target, args: args, once: true });
      });

      afterAll(() => {
        eventEmitter.clear();
      });

      it('should store the listener along with other parameters', () => {
        expect(eventEmitter._events['load']).toEqual([{ handler: listener, target: target, args: [args], once: true }]);
      });
    });
  });

  describe('on un-subscribing from an event', () => {

    describe('by passing only the handler', () => {

      const listener1 = { cb: () => {} }, listener2 = () => {};

      beforeAll(() => {
        eventEmitter.on('load', listener1.cb);
        eventEmitter.on('load', { handler: listener1.cb, target: listener1 });
        eventEmitter.on('load', listener2);
      });

      afterAll(() => {
        eventEmitter.clear();
      });

      it('should remove the matched listeners from the array', () => {
        eventEmitter.off('load', listener1.cb);
        expect(eventEmitter._events['load'].length).toEqual(1);
      });
    });

    describe('by passing both the handler and the target', () => {

      const listener = {
        cb: () => {}
      };

      beforeAll(() => {
        eventEmitter.on('load', { handler: listener.cb });
        eventEmitter.on('load', { handler: listener.cb, target: listener });
      });

      afterAll(() => {
        eventEmitter.clear();
      });

      it('should remove only the handlers that are bound to that target', () => {
        eventEmitter.off('load', listener.cb, listener);
        expect(eventEmitter._events['load'].length).toEqual(1);
      });
    });
  });

  describe('on firing event', () => {

    let listener = {
      cb: (arg) => {}
    };

    beforeAll(() => {
      spyOn(listener, 'cb').and.callThrough();
      eventEmitter.on('error', { handler: listener.cb, target: listener, args: 'test' });
      eventEmitter.on('error', { handler: () => {}, once: true });
      eventEmitter.fire('error', 'test1');
    });

    afterAll(() => {
      eventEmitter.clear();
    });

    it('the registered listeners should get called with the passed scope and arguments', (done) => {
      setTimeout(() => {
        expect(listener.cb).toHaveBeenCalled();
        expect(listener.cb.calls.argsFor(0)).toEqual(['test', 'test1']);
        done();
      }, 500);
    });

    it('the one-time registered listeners should be removed', () => {
      expect(eventEmitter._events['error'].length).toBe(1);
    });
  });
});
