/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { TransformParser } from '../parser';
import { Row } from '../../types';
import { functions } from '../../functions';

type SortParams = {
  by: string;
  descending?: boolean;
};

const getRowSortFunction = (params: SortParams, descending = false) => {
  const sortParser = new TransformParser([], functions);
  return (row1: Row, row2: Row) => {
    sortParser.set('$row', row1);
    const row1Value = sortParser.evaluate(params.by);
    sortParser.set('$row', row2);
    const row2Value = sortParser.evaluate(params.by);

    if (row1Value === undefined || row2Value === undefined) {
      throw new Error(`Unexpected undefined value when sorting rows: ${row1}, ${row2}`);
    }

    if (descending) {
      if (row1Value < row2Value) {
        return 1;
      }

      if (row1Value === row2Value) {
        return 0;
      }
      return -1;
    }

    if (row1Value > row2Value) {
      return 1;
    }

    if (row1Value === row2Value) {
      return 0;
    }
    return -1;
  };
};

const sort = (rows: Row[], params: SortParams): Row[] => {
  const { descending } = params;
  return rows.sort(getRowSortFunction(params, descending));
};

const buildParams = (params: unknown): SortParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { descending, by } = params;
  if (descending !== undefined && typeof descending !== 'boolean') {
    throw new Error(`Expected boolean for 'descending' parameter but got ${descending}`);
  }

  if (typeof by !== 'string') {
    throw new Error(`Expected string for 'by' parameter but got ${by}`);
  }

  return {
    by,
    descending,
  };
};

export const buildSort = (params: unknown) => {
  const builtSortParams = buildParams(params);
  return (rows: Row[]) => sort(rows, builtSortParams);
};
