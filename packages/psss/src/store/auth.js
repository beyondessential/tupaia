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

export const login = (email, password) => async (dispatch, getState, { api }) => {
  console.log('api', api);
  dispatch({ type: LOGIN_START });
  try {
    const { user, token } = await api.login(email, password);
    dispatch({ type: LOGIN_SUCCESS, user, token });
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
    token: action.token,
  }),
  [LOGIN_FAILURE]: action => ({
    status: 'error',
    error: action.error,
  }),
  [LOGOUT]: () => defaultState,
};

export const auth = createReducer(defaultState, actionHandlers);
