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
import { TILE_SETS } from '../constants';

const selectAllProjects = state => state.project.projects;

export const selectCurrentProjectCode = createSelector([selectLocation], location =>
  getLocationComponentValue(location, URL_COMPONENTS.PROJECT),
);

export const selectIsProject = createSelector(
  [selectAllProjects, (_, code) => code],
  (projects, code) => projects.some(project => project.code === code),
);

const EMPTY_PROJECT = {};
export const selectProjectByCode = createSelector(
  [selectAllProjects, (_, code) => code],
  (projects, code) => projects.find(p => p.code === code) || EMPTY_PROJECT,
);

export const selectCurrentProject = createSelector(
  [state => selectProjectByCode(state, selectCurrentProjectCode(state))],
  currentProject => currentProject,
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

export const selectTileSets = createSelector(selectCurrentProject, project => {
  let tileSetKeys = ['osm', 'satellite'];

  if (project.config && project.config.tileSets) {
    const customSetKeys = project.config.tileSets.split(',').map(item => item.trim());
    tileSetKeys = [...tileSetKeys, ...customSetKeys];
  }

  return TILE_SETS.filter(tileSet => tileSetKeys.includes(tileSet.key));
});

export const selectActiveTileSetKey = state => state.map.activeTileSetKey;

export const selectActiveTileSet = createSelector(
  [selectTileSets, selectActiveTileSetKey],
  (tileSets, activeTileSetKey) => {
    return tileSets.find(tileSet => tileSet.key === activeTileSetKey);
  },
);

export const selectAreRegionLabelsSticky = createSelector(
  selectCurrentProject,
  project => project.config && project.config.stickyRegionLabels,
);
