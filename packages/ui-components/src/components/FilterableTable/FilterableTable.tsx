/**
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import React, { memo, useEffect, useMemo } from 'react';
import {
  TableContainer as MuiTableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableSortLabel,
} from '@material-ui/core';
import styled from 'styled-components';
import {
  Column,
  useFlexLayout,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
  SortingRule,
} from 'react-table';
import { KeyboardArrowDown } from '@material-ui/icons';
import { HeaderDisplayCell, TableCell } from './Cells';
import { FilterCell, FilterCellProps, Filters } from './FilterCell';
import { set } from 'date-fns';
import { Pagination } from './Pagination';

const TableContainer = styled(MuiTableContainer)`
  position: relative;
  flex: 1;
  overflow: auto;
  table {
    min-width: 45rem;
  }
  // Because we want two header rows to be sticky, we need to set the position of the thead to sticky
  thead {
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: ${({ theme }) => theme.palette.background.paper};
  }
  tr {
    display: flex;
    
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

type SortBy = {
  id: string;
  desc: boolean;
};

interface FilterableTableProps {
  columns: Column<Record<string, any>>[];
  data?: Record<string, any>[];
  pageIndex?: number;
  pageSize?: number;
  sorting?: SortBy[];
  numberOfPages?: number;
  hiddenColumns?: string[];
  onChangePage: (pageIndex: number) => void;
  onChangePageSize: (pageSize: number) => void;
  onChangeSorting: (sorting: SortingRule<Record<string, any>>[]) => void;
  refreshData: () => void;
  isLoading: boolean;
  errorMessage: string;
  onChangeFilters: FilterCellProps['onChangeFilters'];
  filters?: Filters;
  totalRecords: number;
}

export const FilterableTable = ({
  columns,
  data,
  pageIndex = 0,
  pageSize = 20,
  sorting = [],
  numberOfPages = 1,
  hiddenColumns = [],
  onChangePage,
  onChangePageSize,
  onChangeSorting,
  isLoading,
  errorMessage,
  onChangeFilters,
  filters = [],
  totalRecords,
}: FilterableTableProps) => {
  const memoisedData = useMemo(() => data ?? [], [data]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    pageCount,
    gotoPage,
    setPageSize,
    visibleColumns,
    setSortBy,
    // Get the state from the instance
    state: { pageIndex: tablePageIndex, pageSize: tablePageSize, sortBy: tableSorting },
  } = useTable(
    {
      columns,
      data: memoisedData,
      initialState: {
        pageIndex,
        pageSize,
        sortBy: sorting,
        hiddenColumns,
      },
      manualPagination: true,
      pageCount: numberOfPages,
      manualSortBy: true,
    },
    useSortBy,
    usePagination,
    useFlexLayout,
    useResizeColumns,
  );

  //  Listen for changes in pagination and use the state to fetch our new data
  useEffect(() => {
    onChangePage(tablePageIndex);
  }, [tablePageIndex]);

  useEffect(() => {
    onChangePageSize(tablePageSize);
    gotoPage(0);
  }, [tablePageSize]);

  useEffect(() => {
    if (JSON.stringify(sorting) === JSON.stringify(tableSorting)) return;
    onChangeSorting(tableSorting);
    gotoPage(0);
  }, [JSON.stringify(tableSorting)]);

  useEffect(() => {
    if (JSON.stringify(sorting) === JSON.stringify(tableSorting)) return;
    setSortBy(sorting);
    gotoPage(0);
  }, [JSON.stringify(sorting)]);

  const updateFilters = newFilters => {
    onChangeFilters(newFilters);
    gotoPage(0);
  };

  const displayFilterRow = visibleColumns.some(column => column.filterable !== false);

  return (
    <>
      <TableContainer>
        <Table {...getTableProps()} stickyHeader className="data-fetching-table">
          <TableHead>
            {headerGroups.map(({ getHeaderGroupProps, headers }, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <TableRow {...getHeaderGroupProps()} key={`table-header-row-${index}`}>
                {headers.map(
                  (
                    {
                      getHeaderProps,
                      render,
                      isSorted,
                      isSortedDesc,
                      getSortByToggleProps,
                      canSort,
                      getResizerProps,
                      canResize,
                    },
                    i,
                  ) => {
                    return (
                      <HeaderDisplayCell
                        {...getHeaderProps()}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`header-${i}`}
                        canResize={canResize}
                        getResizerProps={getResizerProps}
                      >
                        {render('Header')}
                        {canSort && (
                          <TableSortLabel
                            active={isSorted}
                            direction={isSortedDesc ? 'asc' : 'desc'}
                            IconComponent={KeyboardArrowDown}
                            {...getSortByToggleProps()}
                          />
                        )}
                      </HeaderDisplayCell>
                    );
                  },
                )}
              </TableRow>
            ))}
            <TableRow>
              {displayFilterRow &&
                visibleColumns.map(column => {
                  return (
                    <FilterCell
                      {...column.getHeaderProps()}
                      key={column.id}
                      column={column}
                      onChangeFilters={updateFilters}
                      filters={filters}
                    />
                  );
                })}
            </TableRow>
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {rows.map((row, index) => {
              prepareRow(row);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <TableRow {...row.getRowProps()} key={`table-row-${index}`}>
                  {row.cells.map(({ getCellProps, render }, i) => {
                    const col = visibleColumns[i];
                    return (
                      <TableCell
                        {...getCellProps()}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`table-row-${index}-cell-${i}`}
                        isCentered={col.isCentered}
                        row={row.original}
                      >
                        {render('Cell')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        page={pageIndex}
        pageCount={pageCount}
        gotoPage={gotoPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalRecords={totalRecords}
      />
    </>
  );
};
