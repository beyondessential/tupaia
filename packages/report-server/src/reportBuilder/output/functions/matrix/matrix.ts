/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';
import { MatrixBuilder } from './matrixBuilder';
import { Matrix, MatrixColumnParams, MatrixParams } from './types';

const matrix = (rows: Row[], params: MatrixParams): Matrix => {
  return new MatrixBuilder(rows, params).build();
};

const buildParams = (params: unknown): MatrixParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const getPrefixColumns = (columns: unknown): MatrixColumnParams => {
    if (columns === '*' || columns === undefined) {
      return '*';
    }
    if (!Array.isArray(columns) || columns.length === 0) {
      throw new Error(`Expected columns as string array or '*' but got ${columns}`);
    }

    columns.forEach(column => {
      if (typeof column !== 'string') {
        throw new Error(`Expected each column to be a string but got ${columns}`);
      }
    });
    return columns;
  };
  const { columns, categoryField, rowField } = params;

  const prefixColumns = getPrefixColumns(columns);

  if (typeof rowField !== 'string') {
    throw new Error(`Expected rowField as string but got ${rowField}`);
  }
  if (categoryField !== undefined && typeof categoryField !== 'string') {
    throw new Error(`Expected categoryField as string but got ${categoryField}`);
  }
  const nonColumnKeys = categoryField ? [categoryField, rowField] : [rowField];
  if (Array.isArray(prefixColumns) && prefixColumns.includes(rowField)) {
    throw new Error(`rowField: ${rowField} is already defined as a column`);
  }
  return {
    columns: { prefixColumns, nonColumnKeys },
    rows: { categoryField, rowField },
  };
};

export const buildMatrix = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => matrix(rows, builtParams);
};
