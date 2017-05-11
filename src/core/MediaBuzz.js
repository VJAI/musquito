import BaseBuzz, { BuzzState } from './BaseBuzz';
import buzzer from './Buzzer';

/**
 * Employs HTML5 audio element for playing sounds.
 * @class
 */
class MediaBuzz extends BaseBuzz {

  _audio = null;

  _mediaElementAudioSourceNode = null;

  /**
   * Loads the audio node.
   * @return {Promise<DownloadResult>}
   * @private
   */
  _load() {
    return buzzer.loadMedia(this._compatibleSrc, this._id);
  }

  /**
   * Stores the pre-loaded HTML5 Audio element and duration.
   * @param {DownloadResult} downloadResult The download result returned by the loader.
   * @private
   */
  _save(downloadResult) {
    this._audio = downloadResult.value;
    this._duration = this._audio.duration;
  }

  /**
   * Creates a new MediaElementAudioSourceNode passing the audio element if the platform supports it,
   * set the properties of the audio element and play it.
   * @param {function} cb Callback that should be called after the node started playing.
   * @private
   */
  _playNode(cb) {
    if (!this._mediaElementAudioSourceNode && buzzer.isMediaSourceAvailable()) {
      this._mediaElementAudioSourceNode = this._context.createMediaElementSource(this._audio);
      this._mediaElementAudioSourceNode.connect(this._gainNode);
    }

    let [seek] = this._getTimeVars();
    this._audio.currentTime = seek;
    this._audio.muted = this._muted;
    this._audio.volume = buzzer.volume() * this._volume;
    this._audio.playbackRate = this._rate;
    this._audio.play();
    cb();
  }

  /**
   * Called after the playback ends.
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
  _handlePause() {
    this._audio && this._audio.pause();
  }

  /**
   * Pause the audio element and set it's position to 0.
   * @private
   */
  _handleStop() {
    if (this._audio) {
      this._audio.pause();
      this._audio.currentTime = this._startPos || 0;
    }
  }

  /**
   * Mutes the audio element.
   * @private
   */
  _muteNode() {
    if (!this._mediaElementAudioSourceNode && this._audio) {
      this._audio.muted = buzzer.muted();
    }
  }

  /**
   * Unmuted the audio element.
   * @private
   */
  _unMuteNode() {
    if (!this._mediaElementAudioSourceNode && this._audio) {
      this._audio.muted = buzzer.muted() ? true : false;
    }
  }

  _setVolume(vol) {
    if (!this._mediaElementAudioSourceNode && this._audio) {
      this._audio.volume = buzzer.volume() * vol;
    }
  }

  /**
   * Get/set the playback rate.
   * @param {number=} rate The playback rate
   * @return {MediaBuzz|number}
   */
  rate(rate) {
    if (typeof rate === 'undefined') {
      return this._rate;
    }

    if (typeof rate !== 'number' || rate < 0 || rate > 5) {
      return this;
    }

    this._startTime = this._context.currentTime; // TODO: do we need this?
    this._rate = rate;

    if (this._audio) {
      this._audio.playbackRate.value = this._rate;
    }

    this._fire('rate', this._rate);
    return this;
  }


  /**
   * Get/set the seek position.
   * @param {number=} seek The seek position
   * @return {MediaBuzz|number}
   */
  seek(seek) {
    if (typeof seek === 'undefined') {
      return this._audio ? this._audio.currentTime : 0;
    }

    if (typeof seek !== 'number' || seek < 0) {
      return this;
    }

    if (!this.isLoaded()) {
      this._actionQueue.add('seek', () => this.seek(seek));
      this._load();
      return this;
    }

    if (seek > this._duration) {
      return this;
    }

    const isPlaying = this.isPlaying();
    if (isPlaying) {
      this._pause(false);
    }

    let canPlayThroughEventHandled = false;
    const onCanPlayThrough = () => {
      if (canPlayThroughEventHandled) {
        return;
      }

      canPlayThroughEventHandled = true;
      this._audio.removeEventListener('canplaythrough');
      this._fire('seek', seek);

      if (isPlaying) {
        this._play(false);
      }
    };
    this._audio.addEventListener('canplaythrough', onCanPlayThrough);

    this._elapsed = seek;

    if (this._audio.readyState === 4) {
      onCanPlayThrough();
    }

    return this;
  }

  /**
   * Stops the playing audio element.
   * @private
   */
  _stopNode() {
    this._audio && this._audio.pause();
  }

  /**
   * Relinquish the allocated audio node and clears other objects.
   * @private
   */
  _destroy() {
    buzzer.unloadMedia(this._compatibleSrc, this._id);
    this._audio = null;
    this._mediaElementAudioSourceNode = null;
  }
}

export { MediaBuzz as default };
