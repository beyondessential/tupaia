/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';
import { isDefined, yupTsUtils } from '@tupaia/tsutils';

import { Row } from '../../types';
import { Context } from '../../context';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { mapStringToStringValidator } from './transformValidators';
import { TransformTable } from '../table';

type InsertParams = {
  columns: { [key: string]: string };
  where: (parser: TransformParser) => boolean;
  positioner: (index: number, insertCount: number) => number;
};

const positioners = {
  before: (index: number, insertCount: number) => index + insertCount,
  after: (index: number, insertCount: number) => index + insertCount + 1,
  start: (index: number, insertCount: number) => insertCount,
};

const positionValidator = yup
  .mixed<'before' | 'after' | 'start'>()
  .oneOf(['before', 'after', 'start'])
  .default('after');

export const paramsValidator = yup.object().shape({
  columns: mapStringToStringValidator,
  where: yup.string(),
  position: yupTsUtils.describableLazy(() => {
    return positionValidator;
  }, [positionValidator]),
});

const insertRows = (table: TransformTable, params: InsertParams, context: Context) => {
  const parser = new TransformParser(table, context);
  let insertCount = 0;
  const rowInserts = table
    .getRows()
    .map((_, index) => {
      const shouldInsertNewRow = params.where(parser);
      if (!shouldInsertNewRow) {
        parser.next();
        return undefined;
      }
      const newRow: Row = {};
      Object.entries(params.columns).forEach(([key, expression]) => {
        const columnName = parser.evaluate(key);
        const value = parser.evaluate(expression);
        newRow[columnName] = value;
      });

      parser.next();
      return {
        row: newRow,
        index: params.positioner(index, insertCount++),
      };
    })
    .filter(isDefined);

  return table.insertRows(rowInserts);
};

const buildParams = (params: unknown): InsertParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { position, columns } = validatedParams;

  if (columns === undefined) {
    throw new Error('columns key must be defined for insertRows');
  }

  return {
    columns,
    where: buildWhere(params),
    positioner: positioners[position],
  };
};

export const buildInsertRows = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => insertRows(table, builtParams, context);
};
