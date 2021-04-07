import { expect } from 'chai';

import { getCategoryPresentationOption } from '/apiV1/dataBuilders/helpers/getCategoryPresentationOption';

describe('getCategoryPresentationOption()', () => {
  const testConfig = {
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

  const testFunction = (testData, config) => {
    for (const [values, expectedValue] of testData) {
      expect(getCategoryPresentationOption(config, values)).to.equal(expectedValue);
    }
  };
  describe('type: $condition', () => {
    it('condition: someNotAll', () => {
      const testData = [
        [[null, null, 2, null], 'orange'],
        [[1, 1, 3, 0], 'orange'],
      ];
      testFunction(testData, testConfig);
    });
    it('condition: >', () => {
      const testData = [
        [[1, 1, 2, 2], 'green'],
        [[1, 1, 3, 4], 'green'],
      ];
      testFunction(testData, testConfig);
    });
    it('condition: in', () => {
      const testData = [
        [[0, 0, 0, 0], 'red'],
        [[0, null, 0, null], 'red'],
      ];
      testFunction(testData, testConfig);
    });
    it('no condition meet', () => {
      const newTestConfig = {
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
        ],
      };
      const testData = [
        [[null, null, 2, null], undefined],
        [[1, 1, 3, 0], undefined],
      ];
      testFunction(testData, newTestConfig);
    });
  });
});
