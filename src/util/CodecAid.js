class CodecAid {

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

  // TODO: Check for file extension
  supported(formats) {
    if(!formats) {
      return this._formats;
    }

    if(Array.isArray(formats)) {
      return formats.find(format => this._formats[format]);
    }

    return this._formats[formats];
  }
}

export default new CodecAid();
