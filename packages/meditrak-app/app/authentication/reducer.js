/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { createReducer, analytics } from '../utilities';
import {
  AUTH_STATUSES,
  EMAIL_ADDRESS_CHANGE,
  PASSWORD_CHANGE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
} from './constants';

const { AUTHENTICATED, AUTHENTICATING, UNAUTHENTICATED, ERROR } = AUTH_STATUSES;

const defaultState = {
  status: UNAUTHENTICATED,
  countryId: undefined,
  emailAddress: '',
  password: '',
  errorMessage: '',
  currentUserId: '',
  name: '',
  user: null,
};

const stateChanges = {
  [EMAIL_ADDRESS_CHANGE]: ({ emailAddress }) => ({
    status: UNAUTHENTICATED,
    errorMessage: '',
    emailAddress,
  }),
  [PASSWORD_CHANGE]: ({ password }) => ({
    status: UNAUTHENTICATED,
    errorMessage: '',
    password,
  }),
  [LOGIN_REQUEST]: () => ({
    status: AUTHENTICATING,
    errorMessage: '',
  }),
  [LOGIN_SUCCESS]: ({ userId, name }) => ({
    status: AUTHENTICATED,
    errorMessage: '',
    password: '', // Clear password once successfully logged in
    name,
    currentUserId: userId,
  }),
  [LOGIN_FAILURE]: ({ errorMessage }) => ({
    status: ERROR,
    errorMessage,
  }),
  [LOGOUT]: () => ({
    status: UNAUTHENTICATED,
    errorMessage: '',
    currentUserId: '',
  }),
};

const onRehydrate = (incomingState, versionDidUpdate) => {
  if (!incomingState) return undefined;
  const incomingAuthenticationState = incomingState.authentication;
  if (!incomingAuthenticationState || !incomingAuthenticationState.status) return undefined;
  if (
    versionDidUpdate ||
    incomingAuthenticationState.status === AUTHENTICATING ||
    incomingAuthenticationState.status === ERROR
  ) {
    analytics.trackEvent('Set to unauthenticated during rehydration', {
      incomingAuthenticationState,
      versionDidUpdate,
    });

    return {
      ...incomingAuthenticationState,
      status: UNAUTHENTICATED,
      errorMessage: '',
      password: '',
      currentUserId: '',
    };
  }

  return incomingAuthenticationState;
};

export const reducer = createReducer(defaultState, stateChanges, onRehydrate);
