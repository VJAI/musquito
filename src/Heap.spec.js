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
    heap = new Heap(1); // inactive time - 1 minute
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

    let sound1 = new Sound({
        stream: true,
        audio: new Audio(),
        id: 101
      }),
      sound2 = new Sound({
        stream: true,
        audio: new Audio(),
        id: 102
      });

    beforeEach(() => {
      sound1._lastPlayed = new Date(Date.now() - 120000);
      heap.add(url, groupId, sound1);
      heap.add(url, groupId, sound2);
      spyOn(sound1, 'destroy');
      spyOn(sound2, 'destroy');
      heap.free();
    });

    it('should destroy the inactive sound', () => {
      expect(heap._collections[url].items.hasOwnProperty(sound1.id())).toBe(false);
      expect(sound1.destroy).toHaveBeenCalled();
    });

    it('should not destroy the active sound', () => {
      expect(heap._collections[url].items.hasOwnProperty(sound2.id())).toBe(true);
      expect(sound2.destroy).not.toHaveBeenCalled();
    });
  });
});
