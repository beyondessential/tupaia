/*
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import React from 'react';
import PropTypes from 'prop-types';
import { useTable, useSortBy } from 'react-table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableBody from '@material-ui/core/TableBody';

import { StyledTable } from './StyledTable';
import { FlexStart } from '../Layout';

const getColumnId = ({ id, accessor, Header }) => {
  if (id) {
    return id;
  }

  if (typeof accessor === 'string') {
    return accessor;
  }

  return Header;
};

export const DataPreviewTable = ({ columns, data, className, rowLimit }) => {
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

  const hasLimitedRows = rowLimit !== null && rows.length > rowLimit;
  const rowsToRender = hasLimitedRows ? rows.slice(0, rowLimit) : rows;
  const limitedRowsMessage = hasLimitedRows
    ? `Displaying ${rowLimit} of ${rows.length} rows`
    : null;

  return (
    <TableContainer className={className}>
      <StyledTable {...getTableProps()} style={{ minWidth: columnsData.length * 140 + 250 }}>
        <TableHead>
          {headerGroups.map(({ getHeaderGroupProps, headers }) => (
            <TableRow {...getHeaderGroupProps()}>
              {headers.map(
                ({ getHeaderProps, getSortByToggleProps, isSorted, isSortedDesc, render }) => (
                  <TableCell {...getHeaderProps(getSortByToggleProps())}>
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
                {row.cells.map(({ getCellProps, render }) => (
                  <TableCell {...getCellProps()}>{render('Cell')}</TableCell>
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

DataPreviewTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  rowLimit: PropTypes.number,
};

DataPreviewTable.defaultProps = {
  className: null,
  rowLimit: null,
};
