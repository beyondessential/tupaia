/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { createReducer } from '../utils/createReducer';
import {
  EMAIL_ADDRESS_CHANGE,
  PASSWORD_CHANGE,
  LOGIN_MODAL_TOGGLE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
} from './constants';

const defaultState = {
  emailAddress: '',
  password: '',
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoggingIn: false,
  errorMessage: null,
};

const logoutStateUpdater = (payload, currentState) => ({
  ...defaultState, // Clear all authentication details
  ...payload, // Add any details from the payload
  emailAddress: currentState.emailAddress, // But, remember user's email address
});

const stateChanges = {
  [LOGIN_MODAL_TOGGLE]: payload => payload,
  [EMAIL_ADDRESS_CHANGE]: payload => payload,
  [PASSWORD_CHANGE]: payload => payload,
  [LOGIN_SUCCESS]: (payload, currentState) => ({
    ...defaultState,
    ...payload,
    emailAddress: currentState.emailAddress,
  }),
  [LOGIN_REQUEST]: () => ({ isLoggingIn: true }),
  [LOGIN_ERROR]: logoutStateUpdater,
  [LOGOUT]: logoutStateUpdater,
};

export const reducer = createReducer(defaultState, stateChanges);
