import { removeArrayValue } from '../../utilities';

export const testRemoveArrayValues = () => {
  const dbStub = {
    runSql: (query, replacementParams) => ({ query, replacementParams }),
  };

  describe('missing input parameter', () => {
    const testData = [
      [
        'should require a db parameter',
        [undefined, undefined, undefined, undefined],
        'db is a required parameter',
      ],
      [
        'should require a table parameter',
        ['db', undefined, undefined, undefined],
        'table is a required parameter',
      ],
      [
        'should require a column parameter',
        ['db', 'table', undefined, undefined],
        'column is a required parameter',
      ],
      [
        'should require a value parameter',
        ['db', 'table', 'column', undefined],
        'value is a required parameter',
      ],
      [
        'should require a condition parameter',
        ['db', 'table', 'column', 'value'],
        'condition is a required parameter',
      ],
    ];
    it.each(testData)('%s', async (_, [db, table, column, value], expectedError) =>
      expect(removeArrayValue(db, table, column, value)).toBeRejectedWith(expectedError),
    );
  });

  describe('check input defender', () => {
    const object = {
      a: 1,
      b: true,
      c: 'string',
      d: {
        key: 'value',
      },
    };
    const testData = [
      [
        'should use replacement values to construct the query',
        0,
        ['query', 'UPDATE "table" SET "column" = array_remove("column", ?) WHERE condition'],
      ],
      ['should remove a number value', 0, ['replacementParams', [0]]],
      ['should remove a string value', 'string', ['replacementParams', ['string']]],
      ['should remove a boolean value', false, ['replacementParams', [false]]],
      ['should remove a object value', object, ['replacementParams', [object]]],
    ];
    it.each(testData)('%s', async (_, columnValue, [keyPath, expectedValue]) =>
      expect(
        removeArrayValue(dbStub, 'table', 'column', columnValue, 'condition'),
      ).resolves.toHaveProperty(keyPath, expectedValue),
    );
  });
};
