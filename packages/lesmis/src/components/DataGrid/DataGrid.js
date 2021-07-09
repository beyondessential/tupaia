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
import TableContainer from '@material-ui/core/TableContainer';
import { DefaultColumnFilter } from './DefaultColumnFilter';
import { Paginator } from './Paginator';
import { NoDataRow } from './NoDataRow';
import { FlexStart } from '../Layout';

const StyledTable = styled(Table)`
  background: white;
  border: 1px solid ${props => props.theme.palette.grey['400']};
`;

const FilterTableCell = styled(TableCell)`
  padding: 1.125rem 0.625rem 1.125rem 0;
  background: ${props => props.theme.palette.grey['200']};
`;

const sortTypes = {
  alphanumeric: (row1, row2, columnName) => {
    const rowOneColumn = row1.values[columnName];
    const rowTwoColumn = row2.values[columnName];

    if (!rowOneColumn) {
      return -1;
    }

    if (!rowTwoColumn) {
      return 1;
    }

    if (isNaN(rowOneColumn)) {
      return rowOneColumn.toUpperCase() > rowTwoColumn.toUpperCase() ? 1 : -1;
    }
    return Number(rowOneColumn) > Number(rowTwoColumn) ? 1 : -1;
  },
};

const filterTypes = {
  text: (rows, id, filterValue) => {
    return rows.filter(row => {
      const cellValue = row.values[id];
      return cellValue !== undefined
        ? String(cellValue).toLowerCase().startsWith(String(filterValue).toLowerCase())
        : true;
    });
  },
};

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
      sortTypes,
      filterTypes,
      columns,
      data,
      initialState: { pageSize: 20 },
      disableMultiSort: true,
      // This will stop the pagination resetting when data gets updated after mutations
      autoResetPage: false,
      autoResetSortBy: false,
      autoResetFilters: false,
    },
    useFilters,
    useSortBy,
    usePagination,
  );

  return (
    <TableContainer>
      <StyledTable {...getTableProps()}>
        <TableHead>
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                  <FlexStart>
                    {column.render('Header')}
                    <TableSortLabel
                      active={column.isSorted}
                      direction={column.isSortedDesc ? 'asc' : 'desc'}
                    />
                  </FlexStart>
                </TableCell>
              ))}
            </TableRow>
          ))}
          {headerGroups.map(headerGroup => (
            <TableRow {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <FilterTableCell {...column.getHeaderProps()}>
                  {column.canFilter ? column.render('Filter') : null}
                </FilterTableCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody {...getTableBodyProps()}>
          {page.length === 0 ? (
            <NoDataRow colSpan={columns.length} />
          ) : (
            page.map(row => {
              prepareRow(row);
              return (
                <StyledTableRow {...row.getRowProps()}>
                  {row.cells.map(cell => (
                    <TableCell {...cell.getCellProps()}>{cell.render('Cell')}</TableCell>
                  ))}
                </StyledTableRow>
              );
            })
          )}
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
    </TableContainer>
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
