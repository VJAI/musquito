import Heap  from './Heap';
import Sound from './Sound';

describe('Heap', () => {

  let heap = null;

  const url = '/base/sounds/bg.mp3',
    groupId = 1,
    sound = new Sound({
      stream: true,
      audio: new Audio(),
      id: 100
    });

  beforeEach(() => {
    heap = new Heap(1);
  });

  afterEach(() => {
    heap.destroy();
  });

  describe('on adding sound', () => {

    beforeEach(() => {
      heap.add(url, groupId, sound);
    });

    it('should store the sound', () => {
      expect(heap._collections[url]).not.toBeNull();
    });
  });

  describe('on calling free', () => {

  });
});
