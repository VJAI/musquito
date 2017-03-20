import Html5AudioPool from './Html5AudioPool';
import DownloadStatus from './DownloadStatus';

class MediaDownloadResult {

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

  audioPool = Html5AudioPool;

  constructor(audioPool) {
    this.audioPool = audioPool;
  }

  load(urls) {

  }
}

export {MediaDownloadResult, DownloadStatus, MediaLoader as default};
