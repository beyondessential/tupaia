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
      expect(getCategoryPresentationOption(config, [null, null, 2, null])).toBe('orange');
      expect(getCategoryPresentationOption(config, [1, 1, 3, 0])).toBe('orange');
    });

    it('condition: >', () => {
      expect(getCategoryPresentationOption(config, [1, 1, 2, 2])).toBe('green');
      expect(getCategoryPresentationOption(config, [1, 1, 3, 4])).toBe('green');
    });

    it('condition: in', () => {
      expect(getCategoryPresentationOption(config, [0, 0, 0, 0])).toBe('red');
      expect(getCategoryPresentationOption(config, [0, null, 0, null])).toBe('red');
    });

    it('no condition meet', () => {
      expect(getCategoryPresentationOption(config, [null, null, -2, null])).toBe(undefined);
      expect(getCategoryPresentationOption(config, [-1, -1, -3, 0])).toBe(undefined);
    });
  });
});
