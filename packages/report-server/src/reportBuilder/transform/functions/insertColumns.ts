/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Context } from '../../context';
import { FieldValue } from '../../types';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { mapStringToStringValidator } from './transformValidators';
import { TransformTable } from '../table';

type InsertColumnsParams = {
  columns: { [key: string]: string };
  where: (parser: TransformParser) => boolean;
};

export const paramsValidator = yup.object().shape({
  columns: mapStringToStringValidator,
  where: yup.string(),
});

const insertColumns = (table: TransformTable, params: InsertColumnsParams, context: Context) => {
  const parser = new TransformParser(table, context);
  const newColumns: Record<string, FieldValue[]> = {};
  table.getRows().forEach((_, rowIndex) => {
    const shouldEditThisRow = params.where(parser);
    if (!shouldEditThisRow) {
      parser.next();
      return;
    }

    Object.entries(params.columns).forEach(([key, expression]) => {
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

  const columnUpserts = Object.entries(newColumns).map(([columnName, values]) => ({
    columnName,
    values,
  }));

  return table.upsertColumns(columnUpserts);
};

const buildParams = (params: unknown): InsertColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { columns } = validatedParams;

  if (columns === undefined) {
    throw new Error('columns key must be defined for insertColumns');
  }

  return {
    columns,
    where: buildWhere(params),
  };
};

export const buildInsertColumns = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => insertColumns(table, builtParams, context);
};
