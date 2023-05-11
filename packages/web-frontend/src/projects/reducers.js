/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  SET_PROJECT_DATA,
  REQUEST_PROJECT_ACCESS,
  SET_CUSTOM_LANDING_PAGE_DATA,
  CLEAR_CUSTOM_LANDING_PAGE_DATA,
  CUSTOM_LANDING_PAGE_LOADING,
} from '../actions';

export default function projects(
  state = {
    projects: [],
    isLoadingCustomLandingPage: true,
    customLandingPage: null,
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
    case CUSTOM_LANDING_PAGE_LOADING:
      return {
        ...state,
        isLoadingCustomLandingPage: action.isLoading,
      };
    case SET_CUSTOM_LANDING_PAGE_DATA:
      return {
        ...state,
        customLandingPage: action.data,
        isLoadingCustomLandingPage: false,
      };
    case CLEAR_CUSTOM_LANDING_PAGE_DATA:
      return {
        ...state,
        customLandingPage: null,
      };
    default:
      return state;
  }
}
