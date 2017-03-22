import Html5AudioPool from './Html5AudioPool';

describe('Html5AudioPool', () => {

  let html5AudioPool;

  beforeEach(() => {
    html5AudioPool = new Html5AudioPool();
  });

  afterEach(() => {

  });

  describe('on allocating a node for a sound', () => {

    const src = 'beep.mp3', soundId = '12345';

    beforeAll(() => {
      html5AudioPool.allocate(src, soundId);
    });

    it('should create a new entry into the audio nodes object', () => {
      const audioNodes = html5AudioPool._audioNodes[src];

      expect(audioNodes).toBeDefined();
      expect(audioNodes.length).toBe(1);
      expect(audioNodes[0].id).toBe(soundId);
      expect(audioNodes[0].audio).toBeDefined();
    });
  });


});
