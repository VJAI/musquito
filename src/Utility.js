/**
 * Contains helper methods.
 */
class Utility {

  /**
   * The navigator object.
   * @type {Navigator}
   * @private
   */
  _navigator = null;

  /**
   * The AudioContext type.
   * @type {Function}
   * @private
   */
  _contextType = null;

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
    if (typeof navigator !== 'undefined') {
      this._navigator = navigator;
    }

    // Set the available Web Audio Context type available in browser.
    if (typeof AudioContext !== 'undefined') {
      this._contextType = AudioContext;
    } else if (typeof webkitAudioContext !== 'undefined') {
      this._contextType = webkitAudioContext;
    }

    // Determine the supported audio formats.
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
   * Returns an unique id (credit: https://howlerjs.com).
   * @return {number}
   */
  id() {
    return Math.round(Date.now() * Math.random());
  }

  /**
   * Returns the available context type.
   * @return {Function}
   */
  getContextType() {
    return this._contextType;
  }

  /**
   * Instantiates and returns the audio context.
   * @return {AudioContext|webkitAudioContext}
   */
  getContext() {
    return new this._contextType();
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
   * Returns true if the audio source is supported.
   * @param {string} source The audio source url or base64 string
   * @return {boolean}
   */
  isSourceSupported(source) {
    let ext = this.isBase64(source) ?
      (/^data:audio\/([^;,]+);/i).exec(source) :
      (/^.+\.([^.]+)$/).exec(source);

    ext = (/^.+\.([^.]+)$/).exec(source);
    return ext ? this.isFormatSupported(ext[1].toLowerCase()) : false;
  }

  /**
   * Returns the first supported audio source from the passed array.
   * @param {string[]} sources Array of audio sources. The audio source could be either url or base64 string.
   * @return {string}
   */
  getSupportedSource(sources) {
    return sources.find(source => this.isSourceSupported(source));
  }

  /**
   * Returns whether the passed string is a base64 string or not.
   * @param {string} str Base64 audio string
   * @return {boolean}
   */
  isBase64(str) {
    return (/^data:[^;]+;base64,/).test(str);
  }

  /**
   * Returns true if the platform is mobile.
   * @return {boolean}
   * @private
   */
  _isMobile() {
    if (!this._navigator) {
      return false;
    }

    return (/iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i).test(this._navigator.userAgent);
  }

  /**
   * Returns true if the platform is touch supported.
   * @return {boolean}
   * @private
   */
  _isTouch() {
    return typeof window !== 'undefined' && (Boolean(('ontouchend' in window) ||
      (this._navigator && this._navigator.maxTouchPoints > 0) ||
      (this._navigator && this._navigator.msMaxTouchPoints > 0)));
  }
}

export default new Utility();

