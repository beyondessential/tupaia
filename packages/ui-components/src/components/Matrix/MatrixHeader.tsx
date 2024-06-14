/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React, { useContext } from 'react';
import { darken, TableHead, TableRow } from '@material-ui/core';
import styled from 'styled-components';
import { MatrixColumnType } from '../../types';
import { MatrixContext, SearchFilter } from './MatrixContext';
import { HeaderCell } from './Cell';
import { MatrixSearchRow } from './MatrixSearchRow';
import { getFlattenedColumns } from './utils';

const ColGroup = styled.colgroup`
  &:not(:first-of-type) {
    border-right: 1px solid ${({ theme }) => darken(theme.palette.text.primary, 0.4)};
  }
`;

const THead = styled(TableHead)`
  // Apply sticky positioning to the header element, as we now have 2 header rows
  position: sticky;
  top: 0;
  z-index: 3;
`;

interface MatrixHeaderProps {
  onPageChange: (newPageIndex: number) => void;
  searchFilters?: SearchFilter[];
  clearSearchFilter?: (key: SearchFilter['key']) => void;
  updateSearchFilter?: (filter: SearchFilter) => void;
}
/**
/**
 * This is a component that renders the header rows in the matrix. It renders the column groups and columns.
 */
export const MatrixHeader = ({
  onPageChange,
  searchFilters,
  clearSearchFilter,
  updateSearchFilter,
}: MatrixHeaderProps) => {
  const { columns, hideColumnTitles = false } = useContext(MatrixContext);
  // Get the grouped columns
  const columnGroups = columns.reduce((result: MatrixColumnType[], column: MatrixColumnType) => {
    if (!column.children?.length) return result;
    return [...result, column];
  }, []);

  // If there are parents, then there should be two rows: 1 for the column group headings, and one for the column headings
  const hasParents = columnGroups.length > 0;

  const RowHeaderColumn = (
    <HeaderCell rowSpan={hasParents ? 2 : 1} scope="row" className="MuiTableCell-row-head" />
  );

  const flattenedColumns = getFlattenedColumns(columns);

  return (
    /**
     * If there are no parents, then there are only column groups to style for the row header column and the rest of the table. Otherwise, there are column groups for each displayed column group, plus one for the row header column.
     * */
    <>
      <ColGroup span={1} />
      {hasParents ? (
        <>
          {columnGroups.map(({ title, children = [] }) => (
            <ColGroup key={title} span={children.length} />
          ))}
        </>
      ) : (
        <ColGroup span={columns.length} />
      )}
      <THead>
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

        <MatrixSearchRow
          onPageChange={onPageChange}
          searchFilters={searchFilters}
          clearSearchFilter={clearSearchFilter}
          updateSearchFilter={updateSearchFilter}
        />
      </THead>
    </>
  );
};
