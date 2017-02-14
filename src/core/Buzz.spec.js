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
        expect(buzz._id).toBeDefined();
        expect(buzz._src).toBe(src);
        expect(buzz._volume).toBe(volume);
        expect(buzz._muted).toBe(false);
        expect(buzz._loop).toBe(false);
        expect(buzz._preload).toBe(false);
        expect(buzz._autoplay).toBe(false);
        expect(buzz._context).toBeDefined();
        expect(buzz._context).not.toBeNull();
        expect(buzz._gainNode).toBeDefined();
        expect(buzz._gainNode).not.toBeNull();
        expect(buzz._gainNode.gain.value).toBe(volume);
        expect(buzz._state).toBe(BuzzState.Constructed);
        expect(buzz._loadStatus).toBe(AudioLoadState.NotLoaded);
      });
    });

    describe('with passing source and other optional arguments', () => {

      it('should get constructed with variables initialized to right values', () => {
        const src = 'base/sounds/beep.mp3',
          formats = ['ogg', 'wav'],
          volume = 0.5,
          muted = true,
          loop = true,
          emptyFn = () => {},
          buzz = new Buzz({
            src: src,
            volume: volume,
            muted: true,
            loop: true,
            onload: emptyFn,
            onerror: emptyFn,
            onplaystart: emptyFn,
            onend: emptyFn,
            onstop: emptyFn,
            onpause: emptyFn
          });

        expect(buzz._src).toBe(src);
        expect(buzz._volume).toBe(volume);
        expect(buzz._muted).toBe(muted);
        expect(buzz._loop).toBe(loop);
        expect(buzz._subscribers.load[0].fn).toBe(emptyFn);
        expect(buzz._subscribers.error[0].fn).toBe(emptyFn);
        expect(buzz._subscribers.playstart[0].fn).toBe(emptyFn);
        expect(buzz._subscribers.end[0].fn).toBe(emptyFn);
        expect(buzz._subscribers.stop[0].fn).toBe(emptyFn);
        expect(buzz._subscribers.pause[0].fn).toBe(emptyFn);
      });
    });

    describe('with passing sprite definition', () => {

    });

    describe('without web audio available', () => {

    });
  });

  describe('when calling load', () => {

    describe('with valid source', () => {

    });

    describe('with invalid source', () => {

    });

    // More Cases...
  });


});
