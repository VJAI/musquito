import Html5AudioPool from './Html5AudioPool';
import DownloadStatus from './DownloadStatus';

class MediaDownloadResult {

  url = null;

  value = null;

  error = null;

  status = null;

  /**
   * @param {string} url
   * @param {Audio=} value
   * @param {*=} error
   */
  constructor(url, value, error) {
    this.url = url;
    value && (this.value = value);
    error && (this.error = error);
    this.status = value ? DownloadStatus.Success : DownloadStatus.Failure;
  }
}

class MediaLoader {

  _audioPool = Html5AudioPool;

  constructor(audioPool) {
    this._audioPool = audioPool;
  }

  load(urls) {

  }

  allocate(url, id) {
    return this._audioPool.allocate(url, id);
  }

  release(url, id) {
    this._audioPool.release(url, id);
  }

  _load(url) {

  }

  unload(urls) {
    this._audioPool.release(urls);
  }
}

export {MediaDownloadResult, DownloadStatus, MediaLoader as default};
