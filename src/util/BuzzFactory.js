import BufferBuzz from '../core/BufferBuzz';
import MediaBuzz from '../core/MediaBuzz';

const createBuzz = (options) => {
  const buzzType = typeof options === 'object' && options.buffer === true ? 'Media' : 'Buffer';
  return buzzType === 'Buffer' ? new BufferBuzz(options) : new MediaBuzz(options);
};

export default createBuzz;
