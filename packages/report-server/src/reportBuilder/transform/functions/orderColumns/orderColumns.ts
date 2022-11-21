/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { isDefined } from '@tupaia/tsutils';
import { yup } from '@tupaia/utils';
import { TransformTable } from '../../table';
import { sortByFunctions } from './sortByFunctions';

type OrderColumnsParams = {
  columnOrder?: string[];
  sorter?: (column1: string, column2: string) => number;
};

export const paramsValidator = yup.object().shape({
  order: yup.array().of(yup.string().required()),
  sortBy: yup
    .mixed<keyof typeof sortByFunctions>()
    .oneOf(Object.keys(sortByFunctions) as (keyof typeof sortByFunctions)[]),
});

const orderColumns = (table: TransformTable, params: OrderColumnsParams) => {
  const { columnOrder = ['*'], sorter } = params;

  if (sorter) {
    return new TransformTable(table.getColumns().sort(sorter), table.getRows());
  }

  if (!columnOrder.includes('*')) {
    columnOrder.push('*'); // Add wildcard to the end if it's not specified
  }

  const existingColumns = table.getColumns();
  const newColumns = new Array<string | undefined>(existingColumns.length).fill(undefined);
  const orderedColumns = existingColumns.filter(column => columnOrder.includes(column));
  const wildcardColumns = existingColumns.filter(column => !columnOrder.includes(column));

  // Filter out columns that are not in the table
  const order = columnOrder.filter(column => existingColumns.includes(column) || column === '*');
  const indexOfWildcard = order.indexOf('*');

  wildcardColumns.forEach((column, index) => {
    newColumns[indexOfWildcard + index] = column;
  });

  orderedColumns.forEach(column => {
    const indexInOrder = order.indexOf(column);
    const indexInNewColumns =
      indexInOrder < indexOfWildcard
        ? indexInOrder // It's before the wildcard, just use the index
        : indexInOrder + orderedColumns.length - 1; // It's after the wildcard, so account for all wildcard columns (minus wildcard itself)
    newColumns[indexInNewColumns] = column;
  });

  const validatedColumns = newColumns.map(column => {
    if (!isDefined(column)) {
      throw new Error('Missing columns when determining new column order');
    }

    return column;
  });

  return new TransformTable(validatedColumns, table.getRows());
};

const buildParams = (params: unknown): OrderColumnsParams => {
  const validatedParams = paramsValidator.validateSync(params);

  const { order, sortBy } = validatedParams;

  if (order && sortBy) {
    throw new Error('Cannot provide explicit column order and a sort by function');
  }

  if (order) {
    return {
      columnOrder: Array.from(new Set(order)),
    };
  }

  if (sortBy) {
    return {
      sorter: sortByFunctions[sortBy],
    };
  }

  throw new Error('Must provide either explicit column order or a sort by function');
};

export const buildOrderColumns = (params: unknown) => {
  const builtParams = buildParams(params);
  return (table: TransformTable) => orderColumns(table, builtParams);
};

export const orderColumnsSchema = {
  ...paramsValidator.describe(),
  fields: {
    ...paramsValidator.describe().fields,
    // Override sortBy describe, as viz-builder doesn't support mixed schemas
    sortBy: {
      enum: Object.keys(sortByFunctions),
    },
  },
};
