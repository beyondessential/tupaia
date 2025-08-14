import {
  allValuesAreNumbers,
  constructEveryItemSync,
  constructIsArrayOf,
  constructIsOneOfType,
  isURLPathSegment,
  isArray,
  isBoolean,
  isHexColor,
  isURL,
  constructIsShorterThan,
} from '../../validation';

describe('validatorFunctions', () => {
  describe('isArray', () => {
    it('fails if not given an array', () => {
      [undefined, null, 1, '1', true, { alpha: 1 }].forEach(value => {
        expect(() => isArray(value)).toThrowError(/should contain an array/i);
      });
    });

    it('passes if given an array', () => {
      expect(() => isArray([])).not.toThrow();
      expect(() => isArray([1, 2])).not.toThrow();
    });
  });

  describe('isBoolean', () => {
    it('pass if given a boolean', () => {
      expect(() => isBoolean(true)).not.toThrow();
      expect(() => isBoolean(false)).not.toThrow();
    });

    const testData = [
      ['"true"', 'true'],
      ['"false"', 'false'],
      ['number', 1],
      ['undefined', undefined],
      ['null', null],
      ['[true, false]', [true, false]],
    ];

    describe('fails if given a non boolean', () => {
      it.each(testData)('%s', (type, value) => {
        expect(() => isBoolean(value)).toThrow(/should contain a boolean/i);
      });
    });
  });

  describe('isURL', () => {
    it('pass if given a valid url', () => {
      expect(() => isURL('www.beyondessential.com.au')).not.toThrow();
      expect(() => isURL('https://www.beyondessential.com.au')).not.toThrow();
    });

    it('fails if given a non valid url', () => {
      expect(() => isURL('junk')).toThrow();
      expect(() => isURL('asdf')).toThrow();
    });
  });

  describe('isHexColor', () => {
    it('pass if given a valid hex color', () => {
      expect(() => isHexColor('#aabbcc')).not.toThrow();
      expect(() => isHexColor('#333')).not.toThrow();
    });

    it('fails if given a non valid hex color', () => {
      expect(() => isHexColor('123456123')).toThrow();
      expect(() => isHexColor('aaggee')).toThrow();
      expect(() => isHexColor('12')).toThrow();
    });
  });

  describe('isURLPathSegment', () => {
    it('pass if given a valid string', () => {
      expect(() => isURLPathSegment('example123')).not.toThrow();
      expect(() => isURLPathSegment('example_segment')).not.toThrow();
      expect(() => isURLPathSegment('example-segment')).not.toThrow();
    });

    it('fails if given a non valid string', () => {
      expect(() => isURLPathSegment('about/page')).toThrow();
      expect(() => isURLPathSegment('invalid!segment"')).toThrow();
    });
  });

  describe('allValuesAreNumbers', () => {
    it('fails if a not given an object', () => {
      expect(() => allValuesAreNumbers(null)).toThrowError();
    });

    it('fails if a value is not a number', () => {
      expect(() => allValuesAreNumbers({ hi: 'hello' })).toThrowError(
        "Value 'hi' is not a number: 'hello'",
      );
    });

    it('passes if all values are numbers', () => {
      expect(() => allValuesAreNumbers({ hi: 1, hello: 2 })).not.toThrowError();
    });

    it('passes if given an empty object', () => {
      expect(() => allValuesAreNumbers({})).not.toThrowError();
    });
  });

  describe('constructEveryItemSync', () => {
    it('passes if input is empty', () => {
      const validator = constructEveryItemSync(() => true);
      expect(() => validator([])).not.toThrowError();
    });

    it('passes if input is empty, even if the validator always fails', () => {
      const validator = constructEveryItemSync(() => {
        throw new Error();
      });
      expect(() => validator([])).not.toThrowError();
    });

    it('fails if input is not an array ', () => {
      const validator = constructEveryItemSync(() => true);
      [undefined, null, {}].forEach(value => {
        expect(() => validator(value)).toThrowError('array');
      });
    });

    it('fails if any item in the input fails the validator', () => {
      const errorMessage = 'Test error';
      const validator = value => {
        if (value !== '0') {
          throw new Error(errorMessage);
        }
      };

      expect(() => validator([0])).toThrowError(errorMessage);
      expect(() => validator([1, 0])).toThrowError(errorMessage);
    });
  });

  describe('constructIsOneOfType', () => {
    it('throws if types are not an array', () => {
      expect(() => constructIsOneOfType('string')).toThrow('expects an array');
    });

    it('throws if types are an empty array ', () => {
      expect(() => constructIsOneOfType([])).toThrow('expects at least one type');
    });

    describe('single type - validator passes', () => {
      const testData = [
        ['array', [1, 2]],
        ['object', { alpha: 1 }],
        ['number', 1],
        ['string', '1'],
        ['boolean', false],
        ['undefined', undefined],
        ['null', null],
      ];

      it.each(testData)('%s', (type, value) => {
        const validator = constructIsOneOfType([type]);
        expect(() => validator(value)).not.toThrow();
      });
    });

    describe('single type - validator fails', () => {
      const testData = [
        ['array', { alpha: 1 }],
        ['object', [1, 2]],
        ['number', '1'],
        ['string', 1],
        ['boolean', 'true'],
        ['undefined', null],
        ['null', { a: 1 }],
      ];

      it.each(testData)('%s', (type, value) => {
        const validator = constructIsOneOfType([type]);
        expect(() => validator(value)).toThrow(`Must be one of ${type}`);
      });
    });

    it('multiple types - validator passes', () => {
      const validator = constructIsOneOfType(['string', 'number', 'array']);
      expect(() => validator(1)).not.toThrow();
      expect(() => validator([1])).not.toThrow();
    });

    it('multiple types - validator fails', () => {
      const validator = constructIsOneOfType(['string', 'number', 'array']);
      const errorMessage = 'Must be one of string | number | array';
      expect(() => validator({ alpha: 1 })).toThrow(errorMessage);
      expect(() => validator(false)).toThrow(errorMessage);
    });
  });

  describe('constructIsArrayOf', () => {
    it('validator throws if value is not an array', () => {
      [undefined, { alpha: 1 }].forEach(value => {
        const validator = constructIsArrayOf(value);
        expect(() => validator()).toThrow(/should contain an array/i);
      });
    });

    it('validator passes for empty array', () => {
      const validator = constructIsArrayOf('object');
      expect(() => validator([])).not.toThrow();
    });

    describe('validator passes if all values are of the specified type', () => {
      const testData = [
        [
          'array',
          [
            [1, '2'],
            [true, { a: 1 }],
          ],
        ],
        ['object', [{ a: 1 }, { b: 2 }]],
        ['number', [1, 2]],
        ['string', ['1', '2']],
        ['boolean', [true, false]],
        ['undefined', [undefined, undefined]],
        ['null', [null, null]],
      ];

      it.each(testData)('%s', (type, value) => {
        const validator = constructIsArrayOf(type);
        expect(() => validator(value)).not.toThrow();
      });
    });

    describe('validator fails if some values are not of the specified type', () => {
      const testData = [
        ['array', [[1, '2'], { a: 1 }], `${JSON.stringify({ a: 1 })} is not an array`],
        ['object', [{ a: 1 }, [{ b: 2 }]], `${JSON.stringify([{ b: 2 }])} is not an object`],
        ['number', [1, '2'], "'2' is not a number"],
        ['string', ['1', 2], '2 is not a string'],
        ['boolean', [true, 'false'], "'false' is not a boolean"],
        ['undefined', [undefined, null], 'null is not undefined'],
        ['null', [{ a: 1 }, null], `${JSON.stringify({ a: 1 })} is not null`],
      ];

      it.each(testData)('%s', (type, value, expectedError) => {
        const validator = constructIsArrayOf(type);
        expect(() => validator(value)).toThrow(expectedError);
      });
    });
  });

  describe('constructIsShorterThan', () => {
    const validator = constructIsShorterThan(5);

    it('fails if value is longer than max length', () => {
      expect(() => validator('123456')).toThrowError(/Must be shorter than 5 characters/i);
    });

    it('passes if given a string shorter than the max length', () => {
      expect(() => validator('1234')).not.toThrow();
      expect(() => validator('')).not.toThrow();
    });
  });
});
