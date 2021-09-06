/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { yup } from '@tupaia/utils';

import { TransformParser } from '../parser';
import { functions } from '../../functions';
import { buildWhere } from './where';
import { Row } from '../../types';
import { starSingleOrMultipleColumnsValidator } from './transformValidators';
import { getColumnMatcher } from './helpers';

type UpdateColumnsParams = {
  insert: { [key: string]: string };
  shouldIncludeColumn: (field: string) => boolean;
  where: (parser: TransformParser) => boolean;
};

const paramsValidator = yup.object().shape({
  insert: yup.lazy((value: unknown) => {
    if (typeof value === 'object' && value !== null) {
      const insertMapValidator = Object.fromEntries(
        Object.entries(value).map(([columnName]) => [columnName, yup.string().required()]),
      );
      return yup.object().shape(insertMapValidator);
    }

    throw new yup.ValidationError('insert must be a mapping between columns and values');
  }),
  include: starSingleOrMultipleColumnsValidator,
  exclude: starSingleOrMultipleColumnsValidator,
  where: yup.string(),
});

const updateColumns = (rows: Row[], params: UpdateColumnsParams): Row[] => {
  const parser = new TransformParser(rows, functions);
  return rows.map(row => {
    const returnNewRow = params.where(parser);
    if (!returnNewRow) {
      parser.next();
      return row;
    }
    const newRow: Row = {};
    Object.entries(params.insert).forEach(([key, expression]) => {
      const newRowKey = key.startsWith('=') ? `${parser.evaluate(key.substring(1))}` : key;
      newRow[newRowKey] = parser.evaluate(expression);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { where, insert, include, exclude } = validatedParams;

  const inclusionPolicy = exclude ? 'exclude' : 'include';
  const policyColumns = exclude || include || '*';

  const columnMatcher = getColumnMatcher(policyColumns);
  const shouldIncludeColumn =
    inclusionPolicy === 'include'
      ? (column: string) => columnMatcher(column)
      : (column: string) => !columnMatcher(column);

  return {
    insert,
    shouldIncludeColumn,
    where: buildWhere(params),
  };
};

export const buildUpdateColumns = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => updateColumns(rows, builtParams);
};
