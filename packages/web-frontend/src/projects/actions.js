/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  SET_PROJECT,
  ON_SET_PROJECT,
  SET_PROJECT_DATA,
  FETCH_PROJECTS_ERROR,
  REQUEST_PROJECT_ACCESS,
} from '../actions';
import { INITIAL_PROJECT_CODE } from '../defaults';

export function setProject(projectCode) {
  return { type: SET_PROJECT, projectCode };
}

export function onSetProject(projectCode, forceChangeOrgUnit = true) {
  // forceChangeOrgUnit is false when entering a url manually
  return { type: ON_SET_PROJECT, projectCode, forceChangeOrgUnit };
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
