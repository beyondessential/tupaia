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
  Alert,
} from '@tupaia/ui-components';
import { MatrixDataColumn, MatrixDataRow, MatrixViewContent } from '../types';
import { ConditionalPresentationOptions } from '@tupaia/types';
import styled from 'styled-components';

const NoDataMessage = styled(Alert).attrs({
  severity: 'info',
})`
  width: 100%;
  margin: 1rem auto;
  max-width: 24rem;
`;

// This is a recursive function that parses the rows of the matrix into a format that the Matrix component can use.
const parseRows = (
  rows: MatrixDataRow[],
  categoryId?: MatrixDataRow['categoryId'],
): MatrixRowType[] => {
  let topLevelRows = [];
  // if a categoryId is not passed in, then we need to find the top level rows
  if (!categoryId) {
    // get the highest level rows, which are the ones that have a category but no categoryId
    const highestLevel = rows.filter(row => row.category && !row.categoryId);
    // if there are no highest level rows, then the top level rows are just all of the rows
    topLevelRows = highestLevel.length ? highestLevel : rows;
  } else {
    // otherwise, the top level rows are the ones that have the categoryId that was passed in
    topLevelRows = rows.filter(row => row.categoryId === categoryId);
  }

  // loop through the topLevelRows, and parse them into the format that the Matrix component can use
  return topLevelRows.map(row => {
    const { dataElement = '', category, ...rest } = row;
    // if the row has a category, then it has children, so we need to parse them using this same function
    if (category) {
      return {
        title: category,
        ...rest,
        children: parseRows(rows, category),
      };
    }
    // otherwise, handle as a regular row
    return {
      title: dataElement,
      ...rest,
    };
  });
};

// This is a recursive function that parses the columns of the matrix into a format that the Matrix component can use.
const parseColumns = (columns: MatrixDataColumn[]): MatrixColumnType[] => {
  return columns.map(column => {
    const { category, key, title, columns: children } = column;
    // if a column has a category, then it has children, so we need to parse them using this same function
    if (category)
      return {
        title: category,
        key: category,
        children: parseColumns(children!),
      };
    // otherwise, handle as a regular column
    return {
      title,
      key,
    };
  });
};

const getPlaceholderImage = ({ presentationOptions = {}, categoryPresentationOptions = {} }) => {
  // if the matrix is not using any dots, show a text-only placeholder
  if (!getIsUsingDots(presentationOptions) && !getIsUsingDots(categoryPresentationOptions))
    return '/images/matrix-placeholder-text-only.png';
  // if the matrix has applyLocation.columnIndexes, show a mix placeholder, because this means it is a mix of dots and text
  if ((presentationOptions as ConditionalPresentationOptions)?.applyLocation?.columnIndexes)
    return '/images/matrix-placeholder-mix.png';
  // otherwise, show a dot-only placeholder
  return '/images/matrix-placeholder-dot-only.png';
};

/**
 * This is the component that is used to display a matrix. It handles the parsing of the data into the format that the Matrix component can use, as well as placeholder images. It shows a message when there are no rows available to display.
 */

interface MatrixProps {
  viewContent: MatrixViewContent;
  isEnlarged?: boolean;
}
export const Matrix = ({ viewContent, isEnlarged = false }: MatrixProps) => {
  const { columns, rows, ...config } = viewContent;

  const placeholderImage = getPlaceholderImage(config);
  // in the dashboard, show a placeholder image
  if (!isEnlarged) return <img src={placeholderImage} alt="Matrix Placeholder" />;

  const parsedRows = parseRows(rows);
  const parsedColumns = parseColumns(columns);

  if (!parsedRows.length) return <NoDataMessage>No data available</NoDataMessage>;

  return <MatrixComponent {...config} rows={parsedRows} columns={parsedColumns} />;
};
