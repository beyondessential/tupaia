/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { useTable, usePagination, useSortBy } from 'react-table';
import {
  TableCell,
  TableHead,
  TableContainer,
  TableRow,
  TableBody,
  Table,
  Typography,
  TableSortLabel,
} from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { ConfirmDeleteModal } from '@tupaia/ui-components';
import { generateConfigForColumnType } from '../columnTypes';
import { getIsFetchingData, getTableState } from '../selectors';
import { getIsChangingDataOnServer } from '../../dataChangeListener';
import {
  cancelAction,
  changeExpansions,
  changeExpansionsTab,
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

const Cell = styled(TableCell)`
  vertical-align: middle;
  font-size: 0.75rem;
  padding: 0.7rem;
  overflow: hidden;
  max-width: 0;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const HeaderCell = styled(Cell)`
  color: ${({ theme }) => theme.palette.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeightMedium};
  .MuiTableSortLabel-icon {
    opacity: 1;
  }
  white-space: nowrap;
`;

const Wrapper = styled.div`
  position: relative;
`;
const LoadingWrapper = styled.div`
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
  }, [tablePageSize]);

  useEffect(() => {
    onSortedChange(tableSorting);
  }, [tableSorting]);

  useEffect(() => {
    onRefreshData();
  }, [filters, pageIndex, pageSize, sorting]);

  useEffect(() => {
    if (!isChangingDataOnServer && !errorMessage) {
      onRefreshData();
    }
  }, [errorMessage, isChangingDataOnServer]);

  // initial render
  useEffect(() => {
    if (nestingLevel === 0) {
      // Page-level filters only apply to top-level data tables
      const params = queryString.parse(location.search); // set filters from query params
      const parsedFilters = params.filters ? JSON.parse(params.filters) : undefined;
      initialiseTable(parsedFilters);
    } else {
      initialiseTable();
    }
  }, []);

  const isLoading = isFetchingData || isChangingDataOnServer;

  const displayFilterRow = visibleColumns.some(column => column.filterable !== false);

  return (
    <Wrapper>
      {isLoading && (
        <LoadingWrapper>
          <Typography variant="body2">Loading</Typography>
        </LoadingWrapper>
      )}
      <TableContainer>
        <Table {...getTableProps()}>
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
                    },
                    i,
                  ) => {
                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <HeaderCell {...getHeaderProps(getSortByToggleProps())} key={`header-${i}`}>
                        {render('Header')}
                        {canSort && (
                          <TableSortLabel
                            active={isSorted}
                            direction={isSortedDesc ? 'asc' : 'desc'}
                            IconComponent={KeyboardArrowDown}
                          />
                        )}
                      </HeaderCell>
                    );
                  },
                )}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            <TableRow>
              {displayFilterRow &&
                visibleColumns.map(column => {
                  return (
                    <Cell key={column.id}>
                      {column.filterable ? (
                        <FilterCell
                          column={column}
                          onFilteredChange={onFilteredChange}
                          filters={filters}
                        />
                      ) : null}
                    </Cell>
                  );
                })}
            </TableRow>
            {rows.map((row, index) => {
              prepareRow(row);
              return (
                // eslint-disable-next-line react/no-array-index-key
                <TableRow {...row.getRowProps()} key={`table-row-${index}`}>
                  {row.cells.map(({ getCellProps, value, render }, i) => {
                    return (
                      <Cell
                        value={value}
                        {...getCellProps()}
                        // eslint-disable-next-line react/no-array-index-key
                        key={`table-row-${index}-cell-${i}`}
                      >
                        {render('Cell')}
                      </Cell>
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
        message={confirmActionMessage}
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
        title={deleteConfig.title}
        description={deleteConfig.description}
        cancelButtonText={deleteConfig.cancelButtonText}
        confirmButtonText={deleteConfig.confirmButtonText}
      />
    </Wrapper>
  );
};

DataFetchingTableComponent.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  confirmActionMessage: PropTypes.string,
  errorMessage: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  expansionTabs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      endpoint: PropTypes.string,
      columns: PropTypes.array,
      expansionTabs: PropTypes.array, // For nested expansions, uses same shape.
    }),
  ),
  expansions: PropTypes.object.isRequired,
  filters: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isFetchingData: PropTypes.bool.isRequired,
  isChangingDataOnServer: PropTypes.bool.isRequired,
  numberOfPages: PropTypes.number,
  TableComponent: PropTypes.elementType,
  onCancelAction: PropTypes.func.isRequired,
  onConfirmAction: PropTypes.func.isRequired,
  onExpandedChange: PropTypes.func.isRequired,
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
  expansionTabStates: PropTypes.object.isRequired,
  onExpandedTabChange: PropTypes.func.isRequired,
  nestingLevel: PropTypes.number,
  deleteConfig: PropTypes.object,
  actionColumns: PropTypes.arrayOf(PropTypes.shape({})),
  totalRecords: PropTypes.number,
};

DataFetchingTableComponent.defaultProps = {
  confirmActionMessage: null,
  expansionTabs: null,
  data: [],
  errorMessage: '',
  numberOfPages: 0,
  nestingLevel: 0,
  deleteConfig: {},
  TableComponent: undefined,
  actionColumns: [],
  totalRecords: 0,
};

const mapStateToProps = (state, { columns, reduxId }) => ({
  isFetchingData: getIsFetchingData(state, reduxId),
  columns: columns.map(originalColumn => formatColumnForReactTable(originalColumn, reduxId)),
  isChangingDataOnServer: getIsChangingDataOnServer(state),
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
  onExpandedChange: newExpansions => dispatch(changeExpansions(reduxId, newExpansions)),
  onExpandedTabChange: (rowId, tabValue) => dispatch(changeExpansionsTab(reduxId, rowId, tabValue)),
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
    ...generateConfigForColumnType(type, actionConfig, reduxId), // Add custom Cell/width/etc.
    ...restOfColumn,
    disableSortBy: !source, // disable action columns from being sortable
    filterable: filterable !== false && !!source,
  };
};

export const DataFetchingTableNew = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(DataFetchingTableComponent);
