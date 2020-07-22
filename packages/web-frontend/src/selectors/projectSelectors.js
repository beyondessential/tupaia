import { createSelector } from 'reselect';
import { initialOrgUnit } from '../defaults';

import { getUrlComponent, URL_COMPONENTS } from '../historyNavigation';

import { selectLocation } from './utils';

export const selectCurrentProjectCode = createSelector([selectLocation], location =>
  getUrlComponent(URL_COMPONENTS.PROJECT, location),
);

export const selectIsProject = createSelector(
  [state => state.project.projects, (_, code) => code],
  (projects, code) => projects.some(project => project.code === code),
);

export const selectProjectByCode = (state, code) =>
  state.project.projects.find(p => p.code === code);

export const selectCurrentProject = createSelector(
  [state => selectProjectByCode(state, selectCurrentProjectCode(state))],
  currentProject => currentProject || {},
);

export const selectAdjustedProjectBounds = (state, code) => {
  if (code === 'explore' || code === 'disaster') {
    return initialOrgUnit.location.bounds;
  }
  const project = selectProjectByCode(state, code);
  return project && project.bounds;
};
