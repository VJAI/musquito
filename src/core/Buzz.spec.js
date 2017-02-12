import Buzz from './Buzz';

describe('Buzz', () => {
  
  describe('when constructed', () => {
    
    let buzz;
    
    beforeEach(() => {
      buzz = new Buzz({ src: 'test.mp3' });
    });
    
    it('test', () => {
      expect(buzz).toBeDefined();
    });
  });
});
