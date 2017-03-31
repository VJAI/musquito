// Ref: http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript
const fileExtRegEx = /^.+\.([^.]+)$/;

/**
 * Helps to deal with the supported audio formats by the current environment.
 * @class
 */
class CodecAid {

  /**
   * Dictionary of audio formats and their support status.
   * @type {object}
   * @private
   */
  _formats = {};

  /**
   * @constructor
   */
  constructor() {
    this._figureOut();
  }

  /**
   * Figures out all the supported codecs and store the result in an object.
   * @private
   */
  _figureOut() {
    let audio = new Audio();

    this._formats = {
      mp3: Boolean(audio.canPlayType('audio/mp3;').replace(/^no$/, '')),
      mpeg: Boolean(audio.canPlayType('audio/mpeg;').replace(/^no$/, '')),
      opus: Boolean(audio.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '')),
      ogg: Boolean(audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')),
      oga: Boolean(audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')),
      wav: Boolean(audio.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')),
      aac: Boolean(audio.canPlayType('audio/aac;').replace(/^no$/, '')),
      caf: Boolean(audio.canPlayType('audio/x-caf;').replace(/^no$/, '')),
      m4a: Boolean((audio.canPlayType('audio/x-m4a;') ||
      audio.canPlayType('audio/m4a;') ||
      audio.canPlayType('audio/aac;')).replace(/^no$/, '')),
      mp4: Boolean((audio.canPlayType('audio/x-mp4;') ||
      audio.canPlayType('audio/mp4;') ||
      audio.canPlayType('audio/aac;')).replace(/^no$/, '')),
      weba: Boolean(audio.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
      webm: Boolean(audio.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')),
      dolby: Boolean(audio.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, '')),
      flac: Boolean((audio.canPlayType('audio/x-flac;') || audio.canPlayType('audio/flac;')).replace(/^no$/, ''))
    };

    audio = null;
  }

  /**
   * Returns the supported audio formats.
   * @return {Object}
   */
  supportedFormats() {
    return this._formats;
  }

  /**
   * Returns true if the passed format is supported.
   * @param {string} format The audio format ex. "mp3"
   * @return {boolean}
   */
  isFormatSupported(format) {
    return Boolean(this._formats[format]);
  }

  /**
   * Returns the first supported format from the passed array.
   * @param {string[]} formats Array of audio formats
   * @return {string}
   */
  getSupportedFormat(formats) {
    return formats.find(format => this.isFormatSupported(format));
  }

  /**
   * Returns true if the audio file is supported.
   * @param {string} file The audio file url
   * @return {boolean}
   */
  isFileSupported(file) {
    const ext = fileExtRegEx.exec(file);
    return ext ? this.isFormatSupported(ext[1]) : false;
  }

  /**
   * Returns the first supported audio file from the passed array.
   * @param {string[]} files Array of audio files
   * @return {string}
   */
  getSupportedFile(files) {
    return files.find(file => this.isFileSupported(file));
  }
}

export default new CodecAid();
