import { removeArrayValue, replaceArrayValue, updateValues } from '../../core/utilities/migration';

const dbStub = {
  runSql: (query, replacementParams) => ({ query, replacementParams }),
};

describe('migrationUtilities', () => {
  describe('updateValues', () => {
    it('required params', async () => {
      await expect(updateValues()).toBeRejectedWith(/db .* required/);
      await expect(updateValues('db')).toBeRejectedWith(/table .* required/);
      await expect(updateValues('db', 'table')).toBeRejectedWith(/newValues .* required/);
      await expect(updateValues('db', 'table', 'newValues')).toBeRejectedWith(
        /condition .* required/,
      );
    });

    it('uses replacement values to construct the query for one new value', async () =>
      expect(updateValues(dbStub, 'table', { column: 0 }, 'condition')).resolves.toHaveProperty(
        'query',
        'UPDATE "table" SET "column" = ? WHERE condition',
      ));

    it('uses replacement values to construct the query for multiple new values', async () =>
      expect(
        updateValues(dbStub, 'table', { column1: 0, column2: 1 }, 'condition'),
      ).resolves.toHaveProperty(
        'query',
        'UPDATE "table" SET "column1" = ?, "column2" = ? WHERE condition',
      ));

    it('accepts a string as the condition', async () =>
      expect(updateValues(dbStub, 'table', { column: 0 }, 'condition')).resolves.toHaveProperty(
        'query',
        'UPDATE "table" SET "column" = ? WHERE condition',
      ));

    it('accepts an object as the condition', async () =>
      expect(
        updateValues(dbStub, 'table', { column: 0 }, { conditionColumn: 1 }),
      ).resolves.toHaveProperty(
        'query',
        'UPDATE "table" SET "column" = ? WHERE "conditionColumn" = ?',
      ));

    it('updates multiple values', async () =>
      expect(
        updateValues(dbStub, 'table', { column1: 0, column2: 1 }, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [0, 1]));

    it('accepts multiple conditions', async () =>
      expect(
        updateValues(dbStub, 'table', { column: 0 }, { conditionColumn1: 1, conditionColumn2: 2 }),
      ).resolves.toHaveProperty('replacementParams', [0, 1, 2]));

    it('updates a column value to a number', async () =>
      expect(updateValues(dbStub, 'table', { column: 0 }, 'condition')).resolves.toHaveProperty(
        'replacementParams',
        [0],
      ));

    it('updates a column value to a string', async () =>
      expect(
        updateValues(dbStub, 'table', { column: 'string' }, 'condition'),
      ).resolves.toHaveProperty('replacementParams', ['string']));

    it('updates a column value to a boolean', async () =>
      expect(updateValues(dbStub, 'table', { column: false }, 'condition')).resolves.toHaveProperty(
        'replacementParams',
        [false],
      ));

    it('updates a column value to an object', async () => {
      const object = {
        a: 1,
        b: true,
        c: 'string',
        d: {
          key: 'value',
        },
      };

      await expect(
        updateValues(dbStub, 'table', { column: object }, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [object]);
    });
  });

  describe('removeArrayValue', () => {
    it('required params', async () => {
      await expect(removeArrayValue()).toBeRejectedWith(/db .* required/);
      await expect(removeArrayValue('db')).toBeRejectedWith(/table .* required/);
      await expect(removeArrayValue('db', 'table')).toBeRejectedWith(/column .* required/);
      await expect(removeArrayValue('db', 'table', 'column')).toBeRejectedWith(/value .* required/);
      await expect(removeArrayValue('db', 'table', 'column', 'value')).toBeRejectedWith(
        /condition .* required/,
      );
    });

    it('uses replacement values to construct the query', async () =>
      expect(removeArrayValue(dbStub, 'table', 'column', 0, 'condition')).resolves.toHaveProperty(
        'query',
        'UPDATE "table" SET "column" = array_remove("column", ?) WHERE condition',
      ));

    it('removes a number value', async () =>
      expect(removeArrayValue(dbStub, 'table', 'column', 0, 'condition')).resolves.toHaveProperty(
        'replacementParams',
        [0],
      ));

    it('removes a string value', async () =>
      expect(
        removeArrayValue(dbStub, 'table', 'column', 'string', 'condition'),
      ).resolves.toHaveProperty('replacementParams', ['string']));

    it('removes a boolean value', async () =>
      expect(
        removeArrayValue(dbStub, 'table', 'column', false, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [false]));

    it('removes an object value', async () => {
      const object = {
        a: 1,
        b: true,
        c: 'string',
        d: {
          key: 'value',
        },
      };

      await expect(
        removeArrayValue(dbStub, 'table', 'column', object, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [object]);
    });
  });

  describe('replaceArrayValue', () => {
    it('requires a db parameter', async () =>
      expect(replaceArrayValue()).toBeRejectedWith('db is a required parameter'));

    it('requires a table parameter', async () =>
      expect(replaceArrayValue('db')).toBeRejectedWith('table is a required parameter'));

    it('requires a column parameter', async () =>
      expect(replaceArrayValue('db', 'table')).toBeRejectedWith('column is a required parameter'));

    it('requires a oldValue parameter', async () =>
      expect(replaceArrayValue('db', 'table', 'column')).toBeRejectedWith(
        'oldValue is a required parameter',
      ));

    it('requires a newValueInput parameter', async () =>
      expect(replaceArrayValue('db', 'table', 'column', 'oldValue')).toBeRejectedWith(
        'newValueInput is a required parameter',
      ));

    it('requires a condition parameter', async () =>
      expect(
        replaceArrayValue('db', 'table', 'column', 'oldValue', 'newValueInput'),
      ).toBeRejectedWith('condition is a required parameter'));

    it('allows a single value to be provided as newValueInput', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, 1, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [0, 1]));

    it('allows multiple values to be provided as newValueInput', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, [1, 2], 'condition'),
      ).resolves.toHaveProperty('replacementParams', [0, 1, 2]));

    it('uses replacement values to construct the query for one new value', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, 1, 'condition'),
      ).resolves.toHaveProperty(
        'query',
        `UPDATE "table" SET "column" = array_remove("column", ?) || ARRAY[?] WHERE condition`,
      ));

    it('uses replacement values to construct the query for multiple new values', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, [1, 1], 'condition'),
      ).resolves.toHaveProperty(
        'query',
        `UPDATE "table" SET "column" = array_remove("column", ?) || ARRAY[?,?] WHERE condition`,
      ));

    it('replaces a number value', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 0, 1, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [0, 1]));

    it('replaces a string value', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', 'oldString', 'newString', 'condition'),
      ).resolves.toHaveProperty('replacementParams', ['oldString', 'newString']));

    it('replaces a boolean value', async () =>
      expect(
        replaceArrayValue(dbStub, 'table', 'column', false, true, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [false, true]));

    it('replaces an object value', async () => {
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

      await expect(
        replaceArrayValue(dbStub, 'table', 'column', oldObject, newObject, 'condition'),
      ).resolves.toHaveProperty('replacementParams', [oldObject, newObject]);
    });
  });
});
