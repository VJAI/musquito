const fileExtRegEx = /^.+\.([^.]+)$/; // Ref: http://stackoverflow.com/questions/190852/how-can-i-get-file-extensions-with-javascript

class CodecAid {

  /**
   * Dictionary of audio formats and their support status.
   * @type {object}
   * @private
   */
  _formats = {};

  constructor() {
    this._figureOut();
  }

  _figureOut() {
    let audio = new Audio();

    this._formats = {
      mp3: !!audio.canPlayType('audio/mp3;').replace(/^no$/, ''),
      mpeg: !!audio.canPlayType('audio/mpeg;').replace(/^no$/, ''),
      opus: !!audio.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
      ogg: !!audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
      oga: !!audio.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
      wav: !!audio.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
      aac: !!audio.canPlayType('audio/aac;').replace(/^no$/, ''),
      caf: !!audio.canPlayType('audio/x-caf;').replace(/^no$/, ''),
      m4a: !!(audio.canPlayType('audio/x-m4a;') || audio.canPlayType('audio/m4a;') || audio.canPlayType('audio/aac;')).replace(/^no$/, ''),
      mp4: !!(audio.canPlayType('audio/x-mp4;') || audio.canPlayType('audio/mp4;') || audio.canPlayType('audio/aac;')).replace(/^no$/, ''),
      weba: !!audio.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
      webm: !!audio.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
      dolby: !!audio.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
      flac: !!(audio.canPlayType('audio/x-flac;') || audio.canPlayType('audio/flac;')).replace(/^no$/, '')
    };

    audio = null;
  }

  supportedFormats() {
    return this._formats;
  }

  isFormatSupported(format) {
    return !!this._formats[format];
  }

  getSupportedFormat(formats) {
    return formats.find(format => this.isFormatSupported(format));
  }

  isFileSupported(file) {
    const ext = fileExtRegEx.exec(file);
    return ext ? this.isFormatSupported(ext[1]) : false;
  }

  getSupportedFile(files) {
    return files.find(file => this.isFileSupported(file));
  }
}

export default new CodecAid();
