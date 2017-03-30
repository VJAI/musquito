import buzzer from './core/Buzzer';

$buzz.defaults = {

};

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

  const play = () => {

  };

  const pause = () => {

  };

  const stop = () => {

  };

  const volume = () => {

  };

  return {
    play: play,
    pause: pause,
    stop: stop,
    volume: volume
  };
}

export {$buzz as default};
