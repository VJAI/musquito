import Html5AudioPool from './Html5AudioPool';
import DownloadResult, {DownloadStatus} from './DownloadResult';

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

export {DownloadResult, DownloadStatus, MediaLoader as default};
