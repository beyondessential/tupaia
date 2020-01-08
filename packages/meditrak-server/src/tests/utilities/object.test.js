import { expect } from 'chai';

import { getKeysSortedByValues, mapKeys } from '../../utilities/object';

describe('object utilities', () => {
  describe('getKeysSortedByValues', () => {
    it('should sort the keys of an object containing string values', () => {
      expect(
        getKeysSortedByValues({ fourth: 'd', third: 'c', second: 'b' }, { asc: true }),
      ).to.deep.equal(['second', 'third', 'fourth']);
    });

    it('should sort the keys of an object containing numeric string values', () => {
      expect(
        getKeysSortedByValues({ ten: '10', one: '1', two: '2' }, { asc: true }),
      ).to.deep.equal(['one', 'two', 'ten']);
    });

    it('should sort the keys of an object containing number values', () => {
      expect(getKeysSortedByValues({ five: 5, four: 4, one: 1 }, { asc: true })).to.deep.equal([
        'one',
        'four',
        'five',
      ]);
    });

    it('should use DESC direction if configured accordingly', () => {
      expect(getKeysSortedByValues({ one: 1, five: 5, four: 4 }, { asc: false })).to.deep.equal([
        'five',
        'four',
        'one',
      ]);
    });

    it('should default to ASC direction for empty options', () => {
      expect(getKeysSortedByValues({ five: 5, one: 1 }, {})).to.deep.equal(['one', 'five']);
    });

    it('should default to ASC direction for `undefined` options', () => {
      expect(getKeysSortedByValues({ five: 5, one: 1 })).to.deep.equal(['one', 'five']);
    });

    it('should default to ASC direction for `null` options', () => {
      expect(getKeysSortedByValues({ five: 5, one: 1 }), null).to.deep.equal(['one', 'five']);
    });
  });

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
