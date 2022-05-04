/**
 * Tupaia MediTrak
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { LOGOUT } from '../authentication';
import { createReducer } from '../utilities';
import {
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_REQUEST_FAILURE,
  DELETE_ACCOUNT_REQUEST_SUCCESS,
} from './constants';

const defaultState = {
  isLoading: false,
  isRequestSent: false,
};

const stateChanges = {
  [DELETE_ACCOUNT_REQUEST]: () => ({
    isLoading: true,
  }),
  [DELETE_ACCOUNT_REQUEST_SUCCESS]: () => ({ isLoading: false, isRequestSent: true }),
  [DELETE_ACCOUNT_REQUEST_FAILURE]: () => defaultState,
  [LOGOUT]: () => defaultState,
};

export const reducer = createReducer(defaultState, stateChanges);
