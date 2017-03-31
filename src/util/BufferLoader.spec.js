import BufferLoader, { DownloadStatus } from './BufferLoader';

describe('BufferLoader', () => {

  let context = null, bufferLoader = null;

  beforeAll(() => {
    context = new (AudioContext || webkitAudioContext)();
  });

  afterAll(() => {
    if (context) {
      context.close();
      context = null;
    }
  });

  beforeEach(() => {
    bufferLoader = new BufferLoader(context);
  });

  afterEach(() => {
    if (bufferLoader) {
      bufferLoader.dispose();
    }
  });

  describe('on constructed', () => {

    it('should have cache created', () => {
      expect(bufferLoader._bufferCache).toBeDefined();
    });
  });

  describe('when loading a single sound', () => {

    describe('from a valid source', () => {

      const url = 'base/sounds/beep.mp3';
      let downloadResult = null;

      beforeEach((done) => {
        bufferLoader.load(url)
          .then(result => {
            downloadResult = result;
            done();
          });
      });

      it('should return an object with url, value, status and empty error', () => {
        expect(downloadResult.status).toBe(DownloadStatus.Success);
        expect(downloadResult.url).toBe(url);
        expect(downloadResult.value).toBeDefined();
        expect(downloadResult.error).toBeNull();
      });

      it('should have the buffer cached', () => {
        expect(bufferLoader._bufferCache.hasBuffer(url)).toBe(true);
        expect(bufferLoader._bufferCache.getBuffer(url)).toBe(downloadResult.value);
      });
    });

    describe('from an invalid source', () => {

      const url = 'base/sounds/notexist.mp3';
      let downloadResult = null;

      beforeEach((done) => {
        bufferLoader.load(url)
          .then(result => {
            downloadResult = result;
            done();
          });
      });

      it('should return error', () => {
        expect(downloadResult.status).toBe(DownloadStatus.Failure);
        expect(downloadResult.error).toBeDefined();
      });

      it('should not be cached', () => {
        expect(bufferLoader._bufferCache.count()).toBe(0);
      });
    });
  });

  describe('when downloading multiple sounds', () => {

    describe('with valid and invalid sources', () => {

      const urls = [ 'base/sounds/beep.mp3', 'base/sounds/notexist.mp3' ];
      let downloadResults = [];

      beforeEach((done) => {
        bufferLoader.load(urls, context)
          .then(result => {
            downloadResults = result;
            done();
          });
      });

      it('should return all the results with correct values', () => {
        expect(downloadResults).toBeDefined();
        expect(downloadResults.length).toBe(2);

        const successResults = downloadResults.filter(downloadResult => downloadResult.status === DownloadStatus.Success);
        expect(successResults.length).toBe(1);
        expect(successResults[0].url).toBe(urls[0]);

        const failedResults = downloadResults.filter(downloadResult => downloadResult.status === DownloadStatus.Failure);
        expect(failedResults.length).toBe(1);
        expect(failedResults[0].url).toBe(urls[1]);
      });
    });
  });
});
