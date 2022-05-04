/**
 * Tupaia MediTrak
 * Copyright (c) 2017-2022 Beyond Essential Systems Pty Ltd
 */

import {
  DELETE_ACCOUNT_REQUEST,
  DELETE_ACCOUNT_REQUEST_SUCCESS,
  DELETE_ACCOUNT_REQUEST_FAILURE,
} from './constants';

const deleteAccountError = () => ({
  type: DELETE_ACCOUNT_REQUEST_FAILURE,
});

export const submit = () => async (dispatch, getState, { api }) => {
  dispatch({ type: DELETE_ACCOUNT_REQUEST });
  let response;
  try {
    response = await api.deleteAccountRequest();
    if (response.error) {
      throw new Error(response.error);
    }
  } catch (error) {
    dispatch(deleteAccountError());
    return;
  }

  dispatch({ type: DELETE_ACCOUNT_REQUEST_SUCCESS });
};
