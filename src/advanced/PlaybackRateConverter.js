import BaseNodeConverter from './BaseNodeConverter';

class PlaybackRateConverter extends BaseNodeConverter {

  _playbackRate = 1;

  constructor(time, playbackRate) {
    super(time);
    this._playbackRate = playbackRate;
  }

  convert(node) {
    throw new Error('Not implemented');
  }
}

export { PlaybackRateConverter as default };
