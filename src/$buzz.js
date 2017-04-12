import buzzer from './core/Buzzer';
import BuzzCollection from './core/BuzzCollection';
import createBuzz from './util/BuzzFactory';

function $buzz(...args) {
  if (args.length === 0) {
    throw new Error('You should pass at-least one argument');
  }

  if (args.length === 1) {
    return createBuzz(args[0]);
  }

  return new BuzzCollection(args);
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

export { $buzz as default };
