/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup, orderBy } from '@tupaia/utils';

import { TransformParser } from '../parser';
import { Row } from '../../types';
import { functions } from '../../functions';
import { starSingleOrMultipleColumnsValidator } from './transformValidators';

type SortParams = {
  by: string | string[];
  direction: 'asc' | 'desc' | ('asc' | 'desc')[];
};

const paramsValidator = yup.object().shape({
  by: starSingleOrMultipleColumnsValidator,
  direction: yup.lazy((value: unknown) => {
    const ascOrDescValidator = yup.mixed<'asc' | 'desc'>().oneOf(['asc', 'desc']);
    if (typeof value === 'string' || value === undefined) {
      return ascOrDescValidator;
    }

    if (Array.isArray(value)) {
      return yup.array().of(ascOrDescValidator.required());
    }

    throw new yup.ValidationError(
      'Input must be either be asc, desc, or an array of [asc or desc]',
    );
  }),
});

const getCustomRowSortFunction = (expression: string, direction: 'asc' | 'desc') => {
  const sortParser = new TransformParser([], functions);
  return (row1: Row, row2: Row) => {
    sortParser.set('$row', row1);
    const row1Value = sortParser.evaluate(expression);
    sortParser.set('$row', row2);
    const row2Value = sortParser.evaluate(expression);

    if (row1Value === undefined || row2Value === undefined) {
      throw new Error(`Unexpected undefined value when sorting rows: ${row1}, ${row2}`);
    }

    if (direction === 'desc') {
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

const sortRows = (rows: Row[], params: SortParams): Row[] => {
  const { by, direction } = params;
  if (typeof by === 'string' && by.startsWith('=')) {
    const firstDirection = Array.isArray(direction) ? direction[0] : direction;
    return rows.sort(getCustomRowSortFunction(by.substring(1), firstDirection));
  }

  const arrayBy = typeof by === 'string' ? [by] : by;
  const arrayDirection = typeof direction === 'string' ? [direction] : direction;
  return orderBy(rows, arrayBy, arrayDirection);
};

const buildParams = (params: unknown): SortParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { by, direction = 'asc' } = validatedParams;

  if (!by) {
    throw new Error('by is required in sortRows');
  }

  return {
    by,
    direction,
  };
};

export const buildSortRows = (params: unknown) => {
  const builtSortParams = buildParams(params);
  return (rows: Row[]) => sortRows(rows, builtSortParams);
};
