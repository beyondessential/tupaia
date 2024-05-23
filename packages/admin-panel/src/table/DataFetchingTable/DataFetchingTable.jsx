/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useTable, usePagination, useSortBy } from 'react-table';
import {
  TableHead,
  TableContainer as MuiTableContainer,
  TableRow,
  TableBody,
  Table,
  Typography,
  TableSortLabel,
} from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { Alert } from '@tupaia/ui-components';
import { generateConfigForColumnType } from '../columnTypes';
import { getIsFetchingData, getTableState } from '../selectors';
import { getIsChangingDataOnServer } from '../../dataChangeListener';
import {
  cancelAction,
  changeFilters,
  changePage,
  changePageSize,
  changeResizedColumns,
  changeSorting,
  confirmAction,
  refreshData,
} from '../actions';
import { FilterCell } from './FilterCell';
import { Pagination } from './Pagination';
import { DisplayCell, HeaderDisplayCell } from './Cells';
import { ConfirmDeleteModal } from '../../widgets';

const ErrorAlert = styled(Alert).attrs({
  severity: 'error',
})`
  margin: 0.5rem;
`;

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
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

const MessageWrapper = styled.div`
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
`;

const DataFetchingTableComponent = ({
  columns,
  data = [],
  numberOfPages,
  pageSize,
  pageIndex,
  onPageChange,
  onPageSizeChange,
  initialiseTable,
  nestingLevel,
  filters,
  sorting,
  isChangingDataOnServer,
  errorMessage,
  onRefreshData,
  confirmActionMessage,
  onConfirmAction,
  onCancelAction,
  deleteConfig,
  onFilteredChange,
  totalRecords,
  isFetchingData,
  onSortedChange,
  detailUrl,
  getHasNestedView,
  endpoint,
  getNestedViewLink,
  baseFilter,
  basePath,
  resourceName,
  defaultSorting,
}) => {
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
      data,
      initialState: {
        pageIndex,
        pageSize,
        sortBy: sorting,
        hiddenColumns: columns.filter(column => column.show === false).map(column => column.id),
      },
      manualPagination: true,
      pageCount: numberOfPages,
      manualSortBy: true,
    },
    useSortBy,
    usePagination,
  );

  // Listen for changes in pagination and use the state to fetch our new data
  useEffect(() => {
    onPageChange(tablePageIndex);
  }, [tablePageIndex]);

  useEffect(() => {
    onPageSizeChange(tablePageSize);
    gotoPage(0);
  }, [tablePageSize]);

  useEffect(() => {
    onSortedChange(tableSorting);
    gotoPage(0);
  }, [tableSorting]);

  useEffect(() => {
    onRefreshData();
  }, [filters, pageIndex, pageSize, sorting]);

  useEffect(() => {
    if (!isChangingDataOnServer && !errorMessage) {
      onRefreshData();
    }
  }, [errorMessage, isChangingDataOnServer]);

  // initial render/re-render when endpoint changes
  useEffect(() => {
    if (nestingLevel === 0) {
      // Page-level filters only apply to top-level data tables
      const params = queryString.parse(location.search); // set filters from query params
      const parsedFilters = params.filters ? JSON.parse(params.filters) : undefined;
      initialiseTable(parsedFilters);
    } else {
      initialiseTable();
    }
    gotoPage(0);
    setSortBy(defaultSorting ?? []); // reset sorting when table is re-initialised
  }, [endpoint, JSON.stringify(baseFilter)]);

  const onChangeFilters = newFilters => {
    onFilteredChange(newFilters);
    gotoPage(0);
  };

  const isLoading = isFetchingData || isChangingDataOnServer;

  const displayFilterRow = visibleColumns.some(column => column.filterable !== false);
  const { singular = 'record' } = resourceName;
  return (
    <Wrapper>
      {errorMessage && <ErrorAlert>{errorMessage}</ErrorAlert>}
      {isLoading && (
        <MessageWrapper>
          <Typography variant="body2">Loading</Typography>
        </MessageWrapper>
      )}
      {data.length === 0 && !isLoading && (
        <MessageWrapper>
          <Typography variant="body2">No data to display</Typography>
        </MessageWrapper>
      )}
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
                      isButtonColumn,
                    },
                    i,
                  ) => {
                    return (
                      <HeaderDisplayCell
                        {...getHeaderProps(getSortByToggleProps())}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`header-${i}`}
                        isButtonColumn={isButtonColumn}
                        width={visibleColumns[i].colWidth}
                      >
                        {render('Header')}
                        {canSort && (
                          <TableSortLabel
                            active={isSorted}
                            direction={isSortedDesc ? 'asc' : 'desc'}
                            IconComponent={KeyboardArrowDown}
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
                      key={column.id}
                      column={column}
                      onFilteredChange={onChangeFilters}
                      filters={filters}
                      width={column.colWidth}
                      isButtonColumn={column.isButtonColumn}
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
                    return (
                      <DisplayCell
                        {...getCellProps()}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`table-row-${index}-cell-${i}`}
                        row={row}
                        detailUrl={visibleColumns[i].isButtonColumn ? '' : detailUrl}
                        getHasNestedView={getHasNestedView}
                        width={visibleColumns[i].colWidth}
                        getNestedViewLink={getNestedViewLink}
                        isButtonColumn={visibleColumns[i].isButtonColumn}
                        basePath={basePath}
                      >
                        {render('Cell')}
                      </DisplayCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        page={tablePageIndex}
        pageCount={pageCount}
        gotoPage={gotoPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalRecords={totalRecords}
      />

      <ConfirmDeleteModal
        isOpen={!!confirmActionMessage}
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
        title={deleteConfig?.title || `Delete ${singular}`}
        heading={deleteConfig?.heading || `You are about to delete this ${singular}`}
        description={
          deleteConfig?.description ||
          `Are you sure you would like to delete this ${singular}? This cannot be undone.`
        }
        confirmButtonText={deleteConfig?.confirmButtonText || `Delete ${singular}`}
        cancelButtonText={deleteConfig?.cancelButtonText || 'Cancel'}
      />
    </Wrapper>
  );
};

DataFetchingTableComponent.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  confirmActionMessage: PropTypes.string,
  errorMessage: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  filters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isFetchingData: PropTypes.bool.isRequired,
  isChangingDataOnServer: PropTypes.bool.isRequired,
  numberOfPages: PropTypes.number,
  TableComponent: PropTypes.elementType,
  onCancelAction: PropTypes.func.isRequired,
  onConfirmAction: PropTypes.func.isRequired,
  onFilteredChange: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  onRefreshData: PropTypes.func.isRequired,
  onResizedChange: PropTypes.func.isRequired,
  onSortedChange: PropTypes.func.isRequired,
  initialiseTable: PropTypes.func.isRequired,
  pageIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  reduxId: PropTypes.string.isRequired,
  resizedColumns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  sorting: PropTypes.array.isRequired,
  nestingLevel: PropTypes.number,
  deleteConfig: PropTypes.object,
  actionColumns: PropTypes.arrayOf(PropTypes.shape({})),
  totalRecords: PropTypes.number,
  detailUrl: PropTypes.string,
  getHasNestedView: PropTypes.func,
  endpoint: PropTypes.string.isRequired,
  getNestedViewLink: PropTypes.func,
  baseFilter: PropTypes.object,
  basePath: PropTypes.string,
  resourceName: PropTypes.object,
  defaultSorting: PropTypes.array,
};

DataFetchingTableComponent.defaultProps = {
  confirmActionMessage: null,
  data: [],
  errorMessage: '',
  numberOfPages: 0,
  nestingLevel: 0,
  deleteConfig: {},
  TableComponent: undefined,
  actionColumns: [],
  totalRecords: 0,
  detailUrl: '',
  getHasNestedView: null,
  getNestedViewLink: null,
  baseFilter: null,
  basePath: '',
  resourceName: {},
  defaultSorting: [],
};

const mapStateToProps = (state, { columns, reduxId, ...ownProps }) => ({
  isFetchingData: getIsFetchingData(state, reduxId),
  columns: columns.map(originalColumn => formatColumnForReactTable(originalColumn, reduxId)),
  isChangingDataOnServer: getIsChangingDataOnServer(state),
  ...ownProps,
  ...getTableState(state, reduxId),
});

const mapDispatchToProps = (dispatch, { reduxId }) => ({
  dispatch,
  onCancelAction: () => dispatch(cancelAction(reduxId)),
  onConfirmAction: () => dispatch(confirmAction(reduxId)),
  onPageChange: newPageIndex => dispatch(changePage(reduxId, newPageIndex)),
  onPageSizeChange: (newPageSize, newPageIndex) =>
    dispatch(changePageSize(reduxId, newPageSize, newPageIndex)),
  onSortedChange: newSorting => dispatch(changeSorting(reduxId, newSorting)),
  onFilteredChange: newFilters => dispatch(changeFilters(reduxId, newFilters)),
  onResizedChange: newResized => dispatch(changeResizedColumns(reduxId, newResized)),
});

const mergeProps = (stateProps, { dispatch, ...dispatchProps }, ownProps) => {
  const {
    baseFilter = {},
    defaultFilters = [],
    defaultSorting = [],
    endpoint,
    columns,
    reduxId,
    ...restOfOwnProps
  } = ownProps;
  const onRefreshData = () =>
    dispatch(refreshData(reduxId, endpoint, columns, baseFilter, stateProps));
  const initialiseTable = (filters = defaultFilters) => {
    dispatch(changeSorting(reduxId, defaultSorting));
    dispatch(changeFilters(reduxId, filters)); // will trigger a data fetch afterwards
  };
  return {
    reduxId,
    ...restOfOwnProps,
    ...stateProps,
    ...dispatchProps,
    onRefreshData,
    initialiseTable,
  };
};

const formatColumnForReactTable = (originalColumn, reduxId) => {
  const { source, type, actionConfig, filterable, ...restOfColumn } = originalColumn;
  const id = source || type;
  return {
    id,
    accessor: id?.includes('.') ? row => row[source] : id, // react-table doesn't like .'s
    actionConfig,
    reduxId,
    type,
    disableSortBy: !source, // disable action columns from being sortable
    filterable: filterable !== false,
    ...generateConfigForColumnType(type, actionConfig, reduxId), // Add custom Cell/width/etc.
    ...restOfColumn,
  };
};

export const DataFetchingTable = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(DataFetchingTableComponent);
