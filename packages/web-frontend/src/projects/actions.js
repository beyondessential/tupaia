/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  SET_PROJECT,
  SET_PROJECT_DATA,
  FETCH_PROJECTS_ERROR,
  REQUEST_PROJECT_ACCESS,
  CLEAR_CUSTOM_LANDING_PAGE_DATA,
} from '../actions';

export function setProject(projectCode) {
  return { type: SET_PROJECT, projectCode };
}

export function setProjects(data) {
  return {
    type: SET_PROJECT_DATA,
    data,
  };
}

export function fetchProjectsError(error) {
  return {
    type: FETCH_PROJECTS_ERROR,
    error,
  };
}

export function setRequestingAccess(project) {
  return {
    type: REQUEST_PROJECT_ACCESS,
    project,
  };
}

export function clearCustomLandingPageData() {
  return {
    type: CLEAR_CUSTOM_LANDING_PAGE_DATA,
  };
}
