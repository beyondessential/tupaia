/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createReducer } from '../utils/createReducer';
import { getPermittedEntitiesForUser, checkIsAuthorisedForMultiCountry } from '../utils/auth';

// actions
const LOGIN_START = 'LOGIN_START';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_ERROR = 'LOGIN_ERROR';
const LOGOUT = 'LOGOUT';
export const PROFILE_SUCCESS = 'PROFILE_SUCCESS';

// action creators
export const login = (emailAddress, password) => async (dispatch, getState, { api }) => {
  const deviceName = window.navigator.userAgent;

  dispatch({ type: LOGIN_START });
  try {
    const userDetails = await api.reauthenticate({
      emailAddress,
      password,
      deviceName,
    });
    dispatch(loginSuccess(userDetails));
  } catch (error) {
    dispatch(loginError(error.message));
  }
};

export const loginSuccess = ({ accessToken, refreshToken, user }) => ({
  type: LOGIN_SUCCESS,
  accessToken,
  refreshToken,
  user,
});

export const loginError = errorMessage => ({
  type: LOGIN_ERROR,
  error: errorMessage,
});

export const logout = () => ({
  type: LOGOUT,
});

export const updateProfile = payload => async (dispatch, getState, { api }) => {
  await api.put(`me`, null, payload);
  const { body: user } = await api.get(`me`);
  dispatch({
    type: PROFILE_SUCCESS,
    ...user,
  });
};

export const updatePassword = payload => async (dispatch, getState, { api }) =>
  api.post(`me/changePassword`, null, payload);

// selectors
export const getAccessToken = ({ auth }) => auth.accessToken;
export const getRefreshToken = ({ auth }) => auth.refreshToken;
export const getCurrentUser = ({ auth }) => auth.user;
export const getError = ({ auth }) => auth.error;
export const checkIsPending = ({ auth }) => auth.status === 'pending';
export const checkIsSuccess = ({ auth }) => auth.status === 'success';
export const checkIsError = ({ auth }) => auth.status === 'error';
export const checkIsLoggedIn = state => !!getCurrentUser(state) && checkIsSuccess(state);

export const getPermittedEntity = state => {
  const user = getCurrentUser(state);
  return getPermittedEntitiesForUser(user);
};

export const checkIsMultiCountryUser = state => {
  const user = getCurrentUser(state);
  return checkIsAuthorisedForMultiCountry(user);
};

export const getPermittedEntitySlug = state =>
  checkIsMultiCountryUser(state) ? '' : getPermittedEntity(state);

export const getHomeUrl = state =>
  checkIsMultiCountryUser(state) ? '/' : `/weekly-reports/${getPermittedEntity(state)}`;

// reducer
const defaultState = {
  status: 'idle',
  user: null,
  error: null,
  accessToken: null,
  refreshToken: null,
};

const actionHandlers = {
  [LOGIN_START]: () => ({
    ...defaultState,
    status: 'pending',
  }),
  [LOGIN_SUCCESS]: action => ({
    status: 'success',
    user: action.user,
    error: defaultState.error,
    accessToken: action.accessToken,
    refreshToken: action.refreshToken,
  }),
  [LOGIN_ERROR]: action => ({
    status: 'error',
    error: action.error,
  }),
  [LOGOUT]: () => defaultState,
  [PROFILE_SUCCESS]: (user, currentState) => ({
    user: {
      ...currentState.user,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      position: user.position,
      employer: user.employer,
    },
  }),
};

export const auth = createReducer(defaultState, actionHandlers);
