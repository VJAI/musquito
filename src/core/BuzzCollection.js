class BuzzCollection {

  buzzes = [];

  constructor(buzzes) {
    this.buzzes = buzzes || [];
  }

  load() {

  }

  play() {
    this.buzzes.forEach(buzz => buzz.play());
    return this;
  }

  pause() {
    this.buzzes.forEach(buzz => buzz.pause());
    return this;
  }

  stop() {
    this.buzzes.forEach(buzz => buzz.stop());
    return this;
  }

  mute() {
    this.buzzes.forEach(buzz => buzz.mute());
    return this;
  }

  unmute() {
    this.buzzes.forEach(buzz => buzz.unmute());
    return this;
  }

  volume(volume) {
    this.buzzes.forEach(buzz => buzz.volume(volume));
    return this;
  }

  destroy() {
    this.buzzes.forEach(buzz => buzz.destroy());
    return this;
  }
}

export {BuzzCollection as default};
