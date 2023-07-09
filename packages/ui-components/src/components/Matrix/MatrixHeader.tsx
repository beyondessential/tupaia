/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { TableCell, TableHead, TableRow, darken } from '@material-ui/core';
import styled from 'styled-components';
import { MatrixContext } from './MatrixContext';
import { getDisplayedColumns, hexToRgba } from './utils';
import { MatrixColumnType } from '../../types';

const HeaderCell = styled(TableCell)`
  text-align: center;
  max-width: 12rem;
  border-width: 1px 1px 2px 1px;
  border-style: solid;
  border-color: ${({ theme }) => darken(theme.palette.text.primary, 0.4)}
    ${({ theme }) => hexToRgba(theme.palette.text.primary, 0.2)};
`;

const ColGroup = styled.colgroup`
  border: 2px solid ${({ theme }) => darken(theme.palette.text.primary, 0.4)};
`;

/**
 * This is a component that renders the header rows in the matrix. It renders the column groups and columns.
 */
export const MatrixHeader = () => {
  const { columns, startColumn, maxColumns, hideColumnTitles = false } = useContext(MatrixContext);
  const displayedColumns = getDisplayedColumns(columns, startColumn, maxColumns);
  // If a column is not displayed, then it should not be rendered in the header. This means that if a column group has no displayed children, then it should not be rendered either.
  const displayedColumnGroups = columns.reduce(
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
  const hasParents = displayedColumnGroups.length > 0;

  return (
    /** If there are no parents, then there are only column groups to style for the row header column and the rest of the table. Otherwise, there are column groups for each displayed column group, plus one for the row header column.*/
    <>
      <ColGroup />
      {hasParents ? (
        <>
          {displayedColumnGroups.map(({ title, children = [] }) => (
            <ColGroup key={title} span={children.length} />
          ))}
        </>
      ) : (
        <ColGroup span={displayedColumns.length} />
      )}
      <TableHead>
        {hasParents && (
          <TableRow>
            <HeaderCell rowSpan={2} />
            {displayedColumnGroups.map(({ title, children = [] }) => (
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
            <HeaderCell key={key} aria-label={hideColumnTitles ? title : ''}>
              {!hideColumnTitles && title}
            </HeaderCell>
          ))}
        </TableRow>
      </TableHead>
    </>
  );
};
