/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Context } from '../../context';
import { FieldValue, Row } from '../../types';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import {
  mapStringToStringValidator,
  starSingleOrMultipleColumnsValidator,
} from './transformValidators';
import { getColumnMatcher } from './helpers';
import { TransformTable } from '../table';

type UpdateColumnsParams = {
  insert: { [key: string]: string };
  shouldIncludeColumn: (field: string) => boolean;
  where: (parser: TransformParser) => boolean;
};

export const paramsValidator = yup.object().shape({
  insert: mapStringToStringValidator,
  include: starSingleOrMultipleColumnsValidator,
  exclude: starSingleOrMultipleColumnsValidator,
  where: yup.string(),
});

const updateColumns = (table: TransformTable, params: UpdateColumnsParams, context: Context) => {
  const parser = new TransformParser(table, context);
  const newColumns: Record<string, FieldValue[]> = {};
  const skippedRows: Record<number, Row> = {};
  const columnNames = table.getColumns();
  table.getRows().forEach((row, rowIndex) => {
    const shouldEditThisRow = params.where(parser);
    if (!shouldEditThisRow) {
      skippedRows[rowIndex] = row;
      parser.next();
      return;
    }

    Object.entries(params.insert).forEach(([key, expression]) => {
      const columnName = parser.evaluate(key);
      const columnValue = parser.evaluate(expression);
      if (!newColumns[columnName]) {
        newColumns[columnName] = table.hasColumn(columnName)
          ? table.getColumnValues(columnName) // Upserting a column, so fill with current column values
          : new Array(table.length()).fill(undefined); // Creating a new column, so fill with undefined
      }
      newColumns[columnName].splice(rowIndex, 1, columnValue);
    });

    parser.next();
  });

  // Drop columns that should no longer be in the table
  const columnsToDelete = columnNames.filter(columnName => !params.shouldIncludeColumn(columnName));

  // Insert the new columns
  const columnUpserts = Object.entries(newColumns).map(([columnName, values]) => ({
    columnName,
    values,
  }));

  // Drop, then re-insert the original skipped rows
  const rowsToDrop = Object.keys(skippedRows).map(rowIndexString => parseInt(rowIndexString));
  const rowReinserts = Object.entries(skippedRows).map(([rowIndexString, row]) => ({
    row,
    index: parseInt(rowIndexString),
  }));

  return table
    .dropColumns(columnsToDelete)
    .upsertColumns(columnUpserts)
    .dropRows(rowsToDrop)
    .insertRows(rowReinserts);
};

const buildParams = (params: unknown): UpdateColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { insert, include, exclude } = validatedParams;

  const inclusionPolicy = exclude ? 'exclude' : 'include';
  const policyColumns = exclude || include || '*';

  const columnMatcher = getColumnMatcher(policyColumns);
  const shouldIncludeColumn =
    inclusionPolicy === 'include'
      ? (column: string) => columnMatcher(column)
      : (column: string) => !columnMatcher(column);

  return {
    insert: insert || {},
    shouldIncludeColumn,
    where: buildWhere(params),
  };
};

export const buildUpdateColumns = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => updateColumns(table, builtParams, context);
};
