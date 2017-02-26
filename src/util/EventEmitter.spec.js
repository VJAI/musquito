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

  describe('on subscribing to event', () => {

    let listener = () => {};

    beforeAll(() => {
      eventEmitter.on('load', listener);
    });

    afterAll(() => {
      eventEmitter.clear();
    });

    it('should store the listener to the event subscribers array', () => {
      expect(eventEmitter._events['load']).toEqual([{ fn: listener, once: false}]);
    });
  });

  describe('on un-subscribing from event', () => {

    let listener = () => {};

    beforeAll(() => {
      eventEmitter.on('load', listener);
    });

    afterAll(() => {
      eventEmitter.clear();
    });

    it('should remove the listener from the array', () => {
      eventEmitter.off('load', listener);
      expect(eventEmitter._events['load']).toEqual([]);
    });
  });

  describe('on firing event', () => {

    let listener = {
      cb: () => {}
    };

    beforeAll(() => {
      spyOn(listener, 'cb');
      eventEmitter.on('error', listener.cb);
      eventEmitter.on('error', () => {}, true);
      eventEmitter.fire('error', listener);
    });

    afterAll(() => {
      eventEmitter.clear();
    });

    it('the registered listeners should get called', (done) => {
      setTimeout(() => {
        expect(listener.cb).toHaveBeenCalled();
        done();
      }, 500);
    });

    it('the one-time registered listeners should be removed', () => {
      expect(eventEmitter._events['error'].length).toBe(1);
    });
  });
});
