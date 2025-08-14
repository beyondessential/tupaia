// Actions
export const ACTION_REQUEST = 'ACTION_REQUEST';
export const ACTION_CANCEL = 'ACTION_CANCEL';
export const ACTION_CONFIRM = 'ACTION_CONFIRM';
export const DATA_FETCH_REQUEST = 'DATA_FETCH_REQUEST';
export const DATA_FETCH_SUCCESS = 'DATA_FETCH_SUCCESS';
export const DATA_FETCH_ERROR = 'DATA_FETCH_ERROR';
export const DATA_CHANGE_REQUEST = 'DATA_CHANGE_REQUEST';
export const DATA_CHANGE_SUCCESS = 'DATA_CHANGE_SUCCESS';
export const DATA_CHANGE_ERROR = 'DATA_CHANGE_ERROR';
export const PAGE_INDEX_CHANGE = 'PAGE_INDEX_CHANGE';
export const PAGE_SIZE_CHANGE = 'PAGE_SIZE_CHANGE';
export const SORTING_CHANGE = 'SORTING_CHANGE';
export const CLEAR_ERROR = 'CLEAR_ERROR';

export const DATA_CHANGE_ACTIONS = {
  start: DATA_CHANGE_REQUEST,
  finish: DATA_CHANGE_SUCCESS,
  error: DATA_CHANGE_ERROR,
};

// Default State
export const DEFAULT_TABLE_STATE = {
  confirmActionMessage: null,
  pendingActionCreator: () => {},
  numberOfPages: 0,
  data: [],
  errorMessage: '',
  fetchId: null,
  pageIndex: 0,
  pageSize: 20,
  sorting: null,
};
