import buzzer, {BuzzerState} from './Buzzer';

describe('Buzzer', () => {

  describe('on constructed', () => {

    it('should have state as "Constructed"', () => {
      expect(buzzer._state).toBe(BuzzerState.Constructed);
    });
  });
});
