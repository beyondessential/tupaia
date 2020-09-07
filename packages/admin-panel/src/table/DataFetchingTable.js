/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { SmallAlert } from '@tupaia/ui-components';
import styled from 'styled-components';
import { IndeterminateCheckBox, AddBox } from '@material-ui/icons';
import { Tabs, ConfirmDeleteModal } from '../widgets';
import { TableHeadCell } from './TableHeadCell';
import { ColumnFilter } from './ColumnFilter';
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
} from './actions';
import { getTableState, getIsFetchingData } from './selectors';
import { generateConfigForColumnType } from './columnTypes';
import { getIsChangingDataOnServer } from '../dataChangeListener';
import { makeSubstitutionsInString } from '../utilities';
import { customPagination } from './customPagination';
import { ExpansionContainer } from './ExpansionContainer';
import { StyledReactTable } from './StyledReactTable';

const StyledAlert = styled(SmallAlert)`
  margin-top: 30px;
`;

const IndeterminateCheckboxIcon = styled(IndeterminateCheckBox)`
  transition: color 0.2s ease;

  &:hover {
    color: ${props => props.theme.palette.primary.main};
  }
`;

class DataFetchingTableComponent extends React.Component {
  componentWillMount() {
    this.props.onRefreshData();
  }

  componentWillReceiveProps(nextProps) {
    const propsCausingDataRefresh = ['filters', 'pageIndex', 'pageSize', 'sorting'];
    if (
      propsCausingDataRefresh.some(propKey => this.props[propKey] !== nextProps[propKey]) ||
      (this.props.isChangingDataOnServer &&
        !nextProps.isChangingDataOnServer &&
        !nextProps.errorMessage)
    ) {
      nextProps.onRefreshData();
    }
  }

  renderConfirmModal() {
    const { confirmActionMessage, onConfirmAction, onCancelAction } = this.props;
    return (
      <ConfirmDeleteModal
        message={confirmActionMessage}
        onConfirm={onConfirmAction}
        onCancel={onCancelAction}
      />
    );
  }

  renderReactTable() {
    const {
      reduxId,
      columns,
      data,
      expansionTabs,
      isFetchingData,
      isChangingDataOnServer,
      numberOfPages,
      onPageChange,
      onPageSizeChange,
      onSortedChange,
      onExpandedChange,
      onFilteredChange,
      onResizedChange,
      pageIndex,
      pageSize,
      sorting,
      expansions,
      filters,
      resizedColumns,
      expansionTabStates,
      onExpandedTabChange,
    } = this.props;

    return (
      <StyledReactTable
        columns={columns}
        data={data}
        manual
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onSortedChange={onSortedChange}
        onExpandedChange={onExpandedChange}
        onFilteredChange={onFilteredChange}
        onResizedChange={onResizedChange}
        page={pageIndex}
        pageSize={pageSize}
        sorted={sorting}
        expanded={expansions}
        filtered={filters}
        resized={resizedColumns}
        pages={numberOfPages}
        loading={isFetchingData || isChangingDataOnServer}
        filterable
        freezeWhenExpanded
        FilterComponent={ColumnFilter}
        ThComponent={TableHeadCell}
        ExpanderComponent={({ isExpanded }) =>
          isExpanded ? <AddBox color="primary" /> : <IndeterminateCheckboxIcon />
        }
        getPaginationProps={customPagination}
        SubComponent={
          expansionTabs &&
          (({ original: rowData, index }) => {
            // eslint-disable-line react/prop-types
            const { id } = rowData;
            const expansionTab = expansionTabStates[id] || 0;
            const expansionItem = expansionTabs[expansionTab];
            const { title, endpoint, ...restOfProps } = expansionItem;
            // Each table needs a unique id so that we can keep track of state separately in redux
            return (
              <ExpansionContainer>
                <Tabs
                  tabs={expansionTabs.map(({ title: tabTitle }, tabIndex) => ({
                    label: tabTitle,
                    value: tabIndex,
                  }))}
                  activeValue={expansionTab}
                  onSelectTab={tabValue => onExpandedTabChange(id, tabValue)}
                />
                <DataFetchingTable
                  reduxId={`${reduxId}_${index}_${expansionTab}`}
                  endpoint={makeSubstitutionsInString(endpoint, rowData)}
                  key={expansionTab} // Triggers refresh of data.
                  {...restOfProps}
                />
              </ExpansionContainer>
            );
          })
        }
      />
    );
  }

  render() {
    const { errorMessage } = this.props;
    return (
      <>
        {errorMessage && (
          <StyledAlert severity="error" variant="standard">
            {errorMessage}
          </StyledAlert>
        )}
        {this.renderReactTable()}
        {this.renderConfirmModal()}
      </>
    );
  }
}

DataFetchingTableComponent.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  confirmActionMessage: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.shape({})),
  errorMessage: PropTypes.string,
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
  onCancelAction: PropTypes.func.isRequired,
  onConfirmAction: PropTypes.func.isRequired,
  onExpandedChange: PropTypes.func.isRequired,
  onFilteredChange: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onPageSizeChange: PropTypes.func.isRequired,
  onRefreshData: PropTypes.func.isRequired,
  onResizedChange: PropTypes.func.isRequired,
  onSortedChange: PropTypes.func.isRequired,
  pageIndex: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  reduxId: PropTypes.string.isRequired,
  resizedColumns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  sorting: PropTypes.array.isRequired,
  expansionTabStates: PropTypes.object.isRequired,
  onExpandedTabChange: PropTypes.func.isRequired,
};

DataFetchingTableComponent.defaultProps = {
  confirmActionMessage: null,
  expansionTabs: null,
  data: [],
  errorMessage: '',
  numberOfPages: 0,
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
  const { baseFilter = {}, endpoint, columns, reduxId, ...restOfOwnProps } = ownProps;
  return {
    reduxId,
    ...restOfOwnProps,
    ...stateProps,
    ...dispatchProps,
    onRefreshData: () => dispatch(refreshData(reduxId, endpoint, columns, baseFilter, stateProps)),
  };
};

const formatColumnForReactTable = (originalColumn, reduxId) => {
  const { source, type, actionConfig, ...restOfColumn } = originalColumn;
  return {
    id: source,
    accessor: source.includes('.') ? row => row[source] : source, // react-table doesn't like .'s
    ...generateConfigForColumnType(type, actionConfig, reduxId), // Add custom Cell/width/etc.
    ...restOfColumn,
  };
};

export const DataFetchingTable = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
)(DataFetchingTableComponent);
