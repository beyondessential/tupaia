/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import React, { memo, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { Typography } from '@material-ui/core';
import queryString from 'query-string';
import PropTypes from 'prop-types';
import { Alert, FilterableTable } from '@tupaia/ui-components';
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
  clearError,
  confirmAction,
  refreshData,
} from '../actions';
import { ConfirmDeleteModal } from '../../widgets';
import { FilterCell } from './FilterCell';
import { DisplayCell } from './Cells';

const ErrorAlert = styled(Alert).attrs({
  severity: 'error',
})`
  margin: 0.5rem;
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

const ButtonCell = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SingleButtonWrapper = styled.div`
  width: ${({ $width }) => $width}px;
`;

const formatColumnForReactTable = (originalColumn, reduxId) => {
  const { source, type, actionConfig, filterable, ...restOfColumn } = originalColumn;
  const id = source || type;
  return {
    id,
    accessor: id?.includes('.') ? originalRow => originalRow[source] : id, // react-table doesn't like .'s
    actionConfig,
    reduxId,
    type,
    disableSortBy: !source, // disable action columns from being sortable
    filterable: filterable !== false,
    ...generateConfigForColumnType(type, actionConfig, reduxId), // Add custom Cell/width/etc.
    ...restOfColumn,
  };
};

const DataFetchingTableComponent = memo(
  ({
    columns,
    data = [],
    numberOfPages,
    pageSize,
    pageIndex = 0,
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
    actionLabel = 'Action',
  }) => {
    const formattedColumns = useMemo(() => {
      const cols = columns.map(column => formatColumnForReactTable(column));
      // for the columns that are not buttons, display them using a custom wrapper
      const nonButtonColumns = cols
        .filter(col => !col.isButtonColumn)
        .map(col => ({
          ...col,
          // eslint-disable-next-line react/prop-types
          Cell: ({ value, ...props }) => (
            <DisplayCell
              {...props}
              isButtonColumn={col.isButtonColumn}
              detailUrl={col.isButtonColumn ? '' : detailUrl}
              getHasNestedView={getHasNestedView}
              getNestedViewLink={getNestedViewLink}
              basePath={basePath}
            >
              {/** Columns can have custom Cells. If they do, render these, otherwise render the value */}
              {col.Cell ? col.Cell({ value, ...props }) : value}
            </DisplayCell>
          ),
        }));
      const buttonColumns = cols.filter(col => col.isButtonColumn);
      if (!buttonColumns.length) return nonButtonColumns;

      // Group all button columns into a single column so they can be displayed together under a single header
      const singleButtonColumn = {
        Header: actionLabel,
        width: buttonColumns.reduce((acc, { width }) => acc + (width || 60), 0),
        // eslint-disable-next-line react/prop-types
        Cell: ({ row }) => {
          return (
            <ButtonCell>
              {buttonColumns.map(({ Cell, accessor, ...col }) => {
                return (
                  <SingleButtonWrapper $width={col.width}>
                    <Cell key={`${col.id}`} {...col} row={row} />
                  </SingleButtonWrapper>
                );
              })}
            </ButtonCell>
          );
        },
      };
      return [...nonButtonColumns, singleButtonColumn];
    }, [JSON.stringify(columns)]);

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
    }, [endpoint, JSON.stringify(baseFilter)]);

    useEffect(() => {
      onRefreshData();
    }, [filters, pageIndex, pageSize, JSON.stringify(sorting)]);

    const isLoading = isFetchingData || isChangingDataOnServer;

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

        <FilterableTable
          columns={formattedColumns}
          data={data}
          isLoading={isChangingDataOnServer}
          pageIndex={pageIndex}
          pageSize={pageSize}
          sorting={sorting}
          numberOfPages={numberOfPages}
          onChangeFilters={onFilteredChange}
          filters={filters}
          hiddenColumns={columns
            .filter(column => column.show === false)
            .map(column => column.source ?? column.type)}
          onChangePage={onPageChange}
          onChangePageSize={onPageSizeChange}
          onChangeSorting={onSortedChange}
          refreshData={onRefreshData}
          errorMessage={errorMessage}
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
  },
);

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
  actionLabel: PropTypes.string,
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
  actionLabel: 'Action',
};

const mapStateToProps = (state, { reduxId, ...ownProps }) => ({
  isFetchingData: getIsFetchingData(state, reduxId),
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
    dispatch(clearError());
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

export const DataFetchingTable = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(DataFetchingTableComponent);
