/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { LOGOUT } from './constants';

// workaround for resetting redux state on logout, until we move everything to react-query and hooks
export const logout = dispatch => {
  dispatch({ type: LOGOUT });
};
