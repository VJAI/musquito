import DownloadStatus from './DownloadStatus';

class DownloadResult {

  url = null;

  value = null;

  error = null;

  status = null;

  /**
   * @param {string} url
   * @param {AudioBuffer|Audio=} value
   * @param {*=} error
   */
  constructor(url, value, error) {
    this.url = url;
    value && (this.value = value);
    error && (this.error = error);
    this.status = value ? DownloadStatus.Success : DownloadStatus.Failure;
  }
}

export {DownloadStatus, DownloadResult as default};
