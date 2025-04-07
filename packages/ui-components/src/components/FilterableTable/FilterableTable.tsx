import React, { useMemo } from 'react';
import {
  TableContainer as MuiTableContainer,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from '@material-ui/core';
import styled from 'styled-components';
import { Column, useFlexLayout, useResizeColumns, useTable, SortingRule } from 'react-table';
import { KeyboardArrowDown } from '@material-ui/icons';
import { SpinningLoader } from '../Loaders';
import { HeaderDisplayCell, TableCell } from './Cells';
import { FilterCell, FilterCellProps, Filters } from './FilterCell';
import { Pagination } from './Pagination';

const TableContainer = styled(MuiTableContainer)`
  position: relative;
  flex: 1;
  overflow: auto;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.palette.background.paper};
  table {
    min-width: 45rem;
  }
  // Because we want two header rows to be sticky, we need to set the position of the thead to sticky
  thead {
    position: sticky;
    top: 0;
    z-index: 2;
  }
  tr {
    display: flex;
  }
  .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
    border-color: ${({ theme }) => theme.palette.primary.main};
  }
`;

const NoDataMessage = styled.div`
  width: 100%;
  text-align: center;
  padding-block: 2.5rem;
  padding-inline: 2rem;
`;

const LoadingContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type SortBy = {
  id: string;
  desc: boolean;
};

type ColumnInstance = Record<string, any> & {
  CellContentComponent?: React.ComponentType<any>;
};

interface FilterableTableProps {
  columns: Column<ColumnInstance>[];
  data?: Record<string, any>[];
  pageIndex?: number;
  pageSize?: number;
  sorting?: SortBy[];
  numberOfPages?: number;
  hiddenColumns?: string[];
  onChangePage: (pageIndex: number) => void;
  onChangePageSize: (pageSize: number) => void;
  onChangeSorting: (sorting: SortingRule<Record<string, any>>[]) => void;
  onChangeFilters: FilterCellProps['onChangeFilters'];
  filters?: Filters;
  totalRecords: number;
  noDataMessage?: string;
  isLoading?: boolean;
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
  onChangeFilters,
  filters = [],
  totalRecords,
  noDataMessage,
  isLoading,
}: FilterableTableProps) => {
  const memoisedData = useMemo(() => data ?? [], [data]);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows,
    pageCount,
    visibleColumns,
    // Get the state from the instance
  } = useTable(
    {
      columns,
      data: memoisedData,
      initialState: {
        sortBy: sorting,
        hiddenColumns,
      },
      manualPagination: true,
      pageCount: numberOfPages,
      manualSortBy: true,
    },
    useFlexLayout,
    useResizeColumns,
  );

  const displayFilterRow = visibleColumns.some(column => column.filterable !== false);

  const getSortedConfig = (id: string) => sorting.find(sort => sort.id === id);

  const updateSorting = (id: string, isDesc?: boolean) => {
    const currentSorting = getSortedConfig(id);
    if (!currentSorting) {
      return onChangeSorting([{ id, desc: false }]);
    }
    if (isDesc) {
      return onChangeSorting([]);
    }
    return onChangeSorting([{ id, desc: true }]);
  };

  return (
    <>
      <TableContainer>
        <Table {...getTableProps()} stickyHeader className="data-fetching-table">
          <TableHead>
            {headerGroups.map(({ getHeaderGroupProps, headers }, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <TableRow {...getHeaderGroupProps()} key={`table-header-row-${index}`}>
                {headers.map(
                  ({
                    getHeaderProps,
                    render,
                    disableSortBy,
                    getResizerProps,
                    canResize,
                    maxWidth,
                    id,
                  }) => {
                    const sortedConfig = getSortedConfig(id);
                    return (
                      <HeaderDisplayCell
                        {...getHeaderProps()}
                        key={`header-${id}`}
                        canResize={canResize}
                        getResizerProps={getResizerProps}
                        maxWidth={maxWidth}
                      >
                        {render('Header')}
                        {!disableSortBy && (
                          <TableSortLabel
                            active={!!sortedConfig}
                            direction={sortedConfig?.desc ? 'asc' : 'desc'}
                            IconComponent={KeyboardArrowDown}
                            onClick={() => updateSorting(id, sortedConfig?.desc)}
                          />
                        )}
                      </HeaderDisplayCell>
                    );
                  },
                )}
              </TableRow>
            ))}
            {displayFilterRow && (
              <TableRow>
                {visibleColumns.map(column => {
                  return (
                    <FilterCell
                      {...column.getHeaderProps()}
                      key={column.id}
                      column={column}
                      onChangeFilters={onChangeFilters}
                      filters={filters}
                    />
                  );
                })}
              </TableRow>
            )}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()} key={`table-row-${row.id}`}>
                  {row.cells.map(({ getCellProps, render }, i) => {
                    const col = visibleColumns[i] as ColumnInstance;
                    return (
                      <TableCell
                        {...getCellProps()}
                        key={`table-row-${row.id}-cell-${col.id}`}
                        row={row.original}
                        maxWidth={col.maxWidth}
                        column={col}
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
        {rows.length === 0 && noDataMessage && !isLoading && (
          <NoDataMessage>
            <Typography variant="body2">{noDataMessage}</Typography>
          </NoDataMessage>
        )}
        {isLoading && (
          <LoadingContainer>
            <SpinningLoader />
          </LoadingContainer>
        )}
      </TableContainer>
      <Pagination
        page={pageIndex}
        pageCount={pageCount}
        onChangePage={onChangePage}
        pageSize={pageSize}
        onChangePageSize={onChangePageSize}
        totalRecords={totalRecords}
      />
    </>
  );
};
