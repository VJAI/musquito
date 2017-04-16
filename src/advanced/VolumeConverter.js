import BaseNodeConverter from './BaseNodeConverter';

class VolumeConverter extends BaseNodeConverter {

  _volume = 0;

  constructor(time, volume) {
    super(time);
    this._volume = volume;
  }

  convert(node) {
    throw new Error('Not implemented');
  }
}

export { VolumeConverter as default };
