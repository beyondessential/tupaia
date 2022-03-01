/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { yup, yupUtils } from '@tupaia/utils';

import { Row } from '../../types';
import { Context } from '../../context';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
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

const positionValidator = yup.string().oneOf(['before', 'after', 'start']).default('after');

export const paramsValidator = yup.object().shape({
  columns: mapStringToStringValidator,
  where: yup.string(),
  position: yupUtils.describableLazy(() => {
    return positionValidator;
  }, [positionValidator]),
});

const insertRows = (rows: Row[], params: InsertParams, context: Context): Row[] => {
  const returnArray = [...rows];
  const parser = new TransformParser(rows, context);
  const rowsToInsert = returnArray.map(() => {
    const shouldInsertNewRow = params.where(parser);
    if (!shouldInsertNewRow) {
      parser.next();
      return undefined;
    }
    const newRow: Row = {};
    Object.entries(params.columns).forEach(([key, expression]) => {
      newRow[parser.evaluate(key)] = parser.evaluate(expression);
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
  return (rows: Row[]) => insertRows(rows, builtParams, context);
};
