/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import {
  MatrixColumnType,
  MatrixRowType,
  getIsUsingDots,
  Matrix as MatrixComponent,
} from '@tupaia/ui-components';
import {
  DashboardItemDisplayProps,
  MatrixDataColumn,
  MatrixDataRow,
  MatrixViewContent,
} from '../types';
import { ConditionalPresentationOptions } from '@tupaia/types';

const parseRows = (
  rows: MatrixDataRow[],
  categoryId?: MatrixDataRow['categoryId'],
): MatrixRowType[] => {
  const topLevelRows = categoryId ? rows.filter(row => row.categoryId === categoryId) : rows;

  return topLevelRows.map(row => {
    const { dataElement = '', category, ...rest } = row;
    if (category) {
      return {
        title: category,
        ...rest,
        children: parseRows(rows, category),
      };
    }
    return {
      title: dataElement,
      ...rest,
    };
  });
};

const parseColumns = (columns: MatrixDataColumn[]): MatrixColumnType[] => {
  return columns.map(column => {
    const { category, key, title, columns: children } = column;
    if (category)
      return {
        title: category,
        key: category,
        children: parseColumns(children!),
      };
    return {
      title,
      key,
    };
  });
};

export const Matrix = ({
  viewContent,
  isEnlarged = false,
}: Pick<DashboardItemDisplayProps, 'isEnlarged'> & {
  viewContent: MatrixViewContent;
}) => {
  const { columns, rows, ...config } = viewContent;
  const getPlaceholderImage = () => {
    const { presentationOptions = {}, categoryPresentationOptions = {} } = config;
    if (!getIsUsingDots(presentationOptions) && !getIsUsingDots(categoryPresentationOptions))
      return '/images/matrix-placeholder-text-only.png';
    if ((presentationOptions as ConditionalPresentationOptions)?.applyLocation?.columnIndexes)
      return '/images/matrix-placeholder-mix.png';
    return '/images/matrix-placeholder-dot-only.png';
  };
  if (!isEnlarged) return <img src={getPlaceholderImage()} alt="Matrix Placeholder" />;

  const parsedRows = parseRows(rows, undefined);
  const parsedColumns = parseColumns(columns);

  return <MatrixComponent {...config} rows={parsedRows} columns={parsedColumns} />;
};
