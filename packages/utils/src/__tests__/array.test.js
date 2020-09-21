/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { countDistinct, min, max } from '../array';

describe('array', () => {
  const testData = [
    ['empty array', [], 0],
    ['single item ', [0], 1],
    ['multiple items, same value', [0], 1],
    ['multiple items, different values', [0, 1], 2],
    ['multiple items, mixed same & different values', [0, 1, 0, 1, 1, 2], 3],
  ];
  describe('countDistinct', () => {
    it.each(testData)('%s', (string, input, expected) => {
      expect(countDistinct(input)).toBe(expected);
    });

    describe('custom mappers', () => {
      const customMappersTestData = [
        ['function', [1.1, 2, 1.3], Math.floor, 2],
        [
          'string',
          [
            { age: 18, postcode: '3121', gender: 'female' },
            { age: 18, postcode: '3122', gender: 'male' },
            { age: 18, postcode: '3123', gender: 'female' },
            { age: 18, postcode: '3123', gender: 'female' },
          ],
          'gender',
          2,
        ],
      ];

      it.each(customMappersTestData)('%s', (string, array, mapperInput, expected)=>{
        expect(countDistinct(array, mapperInput)).toBe(expected);
      });
    });
  });

  describe('min', () => {
    const testData = [
      [[2, 3, 10], 2],
      [[-2, 1, 3, 10], -2],
    ];
    it.each(testData)(
      'should return the minimum against the provided values',
      (input, expected) => {
        expect(min(input)).toBe(expected);
      },
    );
    it('should return `undefined` for a non compatible input', () => {
      [undefined, null, []].forEach(input => expect(min(input)).toBeUndefined());
    });
  });

  describe('max', () => {
    const testData = [
      [[2, 3, 10], 10],
      [[-20, 1, 3, 10], 10],
    ];
    it.each(testData)(
      'should return the maximum against the provided values',
      (input, expected) => {
        expect(max(input)).toBe(expected);
      },
    );

    it('should return `undefined` for a non compatible input', () => {
      [undefined, null, []].forEach(input => expect(max(input)).toBeUndefined());
    });
  });
});
