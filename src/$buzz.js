import buzzer from './core/Buzzer';
import BuzzCollection from './core/BuzzCollection';

const _api = {};

/**
 * Friendly API to play with collection of sounds.
 * @param {string} query
 * @return {{play: (function()), pause: (function()), stop: (function()), volume: (function())}}
 */
function $buzz(query) {

  let _buzzes = null;

  _buzzes = new BuzzCollection();

  const _play = () => {
    _buzzes.play();
    return $buzz;
  };

  const _pause = () => {
    _buzzes.pause();
    return $buzz;
  };

  const _stop = () => {
    _buzzes.stop();
    return $buzz;
  };

  const _volume = (volume) => {
    _buzzes.volume(volume);
    return $buzz;
  };

  const _mute = () => {
    _buzzes.mute();
    return $buzz;
  };

  const _unmute = () => {
    _buzzes.unmute();
    return $buzz;
  };

  const _undestroy = () => {
    _buzzes.destroy();
    return $buzz;
  };

  return _api;
}

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

$buzz.register = (name, method) => {
  if(_api.hasOwnProperty(name)) {
    throw new Error(`There is already a method registered with this name "${name}"`);
  }

  _api[name] = method;

  return $buzz;
};

$buzz.unregister = (name) => {
  if(!_api.hasOwnProperty(name)) {
    throw new Error('There is no method registered with this name "${name}"');
  }

  delete _api[name];
  return $buzz;
};

export {$buzz as default};
