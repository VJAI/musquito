import buzzer from './core/Buzzer';
import BuzzCollection from './core/BuzzCollection';

$buzz.defaults = {};

$buzz.config = (options) => {
  buzzer.setup(options);
  return $buzz;
};

$buzz.volume = (volume) => {
  buzzer.volume(volume);
  return $buzz;
};

$buzz.mute = () => {
  buzzer.mute();
  return $buzz;
};

$buzz.unmute = () => {
  buzzer.unmute();
  return $buzz;
};

/**
 * Friendly API to play with collection of sounds.
 * @param {string} query
 * @return {{play: (function()), pause: (function()), stop: (function()), volume: (function())}}
 */
function $buzz(query) {

  let _buzzes = null;

  _buzzes = new BuzzCollection();

  const play = () => {
    _buzzes.play();
    return $buzz;
  };

  const pause = () => {
    _buzzes.pause();
    return $buzz;
  };

  const stop = () => {
    _buzzes.stop();
    return $buzz;
  };

  const volume = (volume) => {
    _buzzes.volume(volume);
    return $buzz;
  };



  return {
    play: play,
    pause: pause,
    stop: stop,
    volume: volume,
    mute: mute,
    unmute: unmute,
    destroy: undestroy
  };
}

export {$buzz as default};
