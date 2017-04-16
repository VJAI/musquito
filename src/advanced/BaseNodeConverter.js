class BaseNodeConverter {

  _time = 0;

  constructor(time) {
    this._time = time;
  }

  convert(node) {
    throw new Error('Not implemented');
  }
}

export { BaseNodeConverter as default };
