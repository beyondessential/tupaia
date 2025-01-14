import { FieldValue, Row } from '../../../types';
import { TransformParser } from '../../parser';
import { TransformTable } from '../../table';
import { buildRowKey } from '../utils';
import { ExpectedRows } from './ExpectedRows';

export const generateRowInserts = (
  table: TransformTable,
  parser: TransformParser,
  requiredColumnValues: {
    column: string;
    values: FieldValue[];
  }[],
  missingRowValues: Row,
) => {
  const columnsToCheck = requiredColumnValues.map(({ column }) => column);
  const expectedRows = new ExpectedRows(requiredColumnValues);
  const existingColumnValueIndexes = Object.fromEntries(
    table.getRows().map((row, index) => [buildRowKey(row, columnsToCheck), index]),
  );

  const rowInserts: { row: Row; index: number }[] = [];
  let offset = 0;
  let inserts = 0;
  while (expectedRows.hasNext()) {
    const row = expectedRows.next();
    const rowKey = buildRowKey(row, columnsToCheck);
    if (existingColumnValueIndexes[rowKey] !== undefined) {
      // row already in table, update offset to start inserting from that row
      const newOffset = existingColumnValueIndexes[rowKey] + 1;
      if (newOffset < offset) {
        throw new Error(
          'Column order in table does not match expected order for filling rows. Please ensure the columns are sorted correctly.',
        );
      }

      offset = newOffset;
      parser.skipTo(offset);
    } else {
      // Inserting row
      const newRow = { ...row };
      Object.entries(missingRowValues).forEach(([key, expression]) => {
        const columnName = parser.evaluate(key);
        const value = parser.evaluate(expression);
        newRow[columnName] = value;
      });

      rowInserts.push({ index: offset + inserts, row: newRow });
      inserts += 1;
    }
  }

  return rowInserts;
};
