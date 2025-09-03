import { yup } from '@tupaia/utils';

import { Context } from '../../context';
import { FieldValue, Row } from '../../types';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { mapStringToStringValidator } from './utils';
import { TransformTable } from '../table';
import { TransformBuilder } from '.';

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
  const skippedRows: Record<number, Row> = {};
  table.getRows().forEach((row, rowIndex) => {
    const shouldEditThisRow = params.where(parser);
    if (!shouldEditThisRow) {
      skippedRows[rowIndex] = row;
      parser.next();
      return;
    }

    Object.entries(params.columns).forEach(([key, expression]) => {
      const columnName = parser.evaluate(key);
      const columnValue = parser.evaluate(expression);
      if (!newColumns[columnName]) {
        newColumns[columnName] = new Array(table.length()).fill(undefined);
      }
      newColumns[columnName].splice(rowIndex, 1, columnValue);
    });

    parser.next();
  });

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

  return table.upsertColumns(columnUpserts).dropRows(rowsToDrop).insertRows(rowReinserts);
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

export const buildInsertColumns: TransformBuilder = (params, context) => {
  const builtParams = buildParams(params);
  return table => insertColumns(table, builtParams, context);
};
