/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { darken, TableHead, TableRow } from '@material-ui/core';
import styled from 'styled-components';
import { MatrixColumnType } from '../../types';
import { MatrixContext } from './MatrixContext';
import { Cell } from './Cell';
import { getFlattenedColumns } from './utils';

const HeaderCell = styled(Cell)`
  line-height: 1.4;
  z-index: 3; // set the z-index of the first cell to be above the rest of the column header cells so that it doesn't get covered on horizontal scroll
  box-shadow: inset 0 -1px 0 0 ${({ theme }) => theme.palette.divider}; // add a border to the bottom but ise a box shadow so that it doesn't get hidden on scroll
  &.MuiTableCell-row-head {
    z-index: 4; // set the z-index of the first cell to be above the rest of the column header cells so that it doesn't get covered on horizontal scroll
    max-width: 12rem; // set the max-width of the first cell so that on larger screens the row header column doesn't take up too much space
    box-shadow: inset -1px -1px 0 0 ${({ theme }) => theme.palette.divider}; // add a border to the right of the first cell, but use a box shadow so that it doesn't get hidden on scroll
  }
`;

const ColGroup = styled.colgroup`
  &:not(:first-of-type) {
    border-right: 1px solid ${({ theme }) => darken(theme.palette.text.primary, 0.4)};
  }
`;

/**
 * This is a component that renders the header rows in the matrix. It renders the column groups and columns.
 */
export const MatrixHeader = () => {
  const { columns, hideColumnTitles = false, rowHeaderColumnTitle } = useContext(MatrixContext);
  // Get the grouped columns
  const columnGroups = columns.reduce((result: MatrixColumnType[], column: MatrixColumnType) => {
    if (!column.children?.length) return result;
    return [...result, column];
  }, []);

  // If there are parents, then there should be two rows: 1 for the column group headings, and one for the column headings
  const hasParents = columnGroups.length > 0;

  const RowHeaderColumn = (
    <HeaderCell rowSpan={hasParents ? 2 : 1} scope="row" className="MuiTableCell-row-head">
      {rowHeaderColumnTitle}
    </HeaderCell>
  );

  const flattenedColumns = getFlattenedColumns(columns);

  return (
    /**
     * If there are no parents, then there are only column groups to style for the row header column and the rest of the table. Otherwise, there are column groups for each displayed column group, plus one for the row header column.
     * */
    <>
      <ColGroup span="1" />
      {hasParents ? (
        <>
          {columnGroups.map(({ title, children = [] }) => (
            <ColGroup key={title} span={children.length} />
          ))}
        </>
      ) : (
        <ColGroup span={columns.length} />
      )}
      <TableHead>
        {hasParents && (
          <TableRow>
            {RowHeaderColumn}
            {columnGroups.map(({ title, children = [] }) => (
              <HeaderCell key={title} colSpan={children.length}>
                {title}
              </HeaderCell>
            ))}
          </TableRow>
        )}
        <TableRow>
          {/** If hasParents is true, then this row header column cell will have already been rendered. */}
          {!hasParents && RowHeaderColumn}
          {flattenedColumns.map(({ title, key }) => (
            <HeaderCell
              key={key}
              aria-label={hideColumnTitles ? title : ''}
              $characterLength={title?.length}
            >
              {!hideColumnTitles && title}
            </HeaderCell>
          ))}
        </TableRow>
      </TableHead>
    </>
  );
};
