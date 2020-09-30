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
import { mapBoxToken } from '../utils';

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

// MAPBOX STYLES
const GERRY_ACCESS_KEY =
  'pk.eyJ1IjoiZ2VkY2tlbGx5IiwiYSI6ImNrY3BsZ2RwYTB3N20yc3FyaTZlNzhzNDUifQ.N61FIOcE-3RTksi9Tlm5ow#10.25/17.9782/102.6277';
const GERRY_USERNAME = 'gedckelly';

const makeStyleUrl = ({ styleId, accessKey = GERRY_ACCESS_KEY, username = GERRY_USERNAME }) =>
  `https://api.mapbox.com/styles/v1/${username}/${styleId}/tiles/256/{z}/{x}/{y}@2x?access_token=${accessKey}`;

const TILE_SETS = [
  {
    key: 'osm',
    label: 'Open Streets',
    thumbnail: '/images/osm.png',
    url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
  },
  {
    key: 'satellite',
    label: 'Satellite',
    thumbnail: '/images/satellite.png',
    url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${mapBoxToken}`,
  },
  {
    key: 'waterways',
    label: 'Waterways',
    thumbnail: '/images/waterways.png',
    url: makeStyleUrl({ styleId: 'ckemdct811px619qklzgvvg53' }),
  },
  {
    key: 'roads',
    label: 'Roads',
    thumbnail: '/images/roads.png',
    url: makeStyleUrl({ styleId: 'ckenp4uq10dfq1anzert7iot7' }),
    legendItems: [
      {
        color: '#D13333',
        label: 'Ethnic group one',
      },
      {
        color: '#E37F49',
        label: 'Ethnic group two',
      },
      {
        color: '#E12EC5',
        label: 'Ethnic group three',
      },
      {
        color: '#22D489',
        label: 'Ethnic group four',
      },
      {
        color: '#2196F3',
        label: 'Ethnic group five',
      },
    ],
  },
  {
    key: 'terrain',
    label: 'Terrain',
    thumbnail: '/images/terrain.png',
    url: makeStyleUrl({ styleId: 'ckenu2thw0ibl1anzk5aarzu6' }),
  },
];

export const selectTileSets = state => {
  const currentProject = selectCurrentProject(state);
  const tileSetKeys = currentProject.tileSets
    ? currentProject.tileSets.split(',')
    : ['osm', 'satellite'];
  return TILE_SETS.filter(tileSet => tileSetKeys.includes(tileSet.key));
};

export const selectActiveTileSet = state => {
  const tileSets = selectTileSets(state);
  return tileSets.find(tileSet => tileSet.key === state.map.activeTileSetKey);
};
