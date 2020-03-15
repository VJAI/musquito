// Credit: https://github.com/goldfire/howler.js/issues/626

const WORKER_SCRIPT = `
  var timerIds = {}, timeoutWorker = {};
  
  timeoutWorker.setTimeout = function(timerId, duration) {
    timerIds[timerId] = setTimeout(function() {
      postMessage({ timerId: timerId });
    }, duration);
  };
  
  timeoutWorker.clearTimeout = function(timerId) {
    clearTimeout(timerIds[timerId]);
  };
  
  timeoutWorker.setInterval = function(timerId, duration) {
    timerIds[timerId] = setInterval(function() {
      postMessage({ timerId: timerId });
    }, duration);
  };
  
  timeoutWorker.clearInterval = function(timerId) {
    clearInterval(timerIds[timerId]);
  };
  
  onmessage = function(e) {
    var command = e.data.command;
    timeoutWorker[command](e.data.timerId, e.data.duration);
  };
`;

/**
 * Provides more accurate timeouts and intervals when the browser tab is not active using Web Workers.
 * @class
 */
class WorkerTimer {

  /**
   * Web worker.
   * @type {Worker}
   * @private
   */
  _worker = null;

  /**
   * Whether Web Worker is available or not. If not available then normal setTimeout and setInterval will be used.
   * @type {boolean}
   * @private
   */
  _isWorkerThreadAvailable = false;

  /**
   * Dictionary to store the callbacks that should be invoked after timeouts and intervals.
   * @type {{}}
   * @private
   */
  _timerCallbacks = {};

  /**
   * The incrementing id that is used to link the timer running in worker with the callback.
   * @type {number}
   * @private
   */
  _timerId = 0;

  /**
   * @constructor
   */
  constructor() {
    this._handleMessage = this._handleMessage.bind(this);
  }

  /**
   * Initialize the worker
   */
  init() {
    if (!Worker || this._worker) {
      return;
    }

    let blob = this._getBlob(WORKER_SCRIPT);
    if (blob === null) {
      return;
    }

    let workerUrl = this._createObjectURL(blob);
    if (workerUrl === null) {
      return;
    }

    this._worker = new Worker(workerUrl);
    this._worker.addEventListener('message', this._handleMessage);
    this._isWorkerThreadAvailable = true;
  }

  /**
   * Returns a blob.
   * @param {string} script The javascript code string.
   * @return {*}
   * @private
   */
  _getBlob(script) {
    let blob = null;

    try {
      blob = new Blob([script], { type: 'application/javascript' });
    } catch (e) {
      let blobBuilderType = null;

      if (typeof BlobBuilder !== 'undefined') {
        blobBuilderType = BlobBuilder;
      } else if (typeof WebKitBlobBuilder !== 'undefined') {
        blobBuilderType = WebKitBlobBuilder;
      }

      blob = new blobBuilderType(); // eslint-disable-line new-cap
      blob.append(script);
      blob = blob.getBlob();
    }

    return blob;
  }

  /**
   * Returns object url.
   * @param {*} file The blob.
   * @return {*}
   * @private
   */
  _createObjectURL(file) {
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      return URL.createObjectURL(file);
    } else if (typeof webkitURL !== 'undefined') {
      return webkitURL.createObjectURL(file);
    }

    return null;
  }

  /**
   * Callback that handles the messages send by worker.
   * @param {object} e Event argument that contains the message data and other information
   * @private
   */
  _handleMessage(e) {
    const callback = this._timerCallbacks[e.data.timerId];

    if (callback && callback.cb) {
      callback.cb();
    }

    if (!callback.repeat) {
      delete this._timerCallbacks[e.data.timerId];
    }
  }

  /**
   * Invokes a callback after the passed time.
   * @param {function} callback The callback that should be called after the elapsed period.
   * @param {number} duration The time period in ms.
   * @return {number}
   */
  setTimeout(callback, duration) {
    if (!this._isWorkerThreadAvailable) {
      return setTimeout(callback, duration);
    }

    this._timerId = this._timerId + 1;
    this._timerCallbacks[this._timerId] = { cb: callback, repeat: false };
    this._worker.postMessage({ command: 'setTimeout', timerId: this._timerId, duration: duration });
    return this._timerId;
  }

  /**
   * Clears the scheduled timeout.
   * @param {number} timeoutId The timeout id.
   */
  clearTimeout(timeoutId) {
    if (!this._isWorkerThreadAvailable) {
      return clearTimeout(timeoutId);
    }

    this._worker.postMessage({ command: 'clearTimeout', timerId: timeoutId });
    delete this._timerCallbacks[timeoutId];
  }

  /**
   * Invokes the callback function at the passed interval.
   * @param {function} callback The callback function.
   * @param {number} duration The time interval.
   * @return {number}
   */
  setInterval(callback, duration) {
    if (!this._isWorkerThreadAvailable) {
      return setInterval(callback, duration);
    }

    this._timerId = this._timerId + 1;
    this._timerCallbacks[this._timerId] = { cb: callback, repeat: true };
    this._worker.postMessage({ command: 'setInterval', timerId: this._timerId, duration: duration });
    return this._timerId;
  }

  /**
   * Clears the scheduled interval.
   * @param {number} intervalId The interval id.
   */
  clearInterval(intervalId) {
    if (!this._isWorkerThreadAvailable) {
      return clearTimeout(intervalId);
    }

    this._worker.postMessage({ command: 'clearTimeout', timerId: intervalId });
    delete this._timerCallbacks[intervalId];
  }

  /**
   * Kills the worker thread.
   */
  terminate() {
    if (this._worker) {
      this._worker.removeEventListener('message', this._handleMessage);
      this._worker.terminate();
      this._worker = null;
    }

    this._isWorkerThreadAvailable = false;
    this._timerCallbacks = {};
    this._timerId = 0;
  }
}

export default new WorkerTimer();
