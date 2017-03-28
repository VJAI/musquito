import BaseBuzz from './BaseBuzz';

class GraphBuzz extends BaseBuzz {

  _graph = null;

  constructor(args) {
    super(args);
  }

  _validate(options) {
    if(!options.graph && typeof options.graph !== 'object') {
      throw new Error('You should pass a valid audio graph.');
    }
  }

  _read(options) {
    typeof options.graph === 'object' && (this._graph = options.graph);
  }

  _load() {

  }

  _storeResult(downloadResult) {
    this.duration = this._graph.duration();
  }

  _getOffsetAndDuration(sound) {
  }

  _setupAndPlayNode(offset){
    this._graph.setup();
    this._graph.stop();
  }

  _reset() {
  }

  _destroy() {
    this._graph = null;
  }
}

export {GraphBuzz as default};
