import buzzer from './Buzzer';
import { BuzzState } from './BaseBuzz';
import BufferBuzz from './BufferBuzz';

describe('BufferBuzz', () => {

  let audioBufferSourceNodeStart = null,
    audioBufferSourceNodeStop = null;

  beforeAll(() => {
    audioBufferSourceNodeStart = AudioBufferSourceNode.prototype.start;
    audioBufferSourceNodeStop = AudioBufferSourceNode.prototype.stop;

    AudioBufferSourceNode.prototype.start = () => {
    };
    AudioBufferSourceNode.prototype.stop = () => {
    };
  });

  afterAll(() => {
    // TODO: buzzer cleanup required?

    AudioBufferSourceNode.prototype.start = audioBufferSourceNodeStart;
    AudioBufferSourceNode.prototype.stop = audioBufferSourceNodeStop;
  });

  describe('on constructed', () => {

    describe('without passing src and dataUri', () => {

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

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({ src: 'base/sounds/beep.mp3' });
      });

      it('should not throw error and the object should get created', () => {
        expect(bufferBuzz).toBeDefined();
      });
    });

    describe('with passing only dataUri', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({ dataUri: 'base64-audio' });
      });

      it('should not throw error and the object should get created', () => {
        expect(bufferBuzz).toBeDefined();
      });
    });

    describe('with passing values for only the required parameters', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({ dataUri: 'base64-audio' });
      });

      it('should initialize the properties with the right values', () => {
        expect(bufferBuzz._id).toBeDefined();
        expect(bufferBuzz._dataUri).toBe('base64-audio');
        expect(bufferBuzz._volume).toBe(1.0);
        expect(bufferBuzz._loop).toBe(false);
        expect(bufferBuzz._muted).toBe(false);
        expect(bufferBuzz._preload).toBe(false);
        expect(bufferBuzz._autoplay).toBe(false);
      });
    });

    describe('with passing values for all the parameters', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({
          id: '12345',
          src: ['base/sounds/beep.mp3'],
          volume: 0.5,
          muted: true,
          loop: true
        });
      });

      it('should initialize the properties with the right values', () => {
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

      let bufferBuzz = null;

      it('should get loaded', done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3',
          onload: done
        });

        bufferBuzz.play();
      });
    });

    describe('when the sound is already loaded', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3',
          onload: done
        }).load();
      });

      it('should fire playstart event', done => {
        bufferBuzz.on('playstart', () => {
          bufferBuzz.stop();
          done();
        });
        bufferBuzz.play();
      });

      it('should fire playend event', done => {
        bufferBuzz.on('playend', () => {
          bufferBuzz.stop();
          done();
        });
        bufferBuzz.play();
      });

      it('reset the variables after played', () => {
        bufferBuzz.on('playend', () => {
          expect(bufferBuzz._startedAt).toBe(0);
          expect(bufferBuzz._elapsed).toBe(0);
          expect(bufferBuzz._endTimer).toBeNull();
          expect(bufferBuzz._bufferSource).toBeNull();
          expect(bufferBuzz._state).toBe(BuzzState.Ready);
        });

        bufferBuzz.play();
      });
    });

    describe('when the sound is already playing', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3',
          onplaystart: () => {
            spyOn(bufferBuzz, '_play');
            bufferBuzz.play();
            done();
          }
        }).play();
      });

      it('should not play the sound again', () => {
        expect(bufferBuzz._play).not.toHaveBeenCalled();
      });
    });

    describe('when the sound is paused', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/bg.mp3',
          onplaystart: () => {
            setTimeout(() => {
              bufferBuzz.pause();
              spyOn(bufferBuzz, '_play');
              bufferBuzz.play();
              done();
            }, 2000);
          }
        }).play();
      });

      it('should play the sound from the paused position', () => {
        expect(bufferBuzz._play).toHaveBeenCalledWith(bufferBuzz._elapsed);
      });
    });

    describe('when the sound is stopped', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/bg.mp3',
          onplaystart: () => {
            setTimeout(() => {
              bufferBuzz.stop();
              spyOn(bufferBuzz, '_play');
              bufferBuzz.play();
              done();
            }, 2000);
          }
        }).play();
      });

      it('should play the sound from start', () => {
        expect(bufferBuzz._play).toHaveBeenCalledWith(0);
      });
    });

    describe('after the sound is destroyed', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/bg.mp3',
          onplayend: () => bufferBuzz.destroy()
        }).play();
      });

      it('should throw error', () => {
        expect(bufferBuzz.play).toThrow();
      });
    });
  });

  describe('on calling pause', () => {

    describe('when the sound is not in playing state', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3'
        });

        spyOn(bufferBuzz._emitter, 'off');

        bufferBuzz.pause();
      });

      it('should remove the play handler', () => {
        expect(bufferBuzz._emitter.off).toHaveBeenCalledWith('load', bufferBuzz.play, undefined);
      });

      it('should not change the state of the sound', () => {
        expect(bufferBuzz._state).not.toBe(BuzzState.Paused);
      });
    });

    describe('when the sound is in playing state', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/bg.mp3',
          onplaystart: () => {
            setTimeout(() => {
              bufferBuzz.pause();
              done();
            }, 2000);
          }
        }).play();
      });

      it('should pause the sound', () => {
        expect(bufferBuzz._elapsed).not.toBe(0);
        expect(bufferBuzz._state).toBe(BuzzState.Paused);
      });
    });
  });

  describe('on calling stop', () => {

    describe('when the sound is not in playing/paused state', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3'
        });

        spyOn(bufferBuzz._emitter, 'off');

        bufferBuzz.stop();
      });

      it('should remove the play handler', () => {
        expect(bufferBuzz._emitter.off).toHaveBeenCalledWith('load', bufferBuzz.play, undefined);
      });

      it('should not change the state of the sound', () => {
        expect(bufferBuzz._state).not.toBe(BuzzState.Stopped);
      });
    });

    describe('when the sound is in playing state', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/bg.mp3',
          onplaystart: () => {
            bufferBuzz.stop();
            done();
          }
        }).play();
      });

      it('should stop the sound', () => {
        expect(bufferBuzz._state).toBe(BuzzState.Ready);
        expect(bufferBuzz._startedAt).toBe(0);
        expect(bufferBuzz._elapsed).toBe(0);
      });
    });

    describe('when the sound is in paused state', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/bg.mp3',
          onplaystart: () => {
            bufferBuzz.pause();
            done();
          }
        }).play();
      });

      it('should stop the sound', () => {
        bufferBuzz.stop();
        expect(bufferBuzz._state).toBe(BuzzState.Ready);
      });
    });
  });

  describe('on changing volume', () => {

    describe('before the sound is loaded', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3'
        });

        bufferBuzz.volume(0.5);
      });

      it('should change the volume', () => {
        expect(bufferBuzz._volume).toBe(0.5);
      });
    });

    describe('after the sound is loaded', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3',
          onload: () => {
            bufferBuzz.volume(0.5);
            done();
          }
        }).load();
      });

      it('should change the volume', () => {
        expect(bufferBuzz._volume).toBe(0.5);
      });
    });
  });

  describe('on calling mute', () => {

    describe('before the sound is loaded', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3'
        });

        bufferBuzz.mute();
      });

      it('should mute the sound', () => {
        expect(bufferBuzz._muted).toBe(true);
      });

      it('once the sound is loaded the gain node\'s value to be set to 0', done => {
        bufferBuzz.on('load', () => {
          expect(bufferBuzz._gainNode.gain.value).toBe(0);
          done();
        });
        bufferBuzz.load();
      });
    });

    describe('after the sound is loaded', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3',
          onload: () => {
            bufferBuzz.mute();
            done();
          }
        }).load();
      });

      it('should mute the sound', () => {
        expect(bufferBuzz._muted).toBe(true);
      });
    });
  });

  describe('on calling unmute', () => {

    describe('before the sound is loaded', () => {

      let bufferBuzz = null;

      beforeEach(() => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3'
        });

        bufferBuzz.mute();
      });

      it('should unmute the sound', () => {
        bufferBuzz.unmute();
        expect(bufferBuzz._muted).toBe(false);
      });

      it('once the sound is loaded the gain node\'s value to be set to volume', done => {
        bufferBuzz.on('load', () => {
          expect(bufferBuzz._gainNode.gain.value).toBe(bufferBuzz._volume);
          done();
        });
        bufferBuzz.load();
        bufferBuzz.unmute();
      });
    });

    describe('after the sound is loaded', () => {

      let bufferBuzz = null;

      beforeEach(done => {
        bufferBuzz = new BufferBuzz({
          src: 'base/sounds/beep.mp3',
          onload: () => {
            bufferBuzz.mute();
            bufferBuzz.unmute();
            done();
          }
        }).load();
      });

      it('should unmute the sound', () => {
        expect(bufferBuzz._muted).toBe(false);
      });
    });
  });

  describe('on calling destroy', () => {

  });
});
