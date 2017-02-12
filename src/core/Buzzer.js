import log, { LogType } from '../util/Logger';

/**
 * Represents the different states of the audio engine.
 * @enum {number}
 */
const BuzzerState = {
  Constructed: 0,
  Ready: 1,
  Done: 2,
  NA: 3
};

/**
 * The audio engine.
 * @class
 */
class Buzzer {
  
  /**
   * Initialize the internal variables.
   * @constructor
   */
  constructor() {
    this._context = null;
    this._codecs = {};
    this._muted = false;
    this._volume = 1.0;
    this._gainNode = null;
    this._contextType = AudioContext || webkitAudioContext;
    this._state = typeof this._contextType !== 'undefined' ? BuzzerState.Constructed : BuzzerState.NA;
  }
  
  /**
   * Instantiate audio context and other important objects.
   * Returns true if the setup is success.
   * @param {AudioContext} context
   * @returns {boolean}
   */
  setup(context) {
    if (this._state === BuzzerState.NA) {
      log('Audio engine is not available because the current platform not supports Web Audio.', LogType.Error);
      return false;
    }
    
    if (this._state === BuzzerState.Ready) {
      return true;
    }
    
    this._context = context || new this._contextType();
    this.codecs();
    this._gainNode = this._context.createGain();
    this._gainNode.gain.value = this._volume;
    this._gainNode.connect(this._context.destination);
    this._state = BuzzerState.Ready;
    return true;
  }
  
  /**
   * Figure out the supported codecs and return the result as an object.
   * @returns {object}
   */
  codecs() {
    if (Object.keys(this._codecs).length === 0 && typeof Audio !== 'undefined') {
      var audioTest = new Audio();
      
      this._codecs = {
        mp3: !!audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''),
        mpeg: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
        flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
      };
      
      audioTest = null;
    }
    
    return this._codecs;
  }
  
  /**
   * Set/get the volume for the audio engine that controls global volume for all sounds.
   * @param {number} vol
   * @returns {Buzzer|number}
   */
  volume(vol) {
    if (typeof vol === 'undefined') {
      return this._volume;
    }
    
    var volume = parseFloat(vol);
    
    if (isNaN(volume) || volume < 0 || volume > 1.0) {
      return this._volume;
    }
    
    this._volume = volume;
    this._gainNode && (this._gainNode.gain.value = this._volume);
    
    return this;
  }
  
  /**
   * Mute the engine.
   */
  mute() {
    if (this._muted) {
      return;
    }
    
    this._gainNode && (this._gainNode.gain.value = 0);
    this._muted = true;
  }
  
  /**
   * Unmute the engine.
   */
  unmute() {
    if (!this._muted) {
      return;
    }
    
    this._gainNode && (this._gainNode.gain.value = this._volume);
    this._muted = false;
  }
  
  /**
   * TODO
   */
  tearDown() {
    this._state = BuzzerState.Done;
  }
  
  /**
   * Returns the created audio context.
   * @returns {AudioContext}
   */
  context() {
    return this._context;
  }
  
  /**
   * Returns the master gain node.
   * @returns {GainNode}
   */
  gain() {
    return this._gainNode;
  }
  
  /**
   * Returns whether the engine is currently muted or not.
   * @returns {boolean}
   */
  muted() {
    return this._muted;
  }
  
  /**
   * Returns the state of the engine.
   * @returns {number}
   */
  state() {
    return this._state;
  }
  
  /**
   * Returns whether the engine is available or not.
   * @returns {boolean}
   */
  available() {
    return this._state !== BuzzerState.NA;
  }
}

const buzzer = new Buzzer();

export { BuzzerState, buzzer as default };
