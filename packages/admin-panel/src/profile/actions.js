/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  PROFILE_FIELD_CHANGE,
  PROFILE_UPDATE_SUCCESS,
  PROFILE_UPDATE_REQUEST,
  PROFILE_UPDATE_ERROR,
} from './contants';

export const changeProfileField = (key, value) => ({
  type: PROFILE_FIELD_CHANGE,
  payload: {
    key,
    value,
  },
});

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
