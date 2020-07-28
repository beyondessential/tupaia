import { createSelector } from 'reselect';
import { initialOrgUnit } from '../defaults';

import { getUrlComponent, URL_COMPONENTS } from '../historyNavigation';

import { selectLocation } from './utils';

const selectAllProjects = state => state.project.projects;

export const selectCurrentProjectCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.PROJECT, location),
);

export const selectIsProject = createSelector(
  [selectAllProjects, (_, code) => code],
  (projects, code) => projects.some(project => project.code === code),
);

export const selectProjectByCode = createSelector(
  [selectAllProjects, (_, code) => code],
  (projects, code) => projects.find(p => p.code === code),
);

export const selectCurrentProject = createSelector(
  [state => selectProjectByCode(state, selectCurrentProjectCode(state))],
  currentProject => currentProject || {},
);

export const selectAdjustedProjectBounds = createSelector(
  [selectProjectByCode, (_, code) => code],
  (project, code) => {
    if (code === 'explore' || code === 'disaster') {
      return initialOrgUnit.location.bounds;
    }
    return project && project.bounds;
  },
);
