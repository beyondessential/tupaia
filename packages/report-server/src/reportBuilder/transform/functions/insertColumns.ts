/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { TransformParser } from '../parser';
import { functions } from '../../functions';
import { buildWhere } from './where';
import { Row } from '../../types';
import { mapStringToStringValidator } from './transformValidators';
import { getParsedColumnKeyAndValue } from './helpers';

type InsertColumnsParams = {
  columns: { [key: string]: string };
  where: (parser: TransformParser) => boolean;
};

const paramsValidator = yup.object().shape({
  columns: mapStringToStringValidator,
  where: yup.string(),
});

const insertColumns = (rows: Row[], params: InsertColumnsParams): Row[] => {
  const parser = new TransformParser(rows, functions);
  return rows.map(row => {
    const returnNewRow = params.where(parser);
    if (!returnNewRow) {
      parser.next();
      return row;
    }
    const newRow: Row = { ...row };
    Object.entries(params.columns).forEach(([key, expression]) => {
      const [newRowKey, newRowValue] = getParsedColumnKeyAndValue(key, expression, parser);
      newRow[newRowKey] = newRowValue;
    });

    parser.next();
    return newRow;
  });
};

const buildParams = (params: unknown): InsertColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { columns } = validatedParams;

  return {
    columns,
    where: buildWhere(params),
  };
};

export const buildInsertColumns = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => insertColumns(rows, builtParams);
};
