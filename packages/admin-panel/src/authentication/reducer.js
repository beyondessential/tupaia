/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { createTransform } from 'redux-persist';
import { createReducer } from '../utilities';
import {
  EMAIL_ADDRESS_CHANGE,
  PASSWORD_CHANGE,
  LOGIN_MODAL_TOGGLE,
  REMEMBER_ME_CHANGE,
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
  rememberMe: false,
  errorMessage: null,
};

export const RememberMeTransform = createTransform(
  // transform state on its way to being serialized and persisted.
  inboundState => (inboundState.rememberMe ? inboundState : defaultState),
  // transform state being rehydrated
  outboundState => outboundState,
  // define which reducers this transform gets called for.
  { whitelist: ['authentication'] },
);

const logoutStateUpdater = (payload, currentState) => ({
  ...defaultState, // Clear all authentication details
  ...payload, // Add any details from the payload
  emailAddress: currentState.emailAddress, // But, remember user's email address
});

const stateChanges = {
  [LOGIN_MODAL_TOGGLE]: payload => payload,
  [EMAIL_ADDRESS_CHANGE]: payload => payload,
  [PASSWORD_CHANGE]: payload => payload,
  [REMEMBER_ME_CHANGE]: payload => payload,
  [LOGIN_SUCCESS]: (payload, currentState) => ({
    ...defaultState,
    ...payload,
    rememberMe: currentState.rememberMe,
    emailAddress: currentState.emailAddress,
    password: currentState.password,
  }),
  [LOGIN_REQUEST]: () => ({ isLoggingIn: true }),
  [LOGIN_ERROR]: logoutStateUpdater,
  [LOGOUT]: logoutStateUpdater,
};

export const reducer = createReducer(defaultState, stateChanges);
