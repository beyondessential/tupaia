/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { LOGOUT } from './constants';

// Password
export const updatePassword =
  payload =>
  async (dispatch, getState, { api }) =>
    api.post('me/changePassword', null, payload);

// workaround for resetting redux state on logout, until we move everything to react-query and hooks
export const logout = dispatch => {
  dispatch({ type: LOGOUT });
};
