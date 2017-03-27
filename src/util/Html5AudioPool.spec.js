import Html5AudioPool from './Html5AudioPool';

describe('Html5AudioPool', () => {

  let html5AudioPool;

  beforeEach(() => {
    html5AudioPool = new Html5AudioPool();
  });

  afterEach(() => {
    html5AudioPool.dispose();
  });

  describe('on allocating a node for a sound', () => {

    const src = 'beep.mp3', soundId = '12345';

    beforeEach(() => {
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

  describe('on allocating a single nodes to a resource', () => {

    const src = 'beep.mp3';

    beforeEach(() => {
      html5AudioPool.allocate(src);
    });

    it('should create a new entry in the audio nodes object', () => {
      const audioNodes = html5AudioPool._audioNodes[src];

      expect(audioNodes).toBeDefined();
      expect(audioNodes.length).toBe(1);
    });
  });

  describe('on allocating multiple audio nodes to a resource', () => {

    const src = 'beep.mp3';

    beforeEach(() => {
      html5AudioPool.allocate(src);
      html5AudioPool.allocate(src);
    });

    it('should create a new entry in the audio nodes object', () => {
      const audioNodes = html5AudioPool._audioNodes[src];

      expect(audioNodes).toBeDefined();
      expect(audioNodes.length).toBe(2);
    });
  });

  describe('on releasing an allocated audio node of a sound', () => {

    beforeEach(() => {
      html5AudioPool._audioNodes = {
        'beep.mp3': [{id: 1, audio: new Audio()}, {id: 2, audio: new Audio()}]
      };

      html5AudioPool.release('beep.mp3', 1);
    });

    it('should remove the allocated sound from the node', () => {
      const audioNodes = html5AudioPool._audioNodes['beep.mp3'];

      expect(audioNodes[0].id).toBeNull();
    });
  });

  describe('on releasing all the inactive nodes of a resource', () => {

    beforeEach(() => {
      html5AudioPool._audioNodes = {
        'beep.mp3': [{id: 1, audio: new Audio()}, {id: null, audio: new Audio()}]
      };

      html5AudioPool.release('beep.mp3');
    });

    it('should remove all the inactive nodes of the resource', () => {
      const audioNodes = html5AudioPool._audioNodes['beep.mp3'];
      expect(audioNodes.length).toBe(1);
    });
  });

  describe('on releasing all the inactive nodes', () => {

    beforeEach(() => {
      html5AudioPool._audioNodes = {
        'beep.mp3': [{id: 1, audio: new Audio()}, {id: null, audio: new Audio()}],
        'click.mp3': [{id: null, audio: new Audio()}]
      };

      html5AudioPool.release();
    });

    it('should remove all of them', () => {
      expect(html5AudioPool._audioNodes['beep.mp3'].length).toBe(1);
      expect(html5AudioPool._audioNodes['click.mp3'].length).toBe(0);
    });
  });
});
