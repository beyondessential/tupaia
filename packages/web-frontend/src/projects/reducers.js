/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { SET_PROJECT_DATA, SELECT_PROJECT, REQUEST_PROJECT_ACCESS, GO_HOME } from '../actions';

export default function projects(
  state = {
    projects: [],
    active: {},
    requestingAccess: null,
    error: '',
  },
  action,
) {
  switch (action.type) {
    case GO_HOME:
      return {
        ...state,
        active: {},
      };
    case SELECT_PROJECT:
      return {
        ...state,
        active: action.project,
      };
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
    default:
      return state;
  }
}
