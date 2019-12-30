import { expect } from 'chai';
import { mapKeys } from '../../utilities';

describe('object utilities', () => {
  describe('mapKeys', () => {
    it('should return a new object with mapped keys', () => {
      const object = { a: 1, b: 2 };
      const mapping = { a: 'alpha', b: 'beta' };

      expect(mapKeys(object, mapping)).to.deep.equal({
        alpha: 1,
        beta: 2,
      });
    });

    it('should exclude keys not specified in the mapping from the result', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      expect(mapKeys(object, mapping)).to.deep.equal({
        alpha: 1,
        gamma: 3,
      });
    });
  });
});
