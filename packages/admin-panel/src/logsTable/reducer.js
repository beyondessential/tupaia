/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  LOGS_DATA_FETCH_BEGIN,
  LOGS_DATA_FETCH_SUCCESS,
  LOGS_DISMISS,
  LOGS_ERROR,
  LOGS_OPEN,
} from './constants';

const defaultState = {
  errorMessage: '',
  isLoading: false,
  isOpen: false,
  logs: [],
  logCount: null,
  page: 0,
  logsPerPage: 10,
  recordId: null,
  recordData: null,
};

const stateChanges = {
  [LOGS_DATA_FETCH_BEGIN]: payload => ({
    isLoading: true,
    ...payload,
  }),
  [LOGS_DATA_FETCH_SUCCESS]: payload => {
    const { data, ...restOfPayload } = payload;
    return { isLoading: false, ...data, ...restOfPayload };
  },
  [LOGS_DISMISS]: () => ({
    ...defaultState,
  }),
  [LOGS_ERROR]: (payload, { errorMessage }) => {
    if (errorMessage) {
      return { errorMessage: defaultState.errorMessage }; // If there is an error, dismiss it
    }
    return defaultState; // If no error, dismiss the whole modal and clear its state
  },
  [LOGS_OPEN]: payload => ({ ...payload, isOpen: true }),
};

export const reducer = createReducer(defaultState, stateChanges);
