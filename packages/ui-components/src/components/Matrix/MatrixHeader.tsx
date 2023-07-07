/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { TableCell, TableHead, TableRow } from '@material-ui/core';
import styled from 'styled-components';
import { MatrixContext } from './MatrixContext';
import { getDisplayedColumns } from './utils';
import { MatrixColumnType } from '../../types';

const HeaderCell = styled(TableCell)`
  text-align: center;
  max-width: 12rem;
`;

/**
 * This is a component that renders the header rows in the matrix. It renders the column groups and columns.
 */
export const MatrixHeader = () => {
  const { columns, startColumn, maxColumns } = useContext(MatrixContext);
  const displayedColumns = getDisplayedColumns(columns, startColumn, maxColumns);
  // get the column groups to display
  const displayedParents = columns.reduce(
    (result: MatrixColumnType[], column: MatrixColumnType) => {
      const visibleChildren =
        column.children?.filter(child => !!displayedColumns.find(({ key }) => key === child.key)) ||
        [];
      if (!visibleChildren.length) return result;
      return [...result, { ...column, children: visibleChildren }];
    },
    [],
  );

  // If there are parents, then there should be two rows: 1 for the column group headings, and one for the column headings
  const hasParents = displayedParents.length > 0;
  return (
    <TableHead>
      {hasParents && (
        <TableRow>
          <HeaderCell rowSpan={2} />
          {displayedParents.map(({ title, children = [] }) => (
            <HeaderCell key={title} colSpan={children.length}>
              {title}
            </HeaderCell>
          ))}
        </TableRow>
      )}
      <TableRow>
        {/** If hasParents is true, then this row header column cell will have already been rendered. */}
        {!hasParents && <HeaderCell />}
        {displayedColumns.map(({ title, key }) => (
          <HeaderCell key={key}>{title}</HeaderCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
