/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';
import { MatrixBuilder } from './matrixBuilder';
import { Matrix, MatrixColumnParams, MatrixParams } from './types';

const matrix = (rows: Row[], params: MatrixParams): Matrix => {
  const matrixBuilder = new MatrixBuilder(rows, params);
  matrixBuilder.buildBaseColumns().buildBaseRows();
  return matrixBuilder.getMatrixData();
};

const buildParams = (params: unknown): MatrixParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const getPrefixColumns = (columns: unknown): MatrixColumnParams => {
    if (columns === '*' || columns === undefined) {
      return '*';
    }
    if (!Array.isArray(columns)) {
      throw new Error(`Expected columns as string array or '*' but got ${columns}`);
    }
    if (columns.length === 0) {
      return '*';
    }
    columns.forEach(column => {
      if (typeof column !== 'string') {
        throw new Error(`Expected columns as string array or '*' but got ${columns}`);
      }
    });
    return columns;
  };
  const { columns, categoryField, rowField } = params;

  const prefixColumns = getPrefixColumns(columns);

  if (typeof rowField !== 'string') {
    throw new Error(`Expected rowField as string but got ${rowField}`);
  }

  if (typeof categoryField !== 'string') {
    throw new Error(`Expected categoryField as string but got ${categoryField}`);
  }
  return {
    columns: { prefixColumns, nonColumnKeys: [categoryField, rowField] },
    rows: { categoryField, rowField },
  };
};

export const buildMatrix = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => matrix(rows, builtParams);
};
