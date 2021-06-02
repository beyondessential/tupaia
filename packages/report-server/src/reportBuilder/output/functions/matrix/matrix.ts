/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Row } from '../../../types';
import { MatrixBuilder } from './matrixBuilder';
import { Matrix, MatrixParams } from './types';

const matrix = (rows: Row[], params: MatrixParams): Matrix => {
  const matrixBuilder = new MatrixBuilder(rows, params);
  matrixBuilder.buildBaseColumns().buildBaseRows();
  return matrixBuilder.getMatrixData();
};

const buildParams = (params: unknown): MatrixParams => {
  if (typeof params !== 'object' || params === null) {
    throw new Error(`Expected params object but got ${params}`);
  }

  const { columns, categories, rowTitle } = params;

  if (!Array.isArray(columns)) {
    throw new Error(`Expected columns array but got ${columns}`);
  } else {
    columns.forEach((column: unknown) => {
      if (typeof column !== 'string') {
        throw new Error(`Expected columns as array of strings but got ${columns}`);
      }
    });
  }
  if (!Array.isArray(categories)) {
    throw new Error(`Expected categories array but got ${categories}`);
  } else {
    categories.forEach((category: unknown) => {
      if (typeof category !== 'string') {
        throw new Error(`Expected categories as array of strings but got ${categories}`);
      }
    });
  }
  if (typeof rowTitle !== 'string') {
    throw new Error(`Expected rowTitle string but got ${rowTitle}`);
  }

  return {
    columns: { prefixColumns: columns, nonColumnKeys: [...categories, rowTitle] },
    rows: { category: categories[0], rowTitle },
  };
};

export const buildMatrix = (params: unknown) => {
  const builtParams = buildParams(params);
  return (rows: Row[]) => matrix(rows, builtParams);
};
