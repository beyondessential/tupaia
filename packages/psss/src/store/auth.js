/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utils/createReducer';

// actions
const LOGIN_START = 'LOGIN_START';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGOUT = 'LOGOUT';

export const login = (emailAddress, password) => async (dispatch, getState, { api }) => {
  console.log('api', api);
  const deviceName = window.navigator.userAgent;

  dispatch({ type: LOGIN_START });
  try {
    const { accessToken, refreshToken, user } = await api.reauthenticate({
      emailAddress,
      password,
      deviceName,
    });
    dispatch({ type: LOGIN_SUCCESS, accessToken, refreshToken, user });
  } catch (error) {
    dispatch({ type: LOGIN_FAILURE, error: error.message });
  }
};

export const logout = () => ({
  type: LOGOUT,
});

// selectors
export const getCurrentUser = ({ auth }) => auth.user;
export const getError = ({ auth }) => auth.error;
export const checkIsPending = ({ auth }) => auth.status === 'pending';
export const checkIsSuccess = ({ auth }) => auth.status === 'success';
export const checkIsError = ({ auth }) => auth.status === 'error';
export const checkIsLoggedIn = state => !!getCurrentUser(state) && checkIsSuccess(state);

// reducer
const defaultState = {
  status: 'idle',
  user: null,
  error: null,
  token: null,
};

const actionHandlers = {
  [LOGIN_START]: () => ({
    status: 'pending',
    user: defaultState.user,
    error: defaultState.error,
  }),
  [LOGIN_SUCCESS]: action => ({
    status: 'success',
    user: action.user,
    error: defaultState.error,
    accessToken: action.accessToken,
    refreshToken: action.refreshToken,
  }),
  [LOGIN_FAILURE]: action => ({
    status: 'error',
    error: action.error,
  }),
  [LOGOUT]: () => defaultState,
};

export const auth = createReducer(defaultState, actionHandlers);
