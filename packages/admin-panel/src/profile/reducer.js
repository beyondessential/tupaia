/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utilities';
import {
  PROFILE_FIELD_CHANGE,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_ERROR,
} from './contants';

const defaultState = {
  firstName: '',
  lastName: '',
  role: '',
  employer: '',
  errorMessage: null,
};

const stateChanges = {
  [PROFILE_FIELD_CHANGE]: ({ key, value }) => ({
    [key]: value,
  }),
  [PROFILE_UPDATE_SUCCESS]: (payload, currentState) => ({
    ...defaultState,
    ...payload,
    rememberMe: currentState.rememberMe,
    emailAddress: currentState.emailAddress,
    password: currentState.password,
  }),
  [PROFILE_UPDATE_REQUEST]: () => ({ isLoggingIn: true }),
  [PROFILE_UPDATE_ERROR]: payload => ({ errorMessage: payload }),
};

export const reducer = createReducer(defaultState, stateChanges);
