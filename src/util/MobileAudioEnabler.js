class MobileAudioEnabler {

  _navigator = window && window.navigator;

  _isEnabled = false;

  enable() {
    if (this._isEnabled) {
      return;
    }
  }

  _isMobile() {
    if (!navigator) {
      return false;
    }

    return /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(this._navigator.userAgent);
  }
}

export default new MobileAudioEnabler();
