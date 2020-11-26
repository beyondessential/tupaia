/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createSelector } from 'reselect';
import { AccessPolicy } from '@tupaia/access-policy';
import { authenticate, updateUser, updatePassword, getUser } from '../api';
import { createReducer } from '../utils/createReducer';

// actions
const LOGIN_START = 'LOGIN_START';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_ERROR = 'LOGIN_ERROR';
const LOGOUT = 'LOGOUT';
export const PROFILE_SUCCESS = 'PROFILE_SUCCESS';

// action creators
export const login = ({ email, password }) => async dispatch => {
  const deviceName = window.navigator.userAgent;

  dispatch({ type: LOGIN_START });
  try {
    const response = await authenticate({
      emailAddress: email,
      password,
      deviceName,
    });

    dispatch(loginSuccess(response));
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

export const updateProfile = payload => async dispatch => {
  await updateUser(payload);
  const user = await getUser();
  dispatch({
    type: PROFILE_SUCCESS,
    ...user,
  });
};

// selectors
export const getCurrentUser = ({ auth }) => auth && auth.user;
export const getError = ({ auth }) => auth.error;
export const checkIsPending = ({ auth }) => auth.status === 'pending';
export const checkIsSuccess = ({ auth }) => auth.status === 'success';
export const checkIsError = ({ auth }) => auth.status === 'error';
export const checkIsLoggedIn = state => !!getCurrentUser(state) && checkIsSuccess(state);

const PSSS_PERMISSION_GROUP = 'PSSS';

export const getEntitiesAllowed = createSelector(getCurrentUser, user => {
  if (!user) {
    return [];
  }

  const entities = new AccessPolicy(user.accessPolicy).getEntitiesAllowed(PSSS_PERMISSION_GROUP);
  return entities.map(e => e.toLowerCase()); // always use lowercase entities
});

export const checkIsMultiCountryUser = createSelector(
  getEntitiesAllowed,
  entities => entities.length > 1,
);

export const getHomeUrl = state =>
  checkIsMultiCountryUser(state) ? '/' : `/weekly-reports/${getEntitiesAllowed(state)[0]}`;

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
  [LOGOUT]: (action, currentState) => ({
    ...defaultState,
    user: currentState.user,
  }),
  [PROFILE_SUCCESS]: (user, currentState) => ({
    user: {
      ...currentState.user,
      firstName: user.first_name,
      lastName: user.last_name,
      name: `${user.first_name} ${user.last_name}`,
      position: user.position,
      employer: user.employer,
      profileImage: user.profile_image,
    },
  }),
};

export const auth = createReducer(defaultState, actionHandlers);
