/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createSelector } from 'reselect';
import { getCountries, loginUser, logoutUser, updateUser, getUser } from '../api';
import { createReducer } from '../utils/createReducer';
import { clearCountries, getCountryCodes, setCountries } from './entities';

// actions
const LOGIN_START = 'LOGIN_START';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
const LOGIN_ERROR = 'LOGIN_ERROR';
const LOGOUT = 'LOGOUT';
export const PROFILE_SUCCESS = 'PROFILE_SUCCESS';

// action creators
export const login =
  ({ email, password }) =>
  async dispatch => {
    const deviceName = window.navigator.userAgent;

    dispatch({ type: LOGIN_START });
    try {
      const { user } = await loginUser({
        emailAddress: email,
        password,
        deviceName,
      });
      const { data: countries } = await getCountries(user);

      dispatch(setCountries(countries));
      dispatch({
        type: LOGIN_SUCCESS,
        user,
      });
    } catch (error) {
      dispatch({
        type: LOGIN_ERROR,
        error: error.message,
      });
    }
  };

export const logout =
  (error = null) =>
  async dispatch => {
    if (error) {
      dispatch({
        type: LOGIN_ERROR,
        error,
      });
    }

    dispatch(clearCountries());
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
export const checkIsLoading = ({ auth }) => auth.status === 'loading';
export const checkIsSuccess = ({ auth }) => auth.status === 'success';
export const checkIsError = ({ auth }) => auth.status === 'error';
export const getError = ({ auth }) => auth.error;
export const checkIsLoggedIn = state => !!getCurrentUser(state) && state.auth.isLoggedIn;

export const canUserViewCountry = (entities, match) =>
  entities.some(entityCode => entityCode === match.params.countryCode);

export const canUserViewMultipleCountries = entities => entities.length > 1;

export const checkIsMultiCountryUser = createSelector(
  getCountryCodes,
  countryCodes => countryCodes.length > 1,
);

export const getHomeUrl = state =>
  checkIsMultiCountryUser(state) ? '/' : `/weekly-reports/${getCountryCodes(state)[0]}`;

// reducer
const defaultState = {
  status: 'idle',
  error: null,
  isLoggedIn: false,
  user: null,
};

const actionHandlers = {
  [LOGIN_START]: () => ({
    ...defaultState,
    status: 'loading',
  }),
  [LOGIN_SUCCESS]: action => ({
    ...defaultState,
    user: action.user,
    isLoggedIn: true,
  }),
  [LOGIN_ERROR]: action => ({
    status: 'error',
    error: action.error,
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
