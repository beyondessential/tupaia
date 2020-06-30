/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { SET_PROJECT_DATA, SELECT_PROJECT, REQUEST_PROJECT_ACCESS } from '../actions';

export default function projects(
  state = {
    projects: [],
    requestingAccess: null,
    error: '',
  },
  action,
) {
  switch (action.type) {
    case SET_PROJECT_DATA:
      return {
        ...state,
        projects: action.data,
      };
    case REQUEST_PROJECT_ACCESS:
      return {
        ...state,
        requestingAccess: action.project,
      };
    case SELECT_PROJECT: // Active project state is handled by the url
    default:
      return state;
  }
}
