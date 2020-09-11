/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import parseLinkHeader from 'parse-link-header';
import generateId from 'uuid/v1';

import {
  ACTION_CANCEL,
  ACTION_CONFIRM,
  ACTION_REQUEST,
  COLUMNS_RESIZE,
  DATA_CHANGE_ERROR,
  DATA_CHANGE_REQUEST,
  DATA_CHANGE_SUCCESS,
  DATA_FETCH_ERROR,
  DATA_FETCH_REQUEST,
  DATA_FETCH_SUCCESS,
  EXPANSIONS_CHANGE,
  EXPANSIONS_TAB_CHANGE,
  FILTERS_CHANGE,
  PAGE_INDEX_CHANGE,
  PAGE_SIZE_CHANGE,
  SORTING_CHANGE,
} from './constants';
import { getTableState } from './selectors';
import { convertSearchTermToFilter } from '../utilities';

export const changePage = (reduxId, pageIndex) => ({
  type: PAGE_INDEX_CHANGE,
  pageIndex,
  reduxId,
});

export const changePageSize = (reduxId, pageSize, pageIndex) => ({
  type: PAGE_SIZE_CHANGE,
  pageSize,
  pageIndex,
  reduxId,
});

export const changeExpansions = (reduxId, expansions) => ({
  type: EXPANSIONS_CHANGE,
  expansions,
  reduxId,
});

export const changeExpansionsTab = (reduxId, rowId, tabValue) => ({
  type: EXPANSIONS_TAB_CHANGE,
  reduxId,
  rowId,
  tabValue,
});

export const changeFilters = (reduxId, filters) => ({
  type: FILTERS_CHANGE,
  filters,
  reduxId,
});

export const changeResizedColumns = (reduxId, resizedColumns) => ({
  type: COLUMNS_RESIZE,
  resizedColumns,
  reduxId,
});

export const changeSorting = (reduxId, sorting) => ({
  type: SORTING_CHANGE,
  sorting,
  reduxId,
});

export const refreshData = (reduxId, endpoint, columns, baseFilter, tableState) => async (
  dispatch,
  getState,
  { api },
) => {
  const { pageIndex, pageSize, filters, sorting } = tableState;

  // Set up filter
  const filterObject = { ...baseFilter };
  filters.forEach(({ id, value }) => {
    filterObject[id] = value;
  });
  const filterString = JSON.stringify(convertSearchTermToFilter(filterObject));

  // Set up sort
  const sortObjects = sorting.map(({ id, desc }) => {
    return `${id}${desc ? ' DESC' : ' ASC'}`;
  });
  const sortString = JSON.stringify(sortObjects);

  // Set up columns
  const columnSources = columns.map(column => column.source);
  const columnsString = JSON.stringify(columnSources);

  // Prepare for request
  const fetchId = generateId();
  dispatch({
    type: DATA_FETCH_REQUEST,
    reduxId,
    fetchId,
  });

  try {
    const queryParameters = {
      page: pageIndex,
      pageSize,
      columns: columnsString.length > 0 ? columnsString : undefined,
      filter: filterString.length > 0 ? filterString : undefined,
      sort: sortString.length > 0 ? sortString : undefined,
    };
    const response = await api.get(endpoint, queryParameters);
    const linkHeader = parseLinkHeader(response.headers.get('Link'));
    const lastPageNumber = parseInt(linkHeader.last.page, 10);
    dispatch({
      type: DATA_FETCH_SUCCESS,
      reduxId,
      data: response.body,
      numberOfPages: lastPageNumber,
      fetchId,
    });
  } catch (error) {
    dispatch({
      type: DATA_FETCH_ERROR,
      reduxId,
      errorMessage: error.message,
      fetchId,
    });
  }
};

export const cancelAction = reduxId => ({
  type: ACTION_CANCEL,
  reduxId,
});

export const confirmAction = reduxId => (dispatch, getState) => {
  const { pendingActionCreator } = getTableState(getState(), reduxId);
  dispatch(pendingActionCreator());
  dispatch({
    type: ACTION_CONFIRM,
    reduxId,
  });
};

export const requestDeleteRecord = (reduxId, endpoint, id) => ({
  type: ACTION_REQUEST,
  reduxId,
  confirmMessage: 'Are you sure you want to delete this record?',
  actionCreator: () => deleteRecordFromTable(reduxId, endpoint, id),
});

export const deleteRecordFromTable = (reduxId, endpoint, id) => async (
  dispatch,
  getState,
  { api },
) => {
  const fetchId = generateId();
  dispatch({
    type: DATA_CHANGE_REQUEST,
    fetchId,
    reduxId,
  });
  try {
    await api.delete(`${endpoint}/${id}`);
    dispatch({
      type: DATA_CHANGE_SUCCESS,
      fetchId,
      reduxId,
    });
  } catch (error) {
    dispatch({
      type: DATA_CHANGE_ERROR,
      reduxId,
      fetchId,
      errorMessage: error.message,
    });
  }
};
