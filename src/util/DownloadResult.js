import DownloadStatus from './DownloadStatus';

/**
 * Represents the download result of an audio.
 * @class
 */
class DownloadResult {

  /**
   * The url of the audio resource
   * @type {string|null}
   */
  url = null;

  /**
   * AudioBuffer or Html5Audio element
   * @type {AudioBuffer|Audio}
   */
  value = null;

  /**
   * Download error
   * @type {any}
   */
  error = null;

  /**
   * Success or failure status of download.
   * @type {DownloadStatus}
   */
  status = null;

  /**
   * @param {string} url The url of the audio resource
   * @param {AudioBuffer|Audio=} value AudioBuffer or Html5Audio element
   * @param {*=} error Download error
   */
  constructor(url, value, error) {
    this.url = url;
    this.value = value;
    this.error = error;
    this.status = value ? DownloadStatus.Success : DownloadStatus.Failure;
  }
}

export { DownloadStatus, DownloadResult as default };
