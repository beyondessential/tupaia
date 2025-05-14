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
import { FlexStart } from '../Layout';
import { StyledTable } from './StyledTable';
import { DataTableCell } from './DataTableCell';

interface DataTableProps {
  columns: any[];
  data?: Record<string, unknown>[];
  className?: string;
  rowLimit?: number;
  total?: number;
  stickyHeader?: boolean;
}

export const DataTable = ({
  columns,
  data = [],
  className = '',
  rowLimit = 0,
  total = 0,
  stickyHeader = false,
}: DataTableProps) => {
  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, rows } = useTable(
    {
      columns,
      data,
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
      <StyledTable {...getTableProps()} stickyHeader={stickyHeader}>
        <TableHead>
          {headerGroups.map(({ getHeaderGroupProps, headers }, index) => (
            <TableRow {...getHeaderGroupProps()} key={`table-header-row-${index}`}>
              {headers.map(
                ({ getHeaderProps, render, isSorted, isSortedDesc, getSortByToggleProps }, i) => (
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
          {rowsToRender.map((row, index) => {
            prepareRow(row);
            return (
              <TableRow {...row.getRowProps()} key={`table-row-${index}`}>
                {row.cells.map(({ getCellProps, value }, i) => (
                  <DataTableCell
                    value={value}
                    {...getCellProps()}
                    key={`table-row-${index}-cell-${i}`}
                  />
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
