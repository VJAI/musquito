import MediaLoader from './MediaLoader';
import DownloadStatus from './DownloadStatus';

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
    let promise = null;

    beforeEach(() => {
      promise = mediaLoder.load(url);
    });

    it('should record the audio element and other info', () => {
      expect(mediaLoder._bufferingAudios.length).toBe(1);
      expect(mediaLoder._bufferingAudios[0].url).toBe('base/sounds/beep.mp3');
      expect(mediaLoder._bufferingAudios[0].id).not.toBeDefined();
      expect(mediaLoder._bufferingAudios[0].audio).toBeDefined();
      expect(mediaLoder._bufferingAudios[0].audio.currentTime).toBe(0);
      expect(mediaLoder._bufferingAudios[0].canplaythrough).toBeDefined();
      expect(mediaLoder._bufferingAudios[0].error).toBeDefined();
    });

    it('should return an object with url, audio element and empty error', done => {
      promise.then(downloadResult => {
        expect(downloadResult.status).toBe(DownloadStatus.Success);
        expect(downloadResult.url).toBe(url);
        expect(downloadResult.value).toBeDefined();
        expect(downloadResult.error).toBeNull();
        done();
      });
    });

    it('should remove the audio element and other info from the array', done => {
      promise.then(() => {
        expect(mediaLoder._bufferingAudios.length).toBe(0);
        done();
      });
    });
  });

  describe('on loading a single invalid audio file', () => {

    const url = 'base/sounds/notexist.mp3';
    let promise = null;

    beforeEach(() => {
      spyOn(mediaLoder._audioPool, 'destroy').and.callThrough();
      promise = mediaLoder.load(url);
    });

    it('should return error', done => {
      promise.then(downloadResult => {
        expect(downloadResult.status).toBe(DownloadStatus.Failure);
        expect(downloadResult.error).toBeDefined();
        done();
      });
    });

    it('should remove the audio element from pool', done => {
      promise.then(() => {
        expect(mediaLoder._audioPool.destroy).toHaveBeenCalled();
        done();
      });
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

  describe('on calling unload passing single url', () => {

    beforeEach(() => {
      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/beep.mp3',
        id: 1,
        audio: new Audio()
      });

      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/button.mp3',
        id: 2,
        audio: new Audio()
      });

      spyOn(mediaLoder._audioPool, 'release').and.callThrough();

      mediaLoder.unload('base/sounds/beep.mp3');
    });

    it('should remove the audio elements associated to that url from the bufferingAudios array', () => {
      expect(mediaLoder._bufferingAudios.length).toBe(1);
    });

    it('should release the audio nodes from the audioPool', () => {
      expect(mediaLoder._audioPool.release).toHaveBeenCalledWith('base/sounds/beep.mp3', true);
    });
  });

  describe('on calling unload passing single url with onlyFree as false', () => {

    const onlyFree = false;

    beforeEach(() => {
      spyOn(mediaLoder._audioPool, 'release').and.callThrough();
      mediaLoder.unload('base/sounds/beep.mp3', onlyFree);
    });

    it('should release the audio nodes from the audioPool passing onlyFree as false', () => {
      expect(mediaLoder._audioPool.release).toHaveBeenCalledWith('base/sounds/beep.mp3', onlyFree);
    });
  });

  describe('on calling unload passing array of urls', () => {

    beforeEach(() => {
      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/beep.mp3',
        id: 1,
        audio: new Audio()
      });

      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/button.mp3',
        id: 2,
        audio: new Audio()
      });

      mediaLoder.unload(['base/sounds/beep.mp3', 'base/sounds/button.mp3']);
    });

    it('should remove all the audio elements associated to the urls from the bufferingAudios array', () => {
      expect(mediaLoder._bufferingAudios.length).toBe(0);
    });
  });

  describe('on calling unload passing no arguments', () => {

    beforeEach(() => {
      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/beep.mp3',
        id: 1,
        audio: new Audio()
      });

      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/button.mp3',
        id: 2,
        audio: new Audio()
      });

      mediaLoder.unload();
    });

    it('should remove all the audio elements from the bufferingAudios array', () => {
      expect(mediaLoder._bufferingAudios.length).toBe(0);
    });
  });

  describe('on calling unloadForSound with destroy false', () => {

    beforeEach(() => {
      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/beep.mp3',
        id: 1,
        audio: new Audio()
      });

      mediaLoder._bufferingAudios.push({
        url: 'base/sounds/button.mp3',
        id: 2,
        audio: new Audio()
      });

      spyOn(mediaLoder._audioPool, 'releaseForSound').and.callThrough();

      mediaLoder.unloadForSound(1);
    });

    it('should remove the audio elements associated to that id from the bufferingAudios array', () => {
      expect(mediaLoder._bufferingAudios.length).toBe(1);
    });

    it('should release the audio node allocated for that id from the audioPool', () => {
      expect(mediaLoder._audioPool.releaseForSound).toHaveBeenCalledWith(1, false);
    });
  });

  describe('on calling unloadForSound with destroy true', () => {

    beforeEach(() => {
      spyOn(mediaLoder._audioPool, 'releaseForSound').and.callThrough();
      mediaLoder.unloadForSound(1, true);
    });

    it('should release the audio node allocated for that id from the audioPool with passing destroy false', () => {
      expect(mediaLoder._audioPool.releaseForSound).toHaveBeenCalledWith(1, true);
    });
  });

  describe('on calling dispose', () => {

    beforeEach(() => {
      spyOn(mediaLoder._audioPool, 'dispose').and.callThrough();
      mediaLoder.dispose();
    });

    it('should set null to bufferingAudios and audioPool', () => {
      expect(mediaLoder._bufferingAudios).toBeNull();
    });

    it('should dispose audioPool', () => {
      expect(mediaLoder._audioPool).toBeNull();
    });

    it('should set the disposed variable to true', () => {
      expect(mediaLoder._disposed).toBe(true);
    });
  });
});

