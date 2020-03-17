import utility from './Utility';
import BufferLoader from './BufferLoader';
import DownloadStatus from './DownloadStatus';

describe('BufferLoader', () => {

  let context = null, bufferLoader = null;

  beforeAll(() => {
    context = utility.getContext();
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
      let promise = null;

      beforeEach(() => {
        promise = bufferLoader.load(url);
      });

      it('record the progressing call info', () => {
        expect(bufferLoader._progressCallsAndCallbacks[url]).toBeDefined();
      });

      it('should return an object with url, buffer, status and empty error', done => {
        promise.then(downloadResult => {
          expect(downloadResult.status).toBe(DownloadStatus.Success);
          expect(downloadResult.url).toBe(url);
          expect(downloadResult.value).toBeDefined();
          expect(downloadResult.error).toBeNull();
          done();
        });
      });

      it('should have the buffer cached', done => {
        promise.then(downloadResult => {
          expect(bufferLoader._bufferCache.hasBuffer(url)).toBe(true);
          expect(bufferLoader._bufferCache.getBuffer(url)).toBe(downloadResult.value);
          done();
        });
      });

      it('should removed the recorded info after the call is over', done => {
        promise.then(() => {
          expect(bufferLoader._progressCallsAndCallbacks[url]).not.toBeDefined();
          done();
        });
      });
    });

    describe('from an invalid source', () => {

      const url = 'base/sounds/notexist.mp3';
      let promise = null;

      beforeEach(() => {
        promise = bufferLoader.load(url);
      });

      it('should return error', () => {
        promise.then(downloadResult => {
          expect(downloadResult.status).toBe(DownloadStatus.Failure);
          expect(downloadResult.error).toBeDefined();
        });
      });

      it('should not be cached', () => {
        promise.then(() => {
          expect(bufferLoader._bufferCache.count()).toBe(0);
        });
      });

      it('should removed the recorded info after the call is over', done => {
        promise.then(() => {
          expect(bufferLoader._progressCallsAndCallbacks[url]).not.toBeDefined();
          done();
        });
      });
    });
  });

  describe('when loading a valid single sound multiple times', () => {

    let promise1 = null;
    let promise2 = null;

    beforeEach(() => {
      spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

      promise1 = bufferLoader.load('base/sounds/beep.mp3');
      promise2 = bufferLoader.load('base/sounds/beep.mp3');
    });

    it('should trigger the ajax call only once', () => {
      expect(XMLHttpRequest.prototype.send.calls.count()).toBe(1);
    });

    it('should resolve all the promises', done => {
      Promise.all([promise1, promise2]).then(done);
    });
  });

  describe('when loading an in-valid single sound multiple times', () => {

    let promise1 = null;
    let promise2 = null;

    beforeEach(() => {
      spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

      promise1 = bufferLoader.load('base/sounds/notexist.mp3');
      promise2 = bufferLoader.load('base/sounds/notexist.mp3');
    });

    it('should trigger the ajax call only once', () => {
      expect(XMLHttpRequest.prototype.send.calls.count()).toBe(1);
    });

    it('should reject all the promises', done => {
      Promise.all([promise1, promise2]).then(done);
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

    describe('with duplicate valid source', () => {

      const urls = [ 'base/sounds/beep.mp3', 'base/sounds/beep.mp3' ];
      let downloadResults = [];

      beforeEach((done) => {
        spyOn(XMLHttpRequest.prototype, 'send').and.callThrough();

        bufferLoader.load(urls, context)
          .then(result => {
            downloadResults = result;
            done();
          });
      });

      it('should trigger the ajax call only once', () => {
        expect(XMLHttpRequest.prototype.send.calls.count()).toBe(1);
      });

      it('should return the result duplicated in array', () => {
        expect(downloadResults.length).toBe(2);
        expect(downloadResults[0]).toEqual(downloadResults[1]);
      });
    });
  });

  describe('when calling unload passing single url', () => {

    beforeEach(() => {
      spyOn(bufferLoader._bufferCache, 'removeBuffer').and.callThrough();
      bufferLoader.unload('base/sounds/beep.mp3');
    });

    it('should remove the cached url from buffer-cache', () => {
      expect(bufferLoader._bufferCache.removeBuffer).toHaveBeenCalledWith('base/sounds/beep.mp3');
    });
  });

  describe('when calling unload passing array of urls', () => {

    beforeEach(() => {
      spyOn(bufferLoader._bufferCache, 'removeBuffer').and.callThrough();
      bufferLoader.unload(['base/sounds/beep.mp3', 'base/sounds/button.mp3']);
    });

    it('should call removeBuffer twice', () => {
      expect(bufferLoader._bufferCache.removeBuffer.calls.count()).toBe(2);
    });
  });

  describe('when calling unload without passing any argument', () => {

    beforeEach(() => {
      spyOn(bufferLoader._bufferCache, 'clearBuffers').and.callThrough();
      bufferLoader.unload();
    });

    it('should call clearBuffers', () => {
      expect(bufferLoader._bufferCache.clearBuffers).toHaveBeenCalled();
    });
  });

  describe('when calling dispose', () => {

    beforeEach(() => {
      spyOn(bufferLoader, 'unload').and.callThrough();
      bufferLoader.dispose();
    });

    it('should call unload method', () => {
      expect(bufferLoader.unload).toHaveBeenCalled();
    });

    it('should set the cache, progress-calls and context variables to null', () => {
      expect(bufferLoader._bufferCache).toBeNull();
      expect(bufferLoader._progressCallsAndCallbacks).toBeNull();
      expect(bufferLoader._context).toBeNull();
    });

    it('should set the disposed variable to true', () => {
      expect(bufferLoader._disposed).toBe(true);
    });
  });
});
