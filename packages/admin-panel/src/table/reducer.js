import { createNestedReducer } from '../utilities';
import {
  ACTION_REQUEST,
  ACTION_CANCEL,
  ACTION_CONFIRM,
  DATA_FETCH_REQUEST,
  DATA_FETCH_SUCCESS,
  DATA_FETCH_ERROR,
  DATA_CHANGE_SUCCESS,
  DATA_CHANGE_ERROR,
  PAGE_INDEX_CHANGE,
  PAGE_SIZE_CHANGE,
  SORTING_CHANGE,
  DATA_CHANGE_REQUEST,
  DEFAULT_TABLE_STATE,
  CLEAR_ERROR,
} from './constants';
import { getFetchId } from './selectors';

const handleErrorMessage = (payload, currentState) => {
  const currentFetchId = getFetchId(currentState);
  if (payload.fetchId !== currentFetchId) return {};
  return {
    ...payload,
    fetchId: DEFAULT_TABLE_STATE.fetchId,
  };
};

const handleDataFetchSuccess = (payload, currentState) => {
  const currentFetchId = getFetchId(currentState);
  if (payload.fetchId !== currentFetchId) return {}; // From a previous fetch request, ignore it
  return {
    ...payload,
    errorMessage: DEFAULT_TABLE_STATE.errorMessage,
    fetchId: DEFAULT_TABLE_STATE.fetchId,
    confirmActionMessage: DEFAULT_TABLE_STATE.confirmActionMessage,
  };
};

const stateChanges = {
  [ACTION_REQUEST]: ({ confirmMessage, actionCreator }) => ({
    confirmActionMessage: confirmMessage,
    pendingActionCreator: actionCreator,
  }),
  [ACTION_CANCEL]: () => ({
    confirmActionMessage: DEFAULT_TABLE_STATE.confirmActionMessage,
    pendingActionCreator: DEFAULT_TABLE_STATE.pendingActionCreator,
  }),
  [ACTION_CONFIRM]: () => ({
    confirmActionMessage: DEFAULT_TABLE_STATE.confirmActionMessage,
    pendingActionCreator: DEFAULT_TABLE_STATE.pendingActionCreator,
  }),
  [DATA_FETCH_REQUEST]: ({ fetchId }) => ({
    fetchId,
    errorMessage: DEFAULT_TABLE_STATE.errorMessage,
  }),
  [DATA_FETCH_SUCCESS]: handleDataFetchSuccess,
  [DATA_FETCH_ERROR]: handleErrorMessage,
  [DATA_CHANGE_REQUEST]: ({ fetchId }) => ({
    fetchId,
    errorMessage: DEFAULT_TABLE_STATE.errorMessage,
  }),
  [DATA_CHANGE_SUCCESS]: handleDataFetchSuccess,
  [DATA_CHANGE_ERROR]: handleErrorMessage,
  [PAGE_INDEX_CHANGE]: payload => payload,
  [PAGE_SIZE_CHANGE]: payload => ({
    ...payload,
  }),

  [SORTING_CHANGE]: payload => ({
    ...payload,
    pageIndex: 0,
  }),
  [CLEAR_ERROR]: () => ({
    errorMessage: DEFAULT_TABLE_STATE.errorMessage,
  }),
};

export const reducer = createNestedReducer(DEFAULT_TABLE_STATE, stateChanges);
