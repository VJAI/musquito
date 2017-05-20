import BaseResourceBuzz, { BuzzState } from './BaseResourceBuzz';
import buzzer from './Buzzer';
import ErrorType from '../util/ErrorType';

/**
 * Employs the native HTML5 audio element for playing sounds.
 * @class
 */
class MediaBuzz extends BaseResourceBuzz {

  /**
   * The HTML5 Audio element.
   * @type {Audio}
   * @private
   */
  _audio = null;

  /**
   * Web Audio API's MediaElementAudioSourceNode
   * @type {MediaElementAudioSourceNode}
   * @private
   */
  _mediaElementAudioSourceNode = null;

  /**
   * Validate if the passed source is a string or array of string.
   * @param {object} args The arguments passed to the sound
   * @return {object}
   * @private
   */
  _validate(args) {

    let options = typeof args === 'string' || Array.isArray(args) ? { src: args } : args || {};

    // If the user hasn't passed any source throw error.
    if (!options.src || (Array.isArray(options.src) && options.src.length === 0)) {
      throw new Error('You should pass the source for the audio.');
    }

    return options;
  }

  /**
   * Loads the audio node.
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load() {
    return buzzer.loadMedia(this._compatibleSrc, this._id);
  }

  /**
   * Create the gain node and set it's gain value.
   * @private
   */
  _createGainNode() {
    if (this._webAudio) {
      this._gainNode = this._context.createGain();
      this._gainNode.gain.value = this._muted ? 0 : this._volume;
    }
  }

  /**
   * Set the pre-loaded HTML5 Audio element and the duration to the properties.
   * @param {DownloadResult} downloadResult The download result returned by the loader.
   * @private
   */
  _save(downloadResult) {
    this._audio = downloadResult.value;
    this._audio.addEventListener('error', this._onAudioError);
    this._duration = this._audio.duration;
  }

  /**
   * "error" event handler of audio element.
   * @param {object} err
   * @private
   */
  _onAudioError(err) { // TODO: Need to revise this method!
    this._fire('error', { type: ErrorType.LoadError, error: err });
  }

  /**
   * Creates a new MediaElementAudioSourceNode passing the audio element if the platform supports it and
   * set the properties of the audio element and play it.
   * @private
   */
  _playNode() {
    if (!this._mediaElementAudioSourceNode && this._webAudio) {
      this._mediaElementAudioSourceNode = this._context.createMediaElementSource(this._audio);
      this._mediaElementAudioSourceNode.connect(this._gainNode);
    }

    let [seek] = this._getTimeVars();
    this._audio.currentTime = seek;
    this._audio.muted = this._muted;
    this._audio.volume = buzzer.volume() * this._volume;
    this._audio.playbackRate = this._rate;
    this._audio.play();
  }

  /**
   * Removes all the event handlers subscribed to HTML5 audio element.
   * @private
   */
  _removeAllEventHandlers() {
    if (!this._audio) {
      return;
    }

    this._audio.removeEventListener('error', this._onAudioError());
  }

  /**
   * Callback that is invoked after the playback is ended.
   * @private
   */
  _onEnded() {
    if (this._loop) {
      this._fire('playend');
      this._stop(false).play();
    } else {
      this._stop(false);
      this._state = BuzzState.Idle;
      this._fire('playend');
    }
  }

  /**
   * Pause the audio element.
   * @private
   */
  _pauseNode() {
    if (this._audio) {
      this._audio.pause();
    }
  }

  /**
   * Pause the audio element and resets it's position to 0.
   * @private
   */
  _stopNode() {
    if (this._audio) {
      this._audio.pause();
      this._audio.currentTime = this._startPos || 0;
    }
  }

  /**
   * Mutes the audio element directly if Web Audio API/MediaElementAudioSourceNode is not supported.
   * @private
   */
  _muteNode() {
    if (!this._mediaElementAudioSourceNode && this._audio) {
      this._audio.muted = true;
    }
  }

  /**
   * Un-mutes the audio element directly if Web Audio API/MediaElementAudioSourceNode is not supported.
   * @private
   */
  _unMuteNode() {
    if (!this._mediaElementAudioSourceNode && this._audio) {
      this._audio.muted = buzzer.muted();
    }
  }

  /**
   * Set the volume directly to the audio element if Web Audio API/MediaElementAudioSourceNode is not supported.
   * @param {number} vol Volume
   * @private
   */
  _setVolume(vol) {
    if (!this._mediaElementAudioSourceNode && this._audio) {
      this._audio.volume = buzzer.volume() * vol;
    }
  }

  /**
   * Set the playbackrate for the audio node.
   * @param {number} rate The playback rate
   * @private
   */
  _setNodeRate(rate) {
    if (this._audio) {
      this._audio.playbackRate.value = rate;
    }
  }

  /**
   * Returns the current position of the playback.
   * @return {number}
   * @private
   */
  _getSeek() {
    return this._audio ? this._audio.currentTime : 0;
  }

  /**
   * Relinquish the allocated audio node and clears other objects.
   * @private
   */
  _destroyInternals() {
    buzzer.unloadMedia(this._compatibleSrc, this._id);
    this._audio = null;
    this._mediaElementAudioSourceNode = null;
  }
}

export { MediaBuzz as default, BuzzState };
