/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { createSelector } from 'reselect';
import { DEFAULT_BOUNDS } from '../defaults';
import { getLocationComponentValue, URL_COMPONENTS } from '../historyNavigation';
import { selectLocation } from './utils';

const selectAllProjects = state => state.project.projects;

export const selectCurrentProjectCode = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.PROJECT),
);

export const selectIsProject = createSelector(
  [selectAllProjects, (_, code) => code],
  (projects, code) => projects.some(project => project.code === code),
);

export const selectProjectByCode = createSelector(
  [selectAllProjects, (_, code) => code],
  (projects, code) => projects.find(p => p.code === code) || {},
);

export const selectCurrentProject = createSelector(
  [state => selectProjectByCode(state, selectCurrentProjectCode(state))],
  currentProject => currentProject || {},
);

export const selectAdjustedProjectBounds = createSelector(
  [selectProjectByCode, (_, code) => code],
  (project, code) => {
    if (code === 'explore' || code === 'disaster') {
      return DEFAULT_BOUNDS;
    }
    return project && project.bounds;
  },
);
