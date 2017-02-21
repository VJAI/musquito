import Buzz, { BuzzState, AudioLoadState } from './Buzz';

describe('Buzz', () => {

  describe('when constructed', () => {

    describe('without passing source of the sound and sprite definition', () => {

      it('should throw error', () => {
        expect(() => new Buzz()).toThrow(new Error('Either you should pass "src" or "sprite"'));
      });
    });

    describe('with passing source and other required arguments', () => {

      it('should get constructed with variables initialized to right values', () => {
        const src = 'base/sounds/beep.mp3',
          volume = 1.0,
          buzz = new Buzz(src);

        expect(buzz).toBeDefined();
        expect(buzz.volume()).toBe(volume);
        expect(buzz.loadStatus()).toBe(AudioLoadState.NotLoaded);
        expect(buzz.state()).toBe(BuzzState.Constructed);
      });
    });
  });

  describe('when calling load', () => {

    describe('with valid source', () => {

      let buzz;

      beforeAll(done => {
        buzz = new Buzz({
          src: 'base/sounds/beep.mp3',
          preload: true,
          onload: done
        });
      });

      it('The buffer and duration should be set to right values', () => {
        expect(buzz.buffer()).not.toBeNull();
        expect(buzz.duration()).not.toBe(0);
      });

      it('The status should be set to loaded', () => {
        expect(buzz.loadStatus()).toBe(AudioLoadState.Loaded);
      });
    });

    describe('with invalid source', () => {

      let buzz;

      beforeAll(done => {
        buzz = new Buzz({
          src: 'base/sounds/notexist.mp3',
          preload: true,
          onerror: done
        });
      });

      it('The status should set to error', () => {
        expect(buzz.loadStatus()).toBe(AudioLoadState.Error);
      });
    });


  });


});
