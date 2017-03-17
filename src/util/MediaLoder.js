import Html5AudioPool from './Html5AudioPool';

class MediaLoader {

  audioPool = Html5AudioPool;

  constructor(audioPool) {
    this.audioPool = audioPool;
  }

  load(urls) {

  }
}

export default MediaLoader;
