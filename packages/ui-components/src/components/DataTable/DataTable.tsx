/*
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import { useTable, useSortBy } from 'react-table';
import {
  TableCell,
  TableHead,
  TableSortLabel,
  TableContainer,
  TableRow,
  TableBody,
} from '@material-ui/core';
import { StyledTable } from './StyledTable';
import { DataTableCell } from './DataTableCell';

import { FlexStart } from '../Layout';

const getColumnId = ({
  id,
  accessor,
  Header,
}: {
  id: string;
  accessor?: string | ((row: any) => any);
  Header: string;
}) => {
  if (id) {
    return id;
  }

  if (typeof accessor === 'string') {
    return accessor;
  }

  return Header;
};

export const DataTable = ({
  columns,
  data,
  className = '',
  rowLimit = 0,
  total = 0,
}: {
  columns: any[];
  data: any[];
  className?: string;
  rowLimit?: number;
  total?: number;
}) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    columns: columnsData,
  } = useTable(
    {
      columns,
      data,
      initialState: {
        sortBy: [
          {
            id: getColumnId(columns[0]),
          },
        ],
      },
    },
    useSortBy,
  );

  const totalRows = total || rows.length;
  const hasLimitedRows = rowLimit ? totalRows > rowLimit : false;
  const rowsToRender = hasLimitedRows ? rows.slice(0, rowLimit) : rows;
  const limitedRowsMessage = hasLimitedRows
    ? `Displaying ${rowLimit} of ${total || totalRows} rows`
    : null;

  return (
    <TableContainer className={className}>
      <StyledTable {...getTableProps()} style={{ minWidth: columnsData.length * 140 + 250 }}>
        <TableHead>
          {headerGroups.map(({ getHeaderGroupProps, headers }, i) => (
            <TableRow {...getHeaderGroupProps()}>
              {headers.map(
                ({ getHeaderProps, render, isSorted, isSortedDesc, getSortByToggleProps }) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <TableCell {...getHeaderProps(getSortByToggleProps())} key={`header-${i}`}>
                    <FlexStart>
                      {render('Header')}
                      <TableSortLabel active={isSorted} direction={isSortedDesc ? 'asc' : 'desc'} />
                    </FlexStart>
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rowsToRender.map(row => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()}>
                {row.cells.map(({ getCellProps, value }) => (
                  <DataTableCell value={value} {...getCellProps()} />
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </StyledTable>
      {hasLimitedRows ? <div>{limitedRowsMessage}</div> : null}
    </TableContainer>
  );
};
