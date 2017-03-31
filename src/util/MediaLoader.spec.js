import Html5AudioPool from './Html5AudioPool';
import MediaLoader, { DownloadStatus } from './MediaLoder';

describe('MediaLoader', () => {

  let mediaLoder = null;

  beforeEach(() => {
    mediaLoder = new MediaLoader();
  });

  afterEach(() => {
    mediaLoder.dispose();
  });

  describe('on loading a single valid audio file', () => {

    const url = 'base/sounds/beep.mp3';
    let downloadResult = null;

    beforeEach((done) => {
      mediaLoder.load(url)
        .then(result => {
          downloadResult = result;
          done();
        });
    });

    it('should return a single audio node', () => {
      expect(downloadResult.status).toBe(DownloadStatus.Success);
      expect(downloadResult.url).toBe(url);
      expect(downloadResult.value).toBeDefined();
      expect(downloadResult.error).toBeNull();
    });
  });

  describe('on loading a single invalid audio file', () => {

    const url = 'base/sounds/notexist.mp3';
    let downloadResult = null;

    beforeEach((done) => {
      mediaLoder.load(url)
        .then(result => {
          downloadResult = result;
          done();
        });
    });

    it('should return error', () => {
      expect(downloadResult.status).toBe(DownloadStatus.Failure);
      expect(downloadResult.error).toBeDefined();
    });
  });

  describe('on loading an array of audio files', () => {

    const urls = ['base/sounds/beep.mp3', 'base/sounds/click.mp3'];
    let downloadResults = [];

    beforeEach((done) => {
      mediaLoder.load(urls)
        .then(result => {
          downloadResults = result;
          done();
        });
    });

    it('should return all the results', () => {
      expect(downloadResults).toBeDefined();
      expect(downloadResults.length).toBe(2);
    });
  });
});
