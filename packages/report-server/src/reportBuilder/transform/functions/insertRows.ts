/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { TransformParser } from '../parser';
import { functions } from '../../functions';
import { buildWhere } from './where';
import { Row } from '../../types';
import { getParsedColumnKeyAndValue } from './helpers';
import { mapStringToStringValidator } from './transformValidators';

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

const paramsValidator = yup.object().shape({
  columns: mapStringToStringValidator,
  where: yup.string(),
  position: yup
    .mixed<'before' | 'after' | 'start'>()
    .oneOf(['before', 'after', 'start'])
    .default('after'),
});

const insertRows = (rows: Row[], params: InsertParams): Row[] => {
  const returnArray = [...rows];
  const parser = new TransformParser(rows, functions);
  const rowsToInsert = returnArray.map(() => {
    const shouldInsertNewRow = params.where(parser);
    if (!shouldInsertNewRow) {
      parser.next();
      return undefined;
    }
    const newRow: Row = {};
    Object.entries(params.columns).forEach(([key, expression]) => {
      const [newRowKey, newRowValue] = getParsedColumnKeyAndValue(key, expression, parser);
      newRow[newRowKey] = newRowValue;
    });

    parser.next();
    return newRow;
  });
  let insertCount = 0;
  rowsToInsert.forEach((newRow, index) => {
    if (newRow !== undefined) {
      returnArray.splice(params.positioner(index, insertCount), 0, newRow);
      insertCount++;
    }
  });
  return returnArray;
};

const buildParams = (params: unknown): InsertParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { position, columns } = validatedParams;

  return {
    columns,
    where: buildWhere(params),
    positioner: positioners[position],
  };
};

export const buildInsertRows = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => insertRows(rows, builtParams);
};
