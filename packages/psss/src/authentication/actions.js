/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  EMAIL_ADDRESS_CHANGE,
  PASSWORD_CHANGE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
} from './constants';

export const changeEmailAddress = emailAddress => ({
  type: EMAIL_ADDRESS_CHANGE,
  emailAddress,
});

export const changePassword = password => ({
  type: PASSWORD_CHANGE,
  password,
});

export const login = (emailAddress, password) => async (dispatch, getState, { api }) => {
  const deviceName = window.navigator.userAgent;
  dispatch({
    // Set state to logging in
    type: LOGIN_REQUEST,
  });
  try {
    console.log('API login...');
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

export const loginSuccess = ({ accessToken, refreshToken, user }) => dispatch => {
  console.log('API user logged in', user.email);
  dispatch({
    type: LOGIN_SUCCESS,
    accessToken,
    refreshToken,
    user,
  });
};

export const loginError = errorMessage => ({
  type: LOGIN_ERROR,
  errorMessage,
});

export const logout = () => ({
  type: LOGOUT,
});
