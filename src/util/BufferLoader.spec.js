import BufferLoader, {DownloadStatus} from './BufferLoader';

describe('BufferLoader', () => {

  let context;

  beforeAll(() => {
    context = new (AudioContext || webkitAudioContext)();
    console.log(context);
  });

  afterAll(() => {
    if(context) {
      context.close();
      context = null;
    }
  });

  describe('on constructed', () => {

    it('should have cache created', () => {
      const bufferLoader = new BufferLoader();
      expect(bufferLoader._bufferCache).toBeDefined();
    });
  });

  describe('when loading a single sound', () => {

    describe('from a valid source', () => {


      console.log(context);
      const url = 'base/sounds/beep.mp3',
        bufferLoader = new BufferLoader(),
        cache = bufferLoader._bufferCache,
        promise = bufferLoader.load(url, context);

      it('should return an object with url, value, status and empty error', (done) => {
        promise.then(() => {
          expect(result).toBe(url);

          done();
        });
      });

      it('should have the buffer cached', (done) => {
        promise.then(() => {
          expect(cache.hasBuffer(url)).toBe(true);
          expect(cache.getBuffer(url)).toBe(result.value);

          done();
        });
      });
    });

    describe('from an invalid source', () => {

      it('should return error', () => {

      });

      it('should not be cached', () => {

      });
    });
  });


});
