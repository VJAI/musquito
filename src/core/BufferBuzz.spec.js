import buzzer from './Buzzer';
import {BuzzState} from './BaseBuzz';
import BufferBuzz from './BufferBuzz';

describe('BufferBuzz', () => {

  describe('on constructed', () => {

    describe('wihout passing src and dataUri', () => {

      it('should throw error', () => {
        expect(() => new BufferBuzz()).toThrow(new Error('You should pass the source for the audio.'));
      });
    });

    describe('with passing an empty array', () => {

      it('should throw error', () => {
        expect(() => new BufferBuzz({ src: [] })).toThrow(new Error('You should pass the source for the audio.'));
      });
    });

    describe('with passing src', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz('base/sounds/beep.mp3');
      });

      it('should not throw error and the object should get created', () => {
        expect(bufferBuzz).toBeDefined();
      });

      it('should have the state as constructed', () => {
        expect(bufferBuzz._state).toBe(BuzzState.Constructed);
      });
    });

    describe('with passing array with values', () => {

      it('should not throw error and the object should get created', () => {
        const bufferBuzz = new BufferBuzz({ src: 'base/sounds/beep.mp3' });
        expect(bufferBuzz).toBeDefined();
      });
    });

    describe('with passing only dataUri', () => {

      it('should not throw error and the object should get created', () => {
        const bufferBuzz = new BufferBuzz({ dataUri: 'base64-audio' });
        expect(bufferBuzz).toBeDefined();
      });
    });

    describe('with passing values for only the required parameters', () => {

      it('should initialize the properties with the right values', () => {
        const bufferBuzz = new BufferBuzz({ dataUri: 'base64 string' });

        expect(bufferBuzz._id).toBeDefined();
        expect(bufferBuzz._dataUri).toBe('base64 string');
        expect(bufferBuzz._volume).toBe(1.0);
        expect(bufferBuzz._loop).toBe(false);
        expect(bufferBuzz._muted).toBe(false);
        expect(bufferBuzz._preload).toBe(false);
        expect(bufferBuzz._autoplay).toBe(false);
      });
    });

    describe('with passing values for all the parameters', () => {

      it('should initialize the properties with the right values', () => {
        const bufferBuzz = new BufferBuzz({
          id: '12345',
          src: ['base/sounds/beep.mp3'],
          volume: 0.5,
          muted: true,
          loop: true
        });

        expect(bufferBuzz._id).toBe('12345');
        expect(bufferBuzz._src).toEqual(['base/sounds/beep.mp3']);
        expect(bufferBuzz._volume).toBe(0.5);
        expect(bufferBuzz._muted).toBe(true);
        expect(bufferBuzz._loop).toBe(true);
      });
    });
  });

  describe('on calling load', () => {

    describe('with non-exist source passed', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/notexist.mp3',
          onerror: done
        });

        bufferBuzz.load();
      });

      it('should change the state to error', () => {
        expect(bufferBuzz._state).toBe(BuzzState.Error);
      });
    });

    describe('with not-supported source passed', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.unknown',
          onerror: done
        });

        bufferBuzz.load();
      });

      it('should change the state to error', () => {
        expect(bufferBuzz._state).toBe(BuzzState.Error);
      });
    });

    describe('with valid source passed', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3',
          onload: done
        });

        bufferBuzz.load();
      });

      it('should change the state to ready', () => {
        expect(bufferBuzz._state).toBe(BuzzState.Ready);
      });

      it('should store the buffer and duration', () => {
        expect(bufferBuzz._duration).not.toBe(0);
        expect(bufferBuzz._buffer).not.toBeNull();
      });
    });
  });

  describe('on calling play', () => {

    describe('when the sound is not loaded', () => {

      it('the sound get loaded', () => {

      });

      it('should fire playstart event', () => {

      });

      it('should fire playend event', () => {

      });

      it('reset the variables after played', () => {

      });
    });

    describe('when the sound is already loaded', () => {

      it('should fire playstart event', () => {

      });

      it('should fire playend event', () => {

      });

      it('reset the variables after played', () => {

      });
    });

    describe('when the sound is already playing', () => {

      it('should not play the sound again', () => {

      });
    });

    describe('when the sound is paused', () => {

      it('should play the sound from the paused position', () => {

      });
    });

    describe('when the sound is stopped', () => {

      it('should play the sound from start', () => {

      });
    });

    describe('when the sound is destroyed', () => {

      it('should throw error', () => {

      });
    });
  });

  describe('on calling pause', () => {

    describe('before the sound is loaded', () => {

    });

    describe('when the sound is not in playing state', () => {

    });

    describe('when the sound is in playing state', () => {

    });

    describe('when the sound is destroyed', () => {

    });
  });

  describe('on calling stop', () => {

    describe('before the sound is loaded', () => {

    });

    describe('when the sound is not in playing/paused state', () => {

    });

    describe('when the sound is in playing state', () => {

    });

    describe('when the sound is in paused state', () => {

    });

    describe('when the sound is destroyed', () => {

    });
  });

  describe('on changing volume', () => {

    describe('before the sound is loaded', () => {

    });

    describe('after the sound is loaded', () => {

    });
  });

  describe('on calling mute', () => {

    describe('before the sound is loaded', () => {

    });
  });

  describe('on calling unmute', () => {

  });

  describe('on calling destroy', () => {

  });
});
