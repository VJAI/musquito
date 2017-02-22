import codecAid from './CodecAid';

describe('CodecAid', () => {

  beforeAll(() => {
    codecAid._formats = {
      mp3: true
    };
  });

  describe('on passing the supported format', () => {
    it('should return true', () => {
      expect(codecAid.isFormatSupported('mp3')).toBe(true);
    });
  });

  describe('on passing the un-supported format', () => {
    it('should return false', () => {
      expect(codecAid.isFormatSupported('wav')).toBe(false);
    });
  });

  describe('on passing an array of formats', () => {
    it('should return the supported format', () => {
      expect(codecAid.getSupportedFormat(['wav', 'mp3', 'ogg'])).toBe('mp3');
    });
  });

  describe('on passing the supported file', () => {
    it('should return true', () => {
      expect(codecAid.isFileSupported('http://soundrepo.org/sounds/beep.mp3')).toBe(true);
    });
  });

  describe('on passing the un-supported file', () => {
    it('should return true', () => {
      expect(codecAid.isFileSupported('http://soundrepo.org/sounds/beep.wav')).toBe(false);
    });
  });

  describe('on passing an array of files', () => {
    it('should return the supported file', () => {
      expect(codecAid.getSupportedFile(['http://soundrepo.org/sounds/beep.wav', 'http://soundrepo.org/sounds/beep.mp3'])).toBe('http://soundrepo.org/sounds/beep.mp3');
    });
  });
});
