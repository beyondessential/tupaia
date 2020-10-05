import { updateValues } from '../../utilities';

export const testUpdateValues = () => {
  const dbStub = {
    runSql: (query, replacementParams) => ({ query, replacementParams }),
  };

  describe('missing input parameter', () => {
    const testData = [
      [
        'should require a db parameter',
        [undefined, undefined, undefined],
        'db is a required parameter',
      ],
      [
        'should require a table parameter',
        ['db', undefined, undefined],
        'table is a required parameter',
      ],
      [
        'should require a newValues parameter',
        ['db', 'table', undefined],
        'newValues is a required parameter',
      ],
      [
        'should require a condition parameter',
        ['db', 'table', 'newValues'],
        'condition is a required parameter',
      ],
    ];
    it.each(testData)('%s', async (_, [db, table, newValues], expectedError) =>
      expect(updateValues(db, table, newValues)).toBeRejectedWith(expectedError),
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
        'should use replacement values to construct the query for one new value',
        [{ column: 0 }, 'condition'],
        ['query', 'UPDATE "table" SET "column" = ? WHERE condition'],
      ],
      [
        'should use replacement values to construct the query for multiple new values',
        [{ column1: 0, column2: 1 }, 'condition'],
        ['query', 'UPDATE "table" SET "column1" = ?, "column2" = ? WHERE condition'],
      ],
      [
        'should accept a string as the condition',
        [{ column: 0 }, 'condition'],
        ['query', 'UPDATE "table" SET "column" = ? WHERE condition'],
      ],
      [
        'should accept an object as the condition',
        [{ column: 0 }, { conditionColumn: 1 }],
        ['query', 'UPDATE "table" SET "column" = ? WHERE "conditionColumn" = ?'],
      ],
      [
        'should be able to update multiple values',
        [{ column1: 0, column2: 1 }, 'condition'],
        ['replacementParams', [0, 1]],
      ],
      [
        'should accept multiple conditions',
        [{ column: 0 }, { conditionColumn1: 1, conditionColumn2: 2 }],
        ['replacementParams', [0, 1, 2]],
      ],
      [
        'should update a column value to a number',
        [{ column: 0 }, 'condition'],
        ['replacementParams', [0]],
      ],
      [
        'should update a column value to a string',
        [{ column: 'string' }, 'condition'],
        ['replacementParams', ['string']],
      ],
      [
        'should update a column value to a boolean',
        [{ column: false }, 'condition'],
        ['replacementParams', [false]],
      ],
      [
        'should update a column value to an object',
        [{ column: object }, 'condition'],
        ['replacementParams', [object]],
      ],
    ];

    it.each(testData)('%s', async (_, [newValues, condition], [keyPath, value]) => {
      await expect(updateValues(dbStub, 'table', newValues, condition)).resolves.toHaveProperty(
        keyPath,
        value,
      );
    });
  });
};
