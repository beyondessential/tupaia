import { expect } from 'chai';

import { getCategoryPresentationOption } from '/apiV1/dataBuilders/helpers/getCategoryPresentationOption';

describe('getCategoryPresentationOption()', () => {
  const config = {
    type: '$condition',
    conditions: [
      {
        key: 'red',
        condition: {
          in: [null, 0],
        },
      },
      {
        key: 'green',
        condition: {
          '>': 0,
        },
      },
      {
        key: 'orange',
        condition: {
          someNotAll: { '>': 0 },
        },
      },
    ],
  };

  describe('type: $condition', () => {
    it('condition: someNotAll', () => {
      const testData = [
        [[null, null, 2, null], 'orange'],
        [[0, 0, 2, 0], 'orange'],
        [[1, 1, 3, 0], 'orange'],
      ];
      for (const [values, expectedValue] of testData) {
        expect(getCategoryPresentationOption(config, values)).to.equal(expectedValue);
      }
    });
    it('condition: >', () => {
      const testData = [
        [[1, 1, 2, 2], 'green'],
        [[1, 1, 3, 4], 'green'],
      ];
      for (const [values, expectedValue] of testData) {
        expect(getCategoryPresentationOption(config, values)).to.equal(expectedValue);
      }
    });
  });
});
