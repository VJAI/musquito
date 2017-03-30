import {Buzzer} from '../core/Buzzer';
import BaseBuzz, {BuzzState} from '../core/BaseBuzz';

Buzzer.prototype.fade = (to, duration) => {
  this._gain.gain.linearRampToValueAtTime(to, this._context.currentTime + duration);
  return this;
};

BaseBuzz.prototype.fade = (to, duration) => {
  if(this._state !== BuzzState.Playing) {
    return this;
  }

  this._gain.gain.linearRampToValueAtTime(to, this._context.currentTime + duration);

  return this;
};
