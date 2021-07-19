/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TransformParser } from '../parser';
import { functions } from '../../functions';
import { buildWhere } from './where';
import { buildPositioner } from './position'
import { Row } from '../../types';

type InsertParams = {
  insert: { [key: string]: string };
  where: (parser: TransformParser) => boolean;
  positioner: (index: number, insertCount: number) => number;
};

const insert = (rows: Row[], params: InsertParams): Row[] => {
  const returnArray = [...rows];
  const parser = new TransformParser(rows, functions);
  const rowsToInsert = returnArray.map(row => {
    const shouldInsertNewRow = params.where(parser);
    if (!shouldInsertNewRow) {
      parser.next();
      return undefined;
    }
    const newRow: Row = {};
    Object.entries(params.insert).forEach(([key, expression]) => {
      newRow[`${parser.evaluate(key)}`] = parser.evaluate(expression);
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
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { position, where, ...restOfParams } = params;

  if (
    Object.entries(restOfParams).some(
      ([field, value]) => typeof field !== 'string' || typeof value !== 'string',
    )
  ) {
    throw new Error(`All other keys and values in insert must be strings`);
  }

  return {
    insert: restOfParams as { [key: string]: string },
    where: buildWhere(params),
    positioner: buildPositioner(params),
  };
};

export const buildInsert = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => insert(rows, builtParams);
};
