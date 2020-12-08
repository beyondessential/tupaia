/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createSelector } from 'reselect';
import { AccessPolicy } from '@tupaia/access-policy';
import { loginUser, logoutUser, updateUser, getUser } from '../api';
import { createReducer } from '../utils/createReducer';

// actions
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGOUT = 'LOGOUT';
const PROFILE_SUCCESS = 'PROFILE_SUCCESS';

// action creators
export const login = ({ email, password }) => async dispatch => {
  const deviceName = window.navigator.userAgent;
  const user = await loginUser({
    emailAddress: email,
    password,
    deviceName,
  });
  dispatch({
    type: LOGIN_SUCCESS,
    ...user,
  });
};

export const logout = () => async dispatch => {
  dispatch({
    type: LOGOUT,
  });
  await logoutUser();
};

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
export const checkIsSuccess = ({ auth }) => auth.status === 'success';
export const checkIsLoggedIn = state => !!getCurrentUser(state) && state.auth.isLoggedIn;

const PSSS_PERMISSION_GROUP = 'PSSS';

export const canUserViewCountry = (entities, match) =>
  entities.some(entityCode => entityCode === match.params.countryCode);

export const canUserViewMultipleCountries = entities => entities.length > 1;

const getEntitiesAllowedByUser = user => {
  if (!user) {
    return [];
  }

  const entities = new AccessPolicy(user.accessPolicy).getEntitiesAllowed(PSSS_PERMISSION_GROUP);
  return entities.filter(e => e !== 'DL'); // don't show demo land in psss
};

export const getEntitiesAllowed = createSelector(getCurrentUser, user =>
  getEntitiesAllowedByUser(user),
);

export const checkIsMultiCountryUser = createSelector(
  getEntitiesAllowed,
  entities => entities.length > 1,
);

export const getHomeUrl = state =>
  checkIsMultiCountryUser(state) ? '/' : `/weekly-reports/${getEntitiesAllowed(state)[0]}`;

// reducer
const defaultState = {
  isLoggedIn: false,
  user: null,
};

const actionHandlers = {
  [LOGIN_SUCCESS]: action => ({
    user: action.user,
    isLoggedIn: true,
  }),
  [LOGOUT]: (action, currentState) => ({
    ...currentState,
    isLoggedIn: false,
  }),
  [PROFILE_SUCCESS]: (user, currentState) => ({
    ...currentState,
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
