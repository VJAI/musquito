/**
 * Enables audio to be played in mobile devices that needs user interaction.
 */
class MobileAudioEnabler {

  /**
   * The navigator object.
   * @type {Navigator}
   * @private
   */
  _navigator = window && window.navigator;

  /**
   * Is audio already enabled or not.
   * @type {boolean}
   * @private
   */
  _isEnabled = false;

  /**
   * Enables playing audio on first touch.
   * @param {AudioContext} context Web API audio context.
   */
  enable(context) {
    if (!this._isMobile() && !this._isTouch() || this._isEnabled) {
      return;
    }

    const unlock = () => {
      const bufferSource = context.createBufferSource();
      bufferSource.buffer = context.scratchBuffer();
      bufferSource.connect(context.destination);
      bufferSource.addEventListener('ended', () => {
        bufferSource.disconnect();
        bufferSource.onended = null;
        document.removeEventListener('touchend', unlock);
      });

      if (typeof bufferSource.start === 'undefined') {
        bufferSource.noteOn(0);
      } else {
        bufferSource.start(0);
      }
    };

    document.addEventListener('touchend', unlock);
  }

  /**
   * Returns true if the platform is mobile.
   * @return {boolean}
   * @private
   */
  _isMobile() {
    if (!navigator) {
      return false;
    }

    return /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(this._navigator.userAgent);
  }

  /**
   * Returns true if the platform is touch supported.
   * @return {boolean}
   * @private
   */
  _isTouch() {
    return Boolean(('ontouchend' in window) ||
      (this._navigator && this._navigator.maxTouchPoints > 0) ||
      (this._navigator && this._navigator.msMaxTouchPoints > 0));
  }
}

export default new MobileAudioEnabler();
