/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 *
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useTable, useFilters, useSortBy, usePagination } from 'react-table';
import { Table, TableHead, TableRow, TableBody, TableSortLabel } from '@material-ui/core';
import { TableCell, StyledTableRow } from '@tupaia/ui-components';
import { DefaultColumnFilter } from './DefaultColumnFilter';
import { Paginator } from './Paginator';

const StyledTable = styled(Table)`
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
`;

const StyledTableCell = styled(TableCell)`
  padding: 1.125rem 0.625rem 1.125rem 0;
  background: ${props => props.theme.palette.grey['200']};
`;

const filterTypes = () => ({
  text: (rows, id, filterValue) => {
    return rows.filter(row => {
      const rowValue = row.values[id];
      return rowValue !== undefined
        ? String(rowValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
        : true;
    });
  },
});

export const DataGrid = ({ data, columns }) => {
  const defaultColumn = React.useMemo(
    () => ({
      Filter: DefaultColumnFilter,
    }),
    [],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    page,
    canPreviousPage,
    canNextPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      defaultColumn,
      filterTypes,
      columns,
      data,
      initialState: { pageSize: 20 },
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  return (
    <>
      <StyledTable {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  <TableSortLabel
                    active={column.isSorted}
                    direction={column.isSortedDesc ? 'asc' : 'desc'}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <StyledTableCell {...column.getHeaderProps()}>
                  {column.canFilter ? column.render('Filter') : null}
                </StyledTableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {page.map((row => {
            prepareRow(row);
            return (
              <StyledTableRow {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                ))}
              </StyledTableRow>
            );
          })}
        </TableBody>
      </StyledTable>
      <Paginator
        canNextPage={canNextPage}
        canPreviousPage={canPreviousPage}
        nextPage={nextPage}
        pageIndex={pageIndex}
        pageSize={pageSize}
        previousPage={previousPage}
        setPageSize={setPageSize}
        totalCount={rows.length}
      />
    </>
  );
};

DataGrid.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      permissionGroupName: PropTypes.string,
    }),
  ),
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      accessor: PropTypes.string,
      Header: PropTypes.string,
    }),
  ).isRequired,
};

DataGrid.defaultProps = {
  data: null,
};
