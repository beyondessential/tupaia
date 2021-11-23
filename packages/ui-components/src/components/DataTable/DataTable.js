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

export const DataTable = ({ columns, data, className, chartConfig }) => {
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
      chartConfig,
    },
    useSortBy,
  );

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
                      {chartConfig[render('Header')]?.label || render('Header')}
                      <TableSortLabel active={isSorted} direction={isSortedDesc ? 'asc' : 'desc'} />
                    </FlexStart>
                  </TableCell>
                ),
              )}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {rows.map(row => {
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
    </TableContainer>
  );
};

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array.isRequired,
  chartConfig: PropTypes.object.isRequired,
  className: PropTypes.string,
};

DataTable.defaultProps = {
  className: null,
};
