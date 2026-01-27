import { debounce } from 'es-toolkit/compat';
import parseLinkHeader from 'parse-link-header';
import generateId from 'uuid/v1';

import { convertSearchTermToFilter } from '../utilities';
import {
  ACTION_CANCEL,
  ACTION_CONFIRM,
  ACTION_REQUEST,
  CLEAR_ERROR,
  DATA_CHANGE_ERROR,
  DATA_CHANGE_REQUEST,
  DATA_CHANGE_SUCCESS,
  DATA_FETCH_ERROR,
  DATA_FETCH_REQUEST,
  DATA_FETCH_SUCCESS,
  PAGE_INDEX_CHANGE,
  PAGE_SIZE_CHANGE,
  SORTING_CHANGE,
} from './constants';
import { getTableState } from './selectors';

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

export const changeSorting = (reduxId, sorting) => ({
  type: SORTING_CHANGE,
  sorting,
  reduxId,
});

const parseIntOrInfinity = val => {
  if (typeof val === 'number' && Number.isFinite(val)) return val;

  const naive = Number.parseInt(val, 10);
  return Number.isNaN(naive) || !Number.isFinite(naive) ? Number.POSITIVE_INFINITY : naive;
};

const refreshDataWithDebounce = debounce(
  async (
    reduxId,
    endpoint,
    columns,
    baseFilter,
    filters = [],
    sorting = [],
    tableState,
    dispatch,
    api,
  ) => {
    const { pageIndex, pageSize } = tableState;

    // Set up filter
    const filterObject = { ...baseFilter };
    filters.forEach(({ id, value }) => {
      if (Array.isArray(value)) {
        filterObject[id] = {
          comparator: '@>',
          comparisonValue: `{${value.join(',')}}`,
          castAs: 'text[]',
        };
      } else filterObject[id] = value;
    });
    const filterString = JSON.stringify(convertSearchTermToFilter(filterObject));

    // Set up sort
    const sortObjects = sorting.map(({ id, desc }) => {
      return `${id}${desc ? ' DESC' : ' ASC'}`;
    });
    const sortString = JSON.stringify(sortObjects);

    // Set up columns
    const columnSources = columns
      .filter(column => Boolean(column.source))
      .map(column => column.source);
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

      const totalRecords = parseIntOrInfinity(response.headers.get('X-Total-Count'));

      const linkHeader = parseLinkHeader(response.headers.get('Link'));
      const lastPageNumber = parseIntOrInfinity(linkHeader?.last?.page);

      dispatch({
        type: DATA_FETCH_SUCCESS,
        reduxId,
        data: response.body,
        numberOfPages: lastPageNumber,
        fetchId,
        totalRecords,
        pageIndex,
        pageSize,
      });
    } catch (error) {
      dispatch({
        type: DATA_FETCH_ERROR,
        reduxId,
        errorMessage: error.message,
        fetchId,
        pageIndex,
        pageSize,
      });
    }
  },
  200,
);

export const refreshData =
  (reduxId, endpoint, columns, baseFilter, filters, sorting, tableState) =>
  async (dispatch, getState, { api }) => {
    return refreshDataWithDebounce(
      reduxId,
      endpoint,
      columns,
      baseFilter,
      filters,
      sorting,
      tableState,
      dispatch,
      api,
    );
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

export const requestDeleteRecord = (reduxId, endpoint, id, confirmMessage) => ({
  type: ACTION_REQUEST,
  reduxId,
  confirmMessage: confirmMessage || 'Are you sure you want to delete this record?',
  actionCreator: () => deleteRecordFromTable(reduxId, endpoint, id),
});

export const requestArchiveSurveyResponse = (reduxId, endpoint, id, confirmMessage) => ({
  type: ACTION_REQUEST,
  reduxId,
  confirmMessage: confirmMessage || 'Are you sure you want to archive this record?',
  actionCreator: () => archiveSurveyResponse(reduxId, endpoint, id),
});

export const deleteRecordFromTable =
  (reduxId, endpoint, id) =>
  async (dispatch, getState, { api }) => {
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
        confirmActionMessage: '',
      });
    }
  };

export const clearError = () => ({
  type: CLEAR_ERROR,
});

export const archiveSurveyResponse =
  (reduxId, endpoint, id) =>
  async (dispatch, getState, { api }) => {
    const fetchId = generateId();
    dispatch({
      type: DATA_CHANGE_REQUEST,
      fetchId,
      reduxId,
    });
    try {
      await api.put(`${endpoint}/${id}`, null, {
        outdated: true,
      });
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
        confirmActionMessage: '',
      });
    }
  };
