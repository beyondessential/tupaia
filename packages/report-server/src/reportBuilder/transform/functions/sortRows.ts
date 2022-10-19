/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup, orderBy } from '@tupaia/utils';
import { yupTsUtils } from '@tupaia/tsutils';

import { Row } from '../../types';
import { starSingleOrMultipleColumnsValidator } from './transformValidators';
import { TransformTable } from '../table';
import { TransformParser } from '../parser';

type SortParams = {
  by: string | string[];
  direction: 'asc' | 'desc' | ('asc' | 'desc')[];
};

const ascOrDescValidator = yup.mixed<'asc' | 'desc'>().oneOf(['asc', 'desc']);

export const paramsValidator = yup.object().shape({
  by: starSingleOrMultipleColumnsValidator,
  direction: yupTsUtils.describableLazy(
    (value: unknown) => {
      if (typeof value === 'string' || value === undefined) {
        return ascOrDescValidator;
      }

      if (Array.isArray(value)) {
        return yup.array().of(ascOrDescValidator.required());
      }

      throw new yup.ValidationError(
        'Input must be either be asc, desc, or an array of [asc or desc]',
      );
    },
    [ascOrDescValidator, yup.array().of(ascOrDescValidator.required())],
  ),
});

const getCustomRowSortFunction = (expression: string, direction: 'asc' | 'desc') => {
  const sortParser = new TransformParser();
  return (row1: Row, row2: Row) => {
    sortParser.set('@current', row1);
    sortParser.addRowToScope(row1);
    const row1Value = sortParser.evaluate(expression);
    sortParser.removeRowFromScope(row1);

    sortParser.set('@current', row2);
    sortParser.addRowToScope(row2);
    const row2Value = sortParser.evaluate(expression);
    sortParser.removeRowFromScope(row1);

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

const sortRows = (table: TransformTable, params: SortParams) => {
  const { by, direction } = params;

  if (typeof by === 'string' && TransformParser.isExpression(by)) {
    const firstDirection = Array.isArray(direction) ? direction[0] : direction;
    const sortedRows = table.getRows().sort(getCustomRowSortFunction(by, firstDirection));
    return new TransformTable(table.getColumns(), sortedRows);
  }

  const arrayBy = typeof by === 'string' ? [by] : by;
  const arrayDirection = typeof direction === 'string' ? [direction] : direction;
  const sortedRows = orderBy(table.getRows(), arrayBy, arrayDirection);

  return new TransformTable(table.getColumns(), sortedRows);
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
  return (table: TransformTable) => sortRows(table, builtSortParams);
};
