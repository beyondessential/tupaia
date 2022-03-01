/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Context } from '../../context';
import { Row } from '../../types';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import { mapStringToStringValidator } from './transformValidators';

type InsertColumnsParams = {
  columns: { [key: string]: string };
  where: (parser: TransformParser) => boolean;
};

export const paramsValidator = yup.object().shape({
  columns: mapStringToStringValidator,
  where: yup.string(),
});

const insertColumns = (rows: Row[], params: InsertColumnsParams, context: Context): Row[] => {
  const parser = new TransformParser(rows, context);
  return rows.map(row => {
    const returnNewRow = params.where(parser);
    if (!returnNewRow) {
      parser.next();
      return row;
    }
    const newRow: Row = { ...row };
    Object.entries(params.columns).forEach(([key, expression]) => {
      newRow[parser.evaluate(key)] = parser.evaluate(expression);
    });

    parser.next();
    return newRow;
  });
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
  return (rows: Row[]) => insertColumns(rows, builtParams, context);
};
