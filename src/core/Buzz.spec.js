import Buzz, { BuzzState, AudioLoadState } from './Buzz';

describe('Buzz', () => {

  describe('when constructed', () => {

    describe('without passing source of the sound and sprite definition', () => {

      it('should throw error', () => {
        expect(() => new Buzz()).toThrow(new Error('You should pass the source of the audio'));
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
        expect(buzz._context).not.toBeNull();
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
            loop: true
          });

        expect(buzz._src).toBe(src);
        expect(buzz._volume).toBe(volume);
        expect(buzz._muted).toBe(muted);
        expect(buzz._loop).toBe(loop);
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
        expect(buzz._buffer).not.toBeNull();
        expect(buzz._duration).not.toBe(0);
      });

      it('The status should be set to loaded', () => {
        expect(buzz._loadStatus).toBe(AudioLoadState.Loaded);
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
        expect(buzz._loadStatus).toBe(AudioLoadState.Error);
      });
    });


  });


});
