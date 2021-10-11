/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { Context } from '../../context';
import { Row } from '../../types';
import { TransformParser } from '../parser';
import { buildWhere } from './where';
import {
  mapStringToStringValidator,
  starSingleOrMultipleColumnsValidator,
} from './transformValidators';
import { getColumnMatcher } from './helpers';

type UpdateColumnsParams = {
  insert: { [key: string]: string };
  shouldIncludeColumn: (field: string) => boolean;
  where: (parser: TransformParser) => boolean;
};

const paramsValidator = yup.object().shape({
  insert: mapStringToStringValidator,
  include: starSingleOrMultipleColumnsValidator,
  exclude: starSingleOrMultipleColumnsValidator,
  where: yup.string(),
});

const updateColumns = (rows: Row[], params: UpdateColumnsParams, context: Context): Row[] => {
  const parser = new TransformParser(rows, context);
  return rows.map(row => {
    const returnNewRow = params.where(parser);
    if (!returnNewRow) {
      parser.next();
      return row;
    }
    const newRow: Row = {};
    Object.entries(params.insert).forEach(([key, expression]) => {
      newRow[parser.evaluate(key)] = parser.evaluate(expression);
    });

    Object.entries(row).forEach(([field, value]) => {
      if (field in newRow) {
        // Field already defined
        return;
      }

      if (params.shouldIncludeColumn(field)) {
        newRow[field] = value;
      }
    });

    parser.next();
    return newRow;
  });
};

const buildParams = (params: unknown): UpdateColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { insert, include, exclude } = validatedParams;

  const inclusionPolicy = exclude ? 'exclude' : 'include';
  const policyColumns = exclude || include || '*';

  const columnMatcher = getColumnMatcher(policyColumns);
  const shouldIncludeColumn =
    inclusionPolicy === 'include'
      ? (column: string) => columnMatcher(column)
      : (column: string) => !columnMatcher(column);

  return {
    insert: insert || {},
    shouldIncludeColumn,
    where: buildWhere(params),
  };
};

export const buildUpdateColumns = (params: unknown, context: Context) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => updateColumns(rows, builtParams, context);
};
