import { replaceArrayValue } from '../../utilities';

export const testReplaceArrayValue = () => {
  const dbStub = {
    runSql: (query, replacementParams) => ({ query, replacementParams }),
  };

  describe('missing input parameter', () => {
    const testData = [
      [
        'should require a db parameter',
        [undefined, undefined, undefined, undefined, undefined],
        'db is a required parameter',
      ],
      [
        'should require a table parameter',
        ['db', undefined, undefined, undefined, undefined],
        'table is a required parameter',
      ],
      [
        'should require a column parameter',
        ['db', 'table', undefined, undefined, undefined],
        'column is a required parameter',
      ],
      [
        'should require a oldValue parameter',
        ['db', 'table', 'column', undefined, undefined],
        'oldValue is a required parameter',
      ],
      [
        'should require a newValueInput parameter',
        ['db', 'table', 'column', 'oldValue', undefined],
        'newValueInput is a required parameter',
      ],
      [
        'should require a condition parameter',
        ['db', 'table', 'column', 'oldValue', 'newValueInput'],
        'condition is a required parameter',
      ],
    ];

    it.each(testData)('%s', (_, [db, table, column, oldValue], expectedError) =>
      expect(replaceArrayValue(db, table, column, oldValue)).toBeRejectedWith(expectedError),
    );
  });

  describe('check input defender', () => {
    const oldObject = {
      a: 1,
      b: true,
      c: 'string',
      d: {
        key: 'value',
      },
    };

    const newObject = {
      a: 2,
    };

    const testData = [
      [
        'should allow a single value to be provided as newValueInput',
        [0, 1],
        ['replacementParams', [0, 1]],
      ],
      [
        'should allow a multiple value to be provided as newValueInput',
        [0, [1, 2]],
        ['replacementParams', [0, 1, 2]],
      ],
      [
        'should use replacement values to construct the query for one new value',
        [0, 1],
        [
          'query',
          `UPDATE "table" SET "column" = array_remove("column", ?) || ARRAY[?] WHERE condition`,
        ],
      ],
      [
        'should use replacement values to construct the query for multiple new values',
        [0, [1, 1]],
        [
          'query',
          `UPDATE "table" SET "column" = array_remove("column", ?) || ARRAY[?,?] WHERE condition`,
        ],
      ],
      ['should replace a number value', [0, 1], ['replacementParams', [0, 1]]],
      [
        'should replace a string value',
        ['oldString', 'newString'],
        ['replacementParams', ['oldString', 'newString']],
      ],
      ['should replace a boolean value', [false, true], ['replacementParams', [false, true]]],
      [
        'should replace a boolean value',
        [oldObject, newObject],
        ['replacementParams', [oldObject, newObject]],
      ],
    ];

    it.each(testData)('%s', (_, [oldValue, newValue], [keyPath, ExpectedValue]) =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', oldValue, newValue, 'condition'),
      ).resolves.toHaveProperty(keyPath, ExpectedValue),
    );
  });
};
