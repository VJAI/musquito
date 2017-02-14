const DownloadStatus = {
  Success: 1,
  Failure: 0
};

class BufferLoader {

  constructor() {
    this._bufferCache = {};
  }

  load(urls, context) {
    if(typeof urls === 'string') {
      return this._bufferCache.hasOwnProperty(urls) ? this._bufferCache[urls] : this._load(urls);
    }

    return Promise.all(urls).map((url) => this._load(url, context));
  }

  _load(url, context) {
    return new Promise(resolve => {
      const req = new XMLHttpRequest();
      req.open('GET', url, true);
      req.responseType = 'arraybuffer';

      const reject = err => {
        const downloadResult = { url: url, error: err, status: DownloadStatus.Failure };
        resolve(downloadResult);
      };

      req.addEventListener('load', () => {
        context.decodeAudioData(req.response).then(buffer => {
          this._bufferCache[url] = buffer;
          const downloadResult = { url: url, value: buffer, status: DownloadStatus.Success };
          resolve(downloadResult);
        }, reject);
      }, false);

      req.addEventListener('error', reject, false);
      req.send();
    });
  }

  unload(urls) {
    if(typeof urls === "string") {
      this._unload(urls);
      return;
    }

    if(Array.isArray(urls)) {
      urls.map(this._unload, this);
      return;
    }

    this._bufferCache = {};
  }

  _unload(url) {
    delete this._bufferCache[url];
  }
}

export default BufferLoader;
