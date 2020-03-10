/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  SELECT_PROJECT,
  SET_PROJECT_DATA,
  FETCH_PROJECTS_ERROR,
  SET_PROJECT,
  DISPLAY_BREAD_CRUMBS,
  REQUEST_PROJECT_ACCESS,
} from '../actions';

export function selectProject(project) {
  return { type: SELECT_PROJECT, project };
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

export function setProjectDefaults(project) {
  return {
    type: SET_PROJECT,
    project: project.code,
  };
}

export function setRequestingAccess(project) {
  return {
    type: REQUEST_PROJECT_ACCESS,
    project,
  };
}
