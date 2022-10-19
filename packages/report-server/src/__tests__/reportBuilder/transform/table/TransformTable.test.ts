/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TransformTable } from '../../../../reportBuilder/transform';

const TEST_TABLE = new TransformTable(
  ['animal', 'name', 'age'],
  [
    { animal: 'cat', name: 'Mr. Meow', age: 7 },
    { animal: 'dog', name: 'Wooferton Barkly', age: 5 },
    { animal: 'fish', name: 'Bubbles', age: 50000 },
  ],
);

describe('TransformTable', () => {
  describe('insertRows', () => {
    it('throws an error if index is out of bounds', () => {
      const row = { animal: 'wolf', name: 'Howl', age: 9 };
      const insertRowOutOfRange = () =>
        TEST_TABLE.insertRows([
          {
            row,
            index: TEST_TABLE.length() + 1,
          },
        ]);

      const insertRowAtNegativeIndex = () => TEST_TABLE.insertRows([{ row, index: -1 }]);

      expect(insertRowOutOfRange).toThrow(`Error inserting row`);
      expect(insertRowAtNegativeIndex).toThrow('Error inserting row');
    });

    it('returns a table with the new row inserted', () => {
      const row = { animal: 'wolf', name: 'Howl', age: 9 };
      const index = 0;
      const newTable = TEST_TABLE.insertRows([{ row, index }]);

      expect(newTable).toEqual(
        new TransformTable(TEST_TABLE.getColumns(), [row, ...TEST_TABLE.getRows()]),
      );
    });

    it('inserts at the end of the table by default', () => {
      const row = { animal: 'wolf', name: 'Howl', age: 9 };
      const newTable = TEST_TABLE.insertRows([{ row }]);

      expect(newTable).toEqual(
        new TransformTable(TEST_TABLE.getColumns(), [...TEST_TABLE.getRows(), row]),
      );
    });

    it('can insert at any index in the table', () => {
      const columnNames = TEST_TABLE.getColumns();
      const row = { animal: 'wolf', name: 'Howl', age: 9 };
      const indexToInsertAt = 2;
      const newTable = TEST_TABLE.insertRows([{ row, index: indexToInsertAt }]);

      expect(newTable).toEqual(
        new TransformTable(columnNames, [
          ...TEST_TABLE.getRows().filter((_, index) => index < indexToInsertAt),
          row,
          ...TEST_TABLE.getRows().filter((_, index) => index >= indexToInsertAt),
        ]),
      );
    });

    it('can insert with a different column order, and preserve the original column order', () => {
      const columnNames = TEST_TABLE.getColumns();
      const row = { age: 9, name: 'Howl', animal: 'wolf' };
      const newTable = TEST_TABLE.insertRows([
        {
          row,
        },
      ]);

      expect(newTable).toEqual(
        new TransformTable(columnNames, [
          ...TEST_TABLE.getRows(),
          {
            animal: row.animal,
            name: row.name,
            age: row.age,
          },
        ]),
      );
    });

    it('can insert a row with only partial columns', () => {
      const columnNames = TEST_TABLE.getColumns();
      const row = { animal: 'wolf', age: 9 };
      const newTable = TEST_TABLE.insertRows([
        {
          row,
        },
      ]);

      expect(newTable).toEqual(
        new TransformTable(columnNames, [
          ...TEST_TABLE.getRows(),
          { animal: row.animal, name: undefined, age: row.age },
        ]),
      );
    });

    it('can insert a row with new columns in it, and those columns will be added to the table', () => {
      const row = { animal: 'wolf', favourite_food: 'banana', favourite_place: 'cave' };
      const newTable = TEST_TABLE.insertRows([{ row }]);

      expect(newTable).toEqual(
        new TransformTable(
          [...TEST_TABLE.getColumns(), 'favourite_food', 'favourite_place'],
          [...TEST_TABLE.getRows(), row],
        ),
      );
    });
  });

  describe('upsertColumn', () => {
    it('throws an error if incorrect column length is given', () => {
      const upsertColumnTooShort = () =>
        TEST_TABLE.upsertColumns([
          { columnName: 'too_short', values: new Array(TEST_TABLE.length() - 1).fill(undefined) },
        ]);

      const upsertColumnTooLong = () =>
        TEST_TABLE.upsertColumns([
          { columnName: 'too_long', values: new Array(TEST_TABLE.length() + 1).fill(undefined) },
        ]);

      expect(upsertColumnTooShort).toThrow(`Error upserting column`);
      expect(upsertColumnTooLong).toThrow('Error upserting column');
    });

    it('can insert a new column', () => {
      const columnName = 'favourite_food';
      const values = ['butter', 'bones', 'bitcoin'];
      const newTable = TEST_TABLE.upsertColumns([{ columnName, values }]);

      expect(newTable).toEqual(
        new TransformTable(
          [...TEST_TABLE.getColumns(), columnName],
          TEST_TABLE.getRows().map((row, index) => ({ ...row, favourite_food: values[index] })),
        ),
      );
    });

    it('can overwrite an existing column', () => {
      const columnName = 'age';
      const values = ['butter', 'bones', 'bitcoin'];
      const newTable = TEST_TABLE.upsertColumns([
        {
          columnName,
          values,
        },
      ]);

      expect(newTable).toEqual(
        new TransformTable(
          TEST_TABLE.getColumns(),
          TEST_TABLE.getRows().map((row, index) => ({ ...row, [columnName]: values[index] })),
        ),
      );
    });
  });

  describe('dropRows', () => {
    it('can drop multiple rows', () => {
      const rowsToDrop = [1, 3];
      const newTable = TEST_TABLE.dropRows(rowsToDrop);

      expect(newTable).toEqual(
        new TransformTable(
          TEST_TABLE.getColumns(),
          TEST_TABLE.getRows().filter((_, index) => !rowsToDrop.includes(index)),
        ),
      );
    });

    it('can handle index out of range gracefully', () => {
      const rowsToDrop = [-1, 1, 5];
      const newTable = TEST_TABLE.dropRows(rowsToDrop);

      expect(newTable).toEqual(
        new TransformTable(
          TEST_TABLE.getColumns(),
          TEST_TABLE.getRows().filter((_, index) => !rowsToDrop.includes(index)),
        ),
      );
    });

    it('can drop in any order', () => {
      const rowsToDrop = [2, 1];
      const newTable = TEST_TABLE.dropRows(rowsToDrop);

      expect(newTable).toEqual(
        new TransformTable(
          TEST_TABLE.getColumns(),
          TEST_TABLE.getRows().filter((_, index) => !rowsToDrop.includes(index)),
        ),
      );
    });
  });

  describe('dropColumns', () => {
    it('can drop columns', () => {
      const columnsToDrop = ['name', 'age'];
      const newTable = TEST_TABLE.dropColumns(columnsToDrop);

      expect(newTable).toEqual(
        new TransformTable(
          TEST_TABLE.getColumns().filter(columnName => !columnsToDrop.includes(columnName)),
          TEST_TABLE.getRows().map(row =>
            Object.fromEntries(
              Object.entries(row).filter(([columnName]) => !columnsToDrop.includes(columnName)),
            ),
          ),
        ),
      );
    });

    it('can handle unknown columns gracefully', () => {
      const newTable = TEST_TABLE.dropColumns(['not a real column']);

      expect(newTable).toEqual(TEST_TABLE);
    });
  });
});
