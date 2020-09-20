/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {
  EMAIL_ADDRESS_CHANGE,
  PASSWORD_CHANGE,
  REMEMBER_ME_CHANGE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT,
  PROFILE_UPDATE_ERROR,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_SUCCESS,
} from './constants';

export const changeEmailAddress = emailAddress => ({
  type: EMAIL_ADDRESS_CHANGE,
  emailAddress,
});

export const changePassword = password => ({
  type: PASSWORD_CHANGE,
  password,
});

export const changeRememberMe = rememberMe => ({
  type: REMEMBER_ME_CHANGE,
  rememberMe,
});

export const login = (emailAddress, password) => async (dispatch, getState, { api }) => {
  const deviceName = window.navigator.userAgent;
  dispatch({
    // Set state to logging in
    type: LOGIN_REQUEST,
  });
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

export const loginSuccess = ({ accessToken, refreshToken, user }) => dispatch => {
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

// Profile
export const updateProfile = (emailAddress, password) => async (dispatch, getState, { api }) => {
  const deviceName = window.navigator.userAgent;
  dispatch({
    type: PROFILE_UPDATE_REQUEST,
  });
  try {
    const userDetails = await api.reauthenticate({
      emailAddress,
      password,
      deviceName,
    });
    dispatch(updateProfileSuccess(userDetails));
  } catch (error) {
    dispatch(updateProfileError(error.message));
  }
};

export const updateProfileSuccess = ({ user }) => ({
  type: PROFILE_UPDATE_SUCCESS,
  user,
});

export const updateProfileError = errorMessage => ({
  type: PROFILE_UPDATE_ERROR,
  errorMessage,
});
