import {
  filterValues,
  flattenToObject,
  getKeysSortedByValues,
  getSortByKey,
  getUniqueObjects,
  haveSameFields,
  jsonOperatorAwareSnake,
  mapKeys,
  mapValues,
  orderBy,
  reduceToArrayDictionary,
  reduceToDictionary,
  reduceToSet,
  stripFields,
} from '../object';

describe('object', () => {
  describe('getKeysSortedByValues()', () => {
    const testData = [
      [
        'should sort the keys of an object containing string values',
        [{ fourth: 'd', third: 'c', second: 'b' }, { asc: true }],
        ['second', 'third', 'fourth'],
      ],
      [
        'should sort the keys of an object containing numeric string values',
        [{ ten: '10', one: '1', two: '2' }, { asc: true }],
        ['one', 'two', 'ten'],
      ],
      [
        'should sort the keys of an object containing number values',
        [{ five: 5, four: 4, one: 1 }, { asc: true }],
        ['one', 'four', 'five'],
      ],
      [
        'should use DESC direction if configured accordingly',
        [{ one: 1, five: 5, four: 4 }, { asc: false }],
        ['five', 'four', 'one'],
      ],
      [
        'should default to ASC direction for empty options',
        [{ five: 5, one: 1 }, {}],
        ['one', 'five'],
      ],
      [
        'should default to ASC direction for `undefined` options',
        [{ five: 5, one: 1 }, undefined],
        ['one', 'five'],
      ],
      [
        'should default to ASC direction for `null` options',
        [{ five: 5, one: 1 }, null],
        ['one', 'five'],
      ],
    ];

    it.each(testData)('%s', (_, [object, options], expected) => {
      expect(getKeysSortedByValues(object, options)).toStrictEqual(expected);
    });
  });

  describe('getSortByKey()', () => {
    const assertSortingCorrectness = (sortingMethod, input, expectedValue) => {
      const arrayToSort = [...input];
      arrayToSort.sort(sortingMethod);
      expect(arrayToSort).toStrictEqual(expectedValue);
    };

    it('should return a method that sorts string values', () => {
      const alpha = { name: 'alpha' };
      const beta = { name: 'beta' };
      const alphabet = { name: 'alphabet' };
      const sortByName = getSortByKey('name', { ascending: true });

      const testData = [
        [
          [alpha, alpha],
          [alpha, alpha],
        ],
        [
          [alpha, beta],
          [alpha, beta],
        ],
        [
          [beta, alpha],
          [alpha, beta],
        ],
        [
          [alphabet, alpha],
          [alpha, alphabet],
        ],
        [
          [beta, alpha, alphabet, alpha],
          [alpha, alpha, alphabet, beta],
        ],
      ];

      testData.forEach(([input, expected]) => {
        assertSortingCorrectness(sortByName, input, expected);
      });
    });

    it('should return a method that sorts numeric string values', () => {
      const ten = { value: 'a10b' };
      const eleven = { value: 'a11b' };
      const thousand = { value: 'a1000b' };
      const sortByValue = getSortByKey('value', { ascending: true });

      const testData = [
        [
          [thousand, ten],
          [ten, thousand],
        ],
        [
          [thousand, eleven],
          [eleven, thousand],
        ],
        [
          [thousand, ten, eleven],
          [ten, eleven, thousand],
        ],
      ];

      testData.forEach(([input, expected]) => {
        assertSortingCorrectness(sortByValue, input, expected);
      });
    });

    it('should return a method that sorts number values', () => {
      const one = { value: 1 };
      const two = { value: 2 };
      const ten = { value: 10 };
      const sortByValue = getSortByKey('value', { ascending: true });

      const testData = [
        [
          [one, one],
          [one, one],
        ],
        [
          [one, two],
          [one, two],
        ],
        [
          [two, one],
          [one, two],
        ],
        [
          [ten, one],
          [one, ten],
        ],
        [
          [ten, one, two, one],
          [one, one, two, ten],
        ],
      ];

      testData.forEach(([input, expected]) => {
        assertSortingCorrectness(sortByValue, input, expected);
      });
    });

    const one = { value: 1 };
    const two = { value: 2 };

    it('should return a method that sorts values in DESC order, if configured accordingly', () => {
      const sortByValue = getSortByKey('value', { ascending: false });
      assertSortingCorrectness(sortByValue, [one, two], [two, one]);
    });

    it('should default to ASC direction for `undefined` options', () => {
      const sortByValue = getSortByKey('value');
      assertSortingCorrectness(sortByValue, [two, one], [one, two]);
    });

    it('should default to ASC direction for `null` options', () => {
      const sortByValue = getSortByKey('value', null);
      assertSortingCorrectness(sortByValue, [two, one], [one, two]);
    });
  });

  describe('orderBy', () => {
    const one = { name: 'one', value: 1, stringValue: '1', id: '000a' };
    const two = { name: 'two', value: 2, stringValue: '2', id: '000b' };
    const five = { name: 'five', value: 5, stringValue: '5', id: '000c' };
    const twenty = { name: 'twenty', value: 20, stringValue: '20', id: '000d' };
    const hundredA = { name: 'hundred', value: 100, stringValue: '100', id: '000e' };
    const hundredB = { name: 'hundred', value: 100, stringKey: '100', id: '000f' };

    const testData = [
      ['empty array', [[], [x => x]], []],
      ['accepts functions as value mappers', [[two, one], [x => x.id]], [one, two]],
      ['accepts strings as value mappers', [[two, one], ['value']], [one, two]],
      [
        'retains the existing order for items that are evaluated as equal',
        [[hundredB, one, hundredA], [x => x.value]],
        [one, hundredB, hundredA],
      ],
      [
        'allows orders to be specified for each mapper',
        [
          [hundredB, five, hundredA, two],
          ['name', 'id'],
          ['asc', 'desc'],
        ],
        [five, hundredB, hundredA, two],
      ],
      [
        'uses "asc" order by default',
        [[hundredB, five, hundredA, two], ['name', 'id'], ['asc']],
        [five, hundredA, hundredB, two],
      ],
      [
        "uses natural order ('1' before '20' before '100')",
        [[one, hundredA, twenty], ['stringValue']],
        [one, twenty, hundredA],
      ],
    ];

    it.each(testData)('%s', (_, [array, valueMappers, orders], expected) => {
      expect(orderBy(array, valueMappers, orders)).toStrictEqual(expected);
    });
  });

  describe('reduceToDictionary()', () => {
    const object1 = { id: 'id1', value: 10 };
    const object2 = { id: 'id2', value: 20 };

    it('should accept either an array or a dictionary of objects as input', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).toStrictEqual(
        reduceToDictionary({ id1: object1, id2: object2 }, 'id', 'value'),
      );
    });

    describe('key mappers', () => {
      it('string', () => {
        const result = reduceToDictionary([object1, object2], 'id', 'value');
        expect(Object.keys(result)).toStrictEqual(['id1', 'id2']);
      });

      it('function', () => {
        const result = reduceToDictionary([object1, object2], object => object.value / 100, 'id');
        expect(Object.keys(result)).toStrictEqual(['0.1', '0.2']);
      });
    });

    describe('value mappers', () => {
      it('string', () => {
        const result = reduceToDictionary([object1, object2], 'id', 'value');
        expect(Object.values(result)).toStrictEqual([10, 20]);
      });

      it('function', () => {
        const result = reduceToDictionary([object1, object2], 'id', object => object.value / 100);
        expect(Object.values(result)).toStrictEqual([0.1, 0.2]);
      });
    });

    it('should combine key and value mappers into an object', () => {
      expect(reduceToDictionary([object1, object2], 'id', 'value')).toStrictEqual({
        id1: 10,
        id2: 20,
      });
    });
  });

  describe('reduceToArrayDictionary()', () => {
    const object1 = { id: 'id1', value: 10 };
    const object2 = { id: 'id2', value: 20 };
    const object3 = { id: 'id2', value: 30 };

    it('should accept either an array or a dictionary of objects as input', () => {
      expect(reduceToArrayDictionary([object1, object2, object3], 'id', 'value')).toStrictEqual(
        reduceToArrayDictionary({ id1: object1, id2: object2, id3: object3 }, 'id', 'value'),
      );
    });

    describe('key mappers', () => {
      it('string', () => {
        const result = reduceToArrayDictionary([object1, object2, object3], 'id', 'value');
        expect(Object.keys(result)).toStrictEqual(['id1', 'id2']);
      });

      it('function', () => {
        const result = reduceToArrayDictionary(
          [object1, object2, object3],
          object => object.value % 10,
          'id',
        );
        expect(Object.keys(result)).toStrictEqual(['0']);
      });
    });

    describe('value mappers', () => {
      it('string', () => {
        const result = reduceToArrayDictionary([object1, object2, object3], 'id', 'value');
        expect(Object.values(result)).toStrictEqual([[10], [20, 30]]);
      });

      it('function', () => {
        const result = reduceToArrayDictionary(
          [object1, object2, object3],
          'id',
          object => object.value / 100,
        );
        expect(Object.values(result)).toStrictEqual([[0.1], [0.2, 0.3]]);
      });
    });

    it('should combine key and value mappers into an object', () => {
      expect(reduceToArrayDictionary([object1, object2, object3], 'id', 'value')).toStrictEqual({
        id1: [10],
        id2: [20, 30],
      });
    });
  });

  describe('flattenToObject()', () => {
    const object1 = { id: 'id1', value: 10 };
    const object2 = { id: 'id2', value: 20 };
    const object3 = { name: 'Fiji', code: 'FJ' };

    const testData = [
      [
        'should create an object out of an array of objects',
        [object1, object3],
        { id: 'id1', value: 10, name: 'Fiji', code: 'FJ' },
      ],
      [
        'should create an object out of an object dictionary',
        { object1, object3 },
        { id: 'id1', value: 10, name: 'Fiji', code: 'FJ' },
      ],
      [
        'should use the last value for key conflicts (i)',
        { object2, object1, object3 },
        { id: 'id1', value: 10, name: 'Fiji', code: 'FJ' },
      ],
      [
        'should use the last value for key conflicts (ii)',
        { object1, object2, object3 },
        {
          id: 'id2',
          value: 20,
          name: 'Fiji',
          code: 'FJ',
        },
      ],
    ];

    it.each(testData)('%s', (_, objectCollection, expected) => {
      expect(flattenToObject(objectCollection)).toStrictEqual(expected);
    });
  });

  describe('reduceToSet()', () => {
    const object1 = { id: 'id1', value: 10 };
    const object2 = { id: 'id2', value: 20 };
    const expectedResult = new Set(['id1', 'id2']);

    it('should create a set out of an array of objects', () => {
      expect(reduceToSet([object1, object2], 'id')).toStrictEqual(expectedResult);
    });

    it('should create a set out of an object dictionary', () => {
      expect(reduceToSet({ id1: object1, id2: object2 }, 'id')).toStrictEqual(expectedResult);
    });
  });

  describe('mapKeys', () => {
    it('options parameter should be optional', () => {
      expect(mapKeys({}, {})).toBeInstanceOf(Object);
    });

    it('should return a new object with mapped keys', () => {
      const object = { a: 1, b: 2 };
      const mapping = { a: 'alpha', b: 'beta' };

      expect(mapKeys(object, mapping)).toStrictEqual({
        alpha: 1,
        beta: 2,
      });
    });

    describe('`defaultToExistingKeys` option', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { a: 'alpha', c: 'gamma' };

      const testData = [
        [
          'should support an option to default to existing keys',
          { defaultToExistingKeys: true },
          { alpha: 1, b: 2, gamma: 3 },
        ],
        [
          'should support an option to not default to existing keys',
          { defaultToExistingKeys: false },
          { alpha: 1, gamma: 3 },
        ],
        [
          'should not default to existing keys for undefined options',
          undefined,
          { alpha: 1, gamma: 3 },
        ],
        ['should not default to existing keys for empty options', {}, { alpha: 1, gamma: 3 }],
      ];

      it.each(testData)('%s', (_, options, expected) => {
        expect(mapKeys(object, mapping, options)).toStrictEqual(expected);
      });
    });
  });

  describe('mapValues', () => {
    it('options parameter should be optional', () => {
      expect(mapKeys({}, {})).toBeInstanceOf(Object);
    });

    it('should return a new object with mapped values', () => {
      const object = { a: 1, b: 2 };
      const mapping = { 1: 'alpha', 2: 'beta' };

      expect(mapValues(object, mapping)).toStrictEqual({
        a: 'alpha',
        b: 'beta',
      });
    });

    describe('`defaultToExistingKeys` option', () => {
      const object = { a: 1, b: 2, c: 3 };
      const mapping = { 1: 'alpha', 3: 'gamma' };

      const testData = [
        [
          'should support an option to default to existing values',
          { defaultToExistingValues: true },
          { a: 'alpha', b: 2, c: 'gamma' },
        ],
        [
          'should support an option to not default to existing values',
          { defaultToExistingValues: false },
          { a: 'alpha', c: 'gamma' },
        ],
        [
          'should not default to existing values for undefined options',
          undefined,
          { a: 'alpha', c: 'gamma' },
        ],
        ['should not default to existing values for empty options', {}, { a: 'alpha', c: 'gamma' }],
      ];

      it.each(testData)('%s', (_, options, expected) => {
        expect(mapValues(object, mapping, options)).toStrictEqual(expected);
      });
    });
  });

  describe('filterValues', () => {
    const object = { a: 1, b: 2, alpha: 1 };

    const testData = [
      ['no entry passes', value => value === 3, {}],
      ['one entry passes', value => value === 2, { b: 2 }],
      ['multiple entries pass', value => value === 1, { a: 1, alpha: 1 }],
      ['all entries pass', () => true, { a: 1, b: 2, alpha: 1 }],
    ];

    it.each(testData)('%s', (_, valueFilter, expected) => {
      expect(filterValues(object, valueFilter)).toStrictEqual(expected);
    });

    it('no entries in object', () => {
      expect(filterValues({}, () => true)).toStrictEqual({});
    });
  });

  describe('stripFields', () => {
    const object = { a: 1, b: 2, c: 3 };
    const testData = [
      ['should remove a single field, and retain the others', ['b'], { a: 1, c: 3 }],
      ['should remove multiple fields, and retain others', ['a', 'b'], { c: 3 }],
      ['should remove all fields', ['a', 'b', 'c'], {}],
      [
        'should make no changes when the fields to strip are not present',
        ['d', 'e'],
        { a: 1, b: 2, c: 3 },
      ],
      ['should make no changes when fields to strip is undefined', undefined, { a: 1, b: 2, c: 3 }],
    ];

    it.each(testData)('%s', (_, fieldsToStrip, expected) => {
      expect(stripFields(object, fieldsToStrip)).toStrictEqual(expected);
    });

    const undefinedParamPermutations = [
      [undefined, ['a']],
      [undefined, undefined],
    ];

    it.each(undefinedParamPermutations)(
      'should return an empty object when object is undefined',
      (obj, fieldsToStrip) => {
        expect(stripFields(obj, fieldsToStrip)).toStrictEqual({});
      },
    );
  });

  describe('getUniqueObjects', () => {
    const testData = [
      ['one empty object', [{}], [{}]],
      ['one non empty object', [{ a: 1 }], [{ a: 1 }]],
      ['different objects', [{ a: 1 }, { b: 2 }], [{ a: 1 }, { b: 2 }]],
      [
        'same objects - same key order (keys are sorted)',
        [
          { b: 2, a: 1 },
          { b: 2, a: 1 },
        ],
        [{ a: 1, b: 2 }],
      ],
      [
        'same objects - different key order',
        [
          { b: 2, a: 1 },
          { a: 1, b: 2 },
        ],
        [{ a: 1, b: 2 }],
      ],
      [
        'mix of different and same objects',
        [{ b: 2, a: 1 }, { a: 1, b: 2 }, { a: 1 }],
        [{ a: 1, b: 2 }, { a: 1 }],
      ],
    ];

    it.each(testData)('%s', (_, objects, expected) => {
      expect(getUniqueObjects(objects)).toStrictEqual(expected);
    });
  });

  describe('have same fields', () => {
    describe('returns `true` if all objects have the same values for all the specified fields', () => {
      const testData = [
        ['objects with same values, empty fields', [{ a: 1 }, { a: 1 }], []],
        ['objects with same values for a field', [{ a: 1 }, { a: 1 }], ['a']],
        [
          'objects with same values for fields (multiple)',
          [
            { a: 1, b: 2, c: 3 },
            { a: 1, b: 2, c: 3 },
            { a: 1, b: 2, c: 3 },
          ],
          ['a', 'b', 'c'],
        ],
        ['objects with different values, empty fields', [{ a: 1 }, { a: 2 }], []],
        ['objects with different values, non existing field', [{ a: 1 }, { a: 2 }], ['b']],
        [
          'objects with different values for a non specified field',
          [
            { a: 1, b: 2 },
            { a: 1, b: 'different' },
          ],
          ['a'],
        ],
      ];

      it.each(testData)('%s', (_, objectCollection, fields) => {
        expect(haveSameFields(objectCollection, fields)).toBe(true);
      });
    });

    describe('returns `false` if an object has a different value for any of the specified fields', () => {
      const testData = [
        ['objects with different values for a field', [{ a: 1 }, { a: 2 }], ['a']],
        [
          'multiple objects with just one different value',
          [
            { a: 1, b: 2, c: 3 },
            { a: 1, b: 2, c: 3 },
            { a: 1, b: 2, c: 'different' },
          ],
          ['a', 'b', 'c'],
        ],
        [
          'multiple objects with just one strictly different value',
          [
            { a: 1, b: 2, c: 3 },
            { a: 1, b: 2, c: 3 },
            { a: 1, b: 2, c: '3' },
          ],
          ['a', 'b', 'c'],
        ],
      ];

      it.each(testData)('%s', (_, objectCollection, fields) => {
        expect(haveSameFields(objectCollection, fields)).toBe(false);
      });
    });
  });

  describe('jsonOperatorAwareSnake', () => {
    const cases = [
      [
        'converts vanilla camelCase string to snake_case',
        'itIsATruthUniversallyAcknowledged',
        'it_is_a_truth_universally_acknowledged',
      ],
      [
        'preserves operators in PostgreSQL json/jsonb clause (simple)',
        'privet->>dursleys',
        'privet->>dursleys',
      ],
      [
        'preserves operators in PostgreSQL json/jsonb clause (chained)',
        'ground->hole->>hobbit',
        'ground->hole->>hobbit',
      ],
      [
        'converts operands in PostgreSQL json/jsonb clause, preserving operators (simple)',
        'honeyTree->>honeyBee',
        'honey_tree->>honey_bee',
      ],
      [
        'converts operands in PostgreSQL json/jsonb clause, preserving operators (chained)',
        'itWas->TheBest->>OfTimes',
        'it_was->the_best->>of_times',
      ],
      ['otherwise behaves like Case.snake', 'Foo!! Bar$& bAZ$%', 'foo_bar_baz'],
    ];

    it.each(cases)('%s', (_, input, expected) => {
      const result = jsonOperatorAwareSnake(input);
      expect(result).toBe(expected);
    });
  });
});
