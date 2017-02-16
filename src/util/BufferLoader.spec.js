import BufferLoader, {BufferCache, DownloadStatus} from './BufferLoader';

describe('BufferLoader', () => {

  let context;

  beforeAll(() => {
    context = new (AudioContext || webkitAudioContext)();
  });

  afterAll(() => {
    if (context) {
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

      const url = 'base/sounds/beep.mp3',
        cache = new BufferCache(),
        bufferLoader = new BufferLoader(cache);

      let downloadResult;

      beforeAll((done) => {
        bufferLoader.load(url, context)
          .then(result => {
            downloadResult = result;
            done();
          });
      });

      it('should return an object with url, value, status and empty error', () => {
        expect(downloadResult.status).toBe(DownloadStatus.Success);
        expect(downloadResult.url).toBe(url);
        expect(downloadResult.value).toBeDefined();
        expect(downloadResult.error).not.toBeDefined();
      });

      it('should have the buffer cached', () => {
        expect(cache.hasBuffer(url)).toBe(true);
        expect(cache.getBuffer(url)).toBe(downloadResult.value);
      });

      describe('and reloading again', () => {

        let downloadResult2;

        beforeAll((done) => {
          bufferLoader.load(url, context)
            .then(result => {
              downloadResult2 = result;
              done();
            });
        });

        it('should return the already cached result', () => {
          expect(downloadResult2).toBeDefined();
          expect(downloadResult2.url).toBe(url);
        });
      });
    });

    describe('from an invalid source', () => {

      const url = 'base/sounds/notexist.mp3',
        cache = new BufferCache(),
        bufferLoader = new BufferLoader(cache);

      let downloadResult;

      beforeAll((done) => {
        bufferLoader.load(url, context)
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
        expect(cache.count()).toBe(0);
      });
    });
  });

  describe('when downloading multiple sounds', () => {

    describe('with valid and invalid sources', () => {

      const urls = ['base/sounds/beep.mp3', 'base/sounds/notexist.mp3'],
        cache = new BufferCache(),
        bufferLoader = new BufferLoader(cache);

      let downloadResults;

      beforeAll((done) => {
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

      describe('reloading again', () => {

        let downloadResults2;

        beforeAll((done) => {
          bufferLoader.load(urls, context)
            .then(result => {
              downloadResults2 = result;
              done();
            });
        });

        it('should return all the results with correct values', () => {
          expect(downloadResults).toBeDefined();
          expect(downloadResults.length).toBe(2);
          expect(downloadResults.filter(downloadResult => downloadResult.status === DownloadStatus.Success).length).toBe(1);
          expect(downloadResults.filter(downloadResult => downloadResult.status === DownloadStatus.Failure).length).toBe(1);
        });
      });
    });
  });
});