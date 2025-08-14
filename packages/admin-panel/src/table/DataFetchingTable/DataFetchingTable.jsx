import { Typography } from '@material-ui/core';
import PropTypes from 'prop-types';
import React, { memo, useEffect, useMemo } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { Alert, FilterableTable, FilterableTableCellContent } from '@tupaia/ui-components';

import { getIsChangingDataOnServer } from '../../dataChangeListener';
import { getEditorState } from '../../editor/selectors';
import { ConfirmDeleteModal } from '../../widgets';
import {
  cancelAction,
  changePage,
  changePageSize,
  changeSorting,
  confirmAction,
  refreshData,
} from '../actions';
import { generateConfigForColumnType } from '../columnTypes';
import { getIsFetchingData, getTableState } from '../selectors';
import { DisplayCell } from './Cells';
import { useColumnFilters } from './useColumnFilters';

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
  inset: 0;
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
  ${FilterableTableCellContent}:has(&) {
    padding-block: 0;
    padding-inline-end: 0;
  }
`;

const formatColumnForReactTable = originalColumn => {
  const { source, type, actionConfig, filterable, ...restOfColumn } = originalColumn;
  const id = source || type;
  return {
    id,
    accessor: id?.includes('.') ? originalRow => originalRow[source] : id, // react-table doesn't like .'s
    actionConfig,
    type,
    disableSortBy: !source, // disable action columns from being sortable
    filterable: filterable !== false,
    ...generateConfigForColumnType(type, actionConfig), // Add custom Cell/width/etc.
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
    sorting,
    isChangingDataOnServer,
    errorMessage,
    onRefreshData,
    confirmActionMessage,
    onConfirmAction,
    onCancelAction,
    deleteConfig,
    totalRecords,
    isFetchingData,
    onSortedChange,
    detailUrl,
    getHasNestedView,
    getNestedViewLink,
    basePath,
    resourceName,
    actionLabel,
    defaultFilters,
    editorState,
    defaultSorting,
  }) => {
    const formattedColumns = useMemo(() => {
      const cols = columns.map(formatColumnForReactTable);
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

      const buttonWidths =
        buttonColumns.length === 1
          ? 120
          : buttonColumns.reduce((acc, { width }) => acc + (width || 60), 0);
      // Group all button columns into a single column so they can be displayed together under a single header
      const singleButtonColumn = {
        Header: actionLabel || 'Action',
        maxWidth: buttonWidths,
        width: buttonWidths,
        disableSortBy: true,
        // eslint-disable-next-line react/prop-types
        Cell: ({ row }) => {
          return (
            <ButtonCell>
              {buttonColumns.map(({ Cell, accessor, ...col }) => {
                return (
                  <SingleButtonWrapper key={col.id} style={{ width: col.width }}>
                    <Cell {...col} row={row} />
                  </SingleButtonWrapper>
                );
              })}
            </ButtonCell>
          );
        },
      };

      return [...nonButtonColumns, singleButtonColumn];
    }, [JSON.stringify(columns)]);

    const getSortingToUse = () => {
      // If there is no sorting, return the default sorting, if it exists, otherwise return an empty array
      if (!sorting) return defaultSorting ?? [];
      return sorting;
    };

    const sortingToUse = getSortingToUse();

    // Listen for changes in filters in the URL and refresh the data accordingly
    const { filters, onChangeFilters } = useColumnFilters(defaultFilters);

    useEffect(() => {
      // if the page index is already 0, we can just refresh the data
      if (pageIndex === 0) {
        onRefreshData(filters, sortingToUse, pageIndex, pageSize);
        // if the page index is not 0, we need to reset it to 0, which will trigger a refresh
      } else onPageChange(0);
    }, [JSON.stringify(filters), JSON.stringify(sortingToUse)]);

    useEffect(() => {
      onRefreshData(filters, sortingToUse, pageIndex, pageSize);
    }, [pageSize, pageIndex]);

    // when a delete is successful, the confirmActionMessage will be set to null. Refresh the data here
    useEffect(() => {
      // Don't refresh data if there is a confirmActionMessage or errorMessage, or if data is being changed on the server
      if (confirmActionMessage || errorMessage || isChangingDataOnServer) return;

      onRefreshData(filters, sortingToUse, pageIndex, pageSize);
    }, [confirmActionMessage, errorMessage, isChangingDataOnServer]);

    useEffect(() => {
      if (editorState?.isOpen) return;
      onRefreshData(filters, sortingToUse, pageIndex, pageSize);
    }, [editorState?.isOpen]);

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

        <FilterableTable
          columns={formattedColumns}
          data={data}
          filters={filters}
          noDataMessage="No data to display"
          pageIndex={pageIndex}
          pageSize={pageSize}
          sorting={sortingToUse}
          numberOfPages={numberOfPages}
          onChangeFilters={onChangeFilters}
          isLoading={isLoading}
          hiddenColumns={columns
            .filter(column => column.show === false)
            .map(column => column.source ?? column.type)}
          onChangePage={onPageChange}
          onChangePageSize={onPageSizeChange}
          onChangeSorting={onSortedChange}
          totalRecords={totalRecords}
        />

        <ConfirmDeleteModal
          isOpen={!!confirmActionMessage}
          onConfirm={onConfirmAction}
          onCancel={onCancelAction}
          title={deleteConfig?.title || `Delete ${singular}`}
          heading={deleteConfig?.heading ?? `You are about to delete this ${singular}`}
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
  isFetchingData: PropTypes.bool.isRequired,
  isChangingDataOnServer: PropTypes.bool.isRequired,
  numberOfPages: PropTypes.number,
  onCancelAction: PropTypes.func.isRequired,
  onConfirmAction: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  onRefreshData: PropTypes.func.isRequired,
  onSortedChange: PropTypes.func.isRequired,
  pageIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  sorting: PropTypes.array.isRequired,
  deleteConfig: PropTypes.object,
  totalRecords: PropTypes.number,
  detailUrl: PropTypes.string,
  getHasNestedView: PropTypes.func,
  getNestedViewLink: PropTypes.func,
  basePath: PropTypes.string,
  resourceName: PropTypes.object,
  actionLabel: PropTypes.string,
  defaultFilters: PropTypes.array,
  editorState: PropTypes.object,
  defaultSorting: PropTypes.array,
};

DataFetchingTableComponent.defaultProps = {
  confirmActionMessage: null,
  data: [],
  errorMessage: '',
  numberOfPages: 0,
  deleteConfig: {},
  totalRecords: 0,
  detailUrl: '',
  getHasNestedView: null,
  getNestedViewLink: null,
  basePath: '',
  resourceName: {},
  actionLabel: 'Action',
  defaultFilters: [],
  editorState: {},
  defaultSorting: [],
};

const mapStateToProps = (state, { reduxId, ...ownProps }) => ({
  isFetchingData: getIsFetchingData(state, reduxId),
  isChangingDataOnServer: getIsChangingDataOnServer(state),
  ...ownProps,
  ...getTableState(state, reduxId),
  editorState: getEditorState(state),
});

const mapDispatchToProps = (dispatch, { reduxId }) => ({
  dispatch,
  onCancelAction: () => dispatch(cancelAction(reduxId)),
  onConfirmAction: () => dispatch(confirmAction(reduxId)),
  onPageChange: newPageIndex => dispatch(changePage(reduxId, newPageIndex)),
  onPageSizeChange: (newPageSize, newPageIndex) =>
    dispatch(changePageSize(reduxId, newPageSize, newPageIndex)),
  onSortedChange: newSorting => dispatch(changeSorting(reduxId, newSorting)),
});

const mergeProps = (stateProps, { dispatch, ...dispatchProps }, ownProps) => {
  const { baseFilter = {}, endpoint, columns, reduxId, ...restOfOwnProps } = ownProps;
  const onRefreshData = (filters, sorting, pageIndex, pageSize) =>
    dispatch(
      refreshData(reduxId, endpoint, columns, baseFilter, filters, sorting, {
        ...stateProps,
        pageIndex,
        pageSize,
      }),
    );

  return {
    reduxId,
    ...restOfOwnProps,
    ...stateProps,
    ...dispatchProps,
    onRefreshData,
  };
};

export const DataFetchingTable = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(DataFetchingTableComponent);
