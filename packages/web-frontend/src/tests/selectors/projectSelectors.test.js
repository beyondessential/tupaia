/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  selectProjectByCode,
  selectCurrentProject,
  selectIsProject,
  selectAdjustedProjectBounds,
  selectActiveTileSet,
} from '../../selectors';
import { DEFAULT_BOUNDS } from '../../defaults';
import { state } from './selectors.test.fixtures';
import { TILE_SETS } from '../../constants';

const testState1 = {
  project: {
    projects: [
      { code: 'PROJECT_1', data: 4 },
      { code: 'PROJECT_2', data: 6 },
    ],
  },
};
const testState2 = {
  project: {
    projects: [
      { code: 'PROJECT_1', data: 40 },
      { code: 'PROJECT_2', data: 60 },
    ],
  },
};

describe('projectSelectors', () => {
  describe('memoization', () => {
    describe('selectProjectByCode', () => {
      it('recomputes by code or by state change', () => {
        selectProjectByCode(testState1, 'PROJECT_1');
        expect(selectProjectByCode.recomputations()).toEqual(1);

        selectProjectByCode({ ...testState1, someOtherState: 'irrelevant' }, 'PROJECT_1');
        expect(selectProjectByCode.recomputations()).toEqual(1); // Nothing has changed, so don't recompute

        selectProjectByCode(testState2, 'PROJECT_1');
        expect(selectProjectByCode.recomputations()).toEqual(2); // Projects array has changed, recompute

        selectProjectByCode(testState2, 'PROJECT_2');
        expect(selectProjectByCode.recomputations()).toEqual(3); // Code has changed, recompute
      });
    });

    describe('selectIsProject', () => {
      it('recomputes by code or by state change', () => {
        selectIsProject(testState1, 'PROJECT_1');
        expect(selectIsProject.recomputations()).toEqual(1);

        selectIsProject({ ...testState1, someOtherState: 'irrelevant' }, 'PROJECT_1');
        expect(selectIsProject.recomputations()).toEqual(1); // Nothing has changed, so don't recompute

        selectIsProject(testState2, 'PROJECT_1');
        expect(selectIsProject.recomputations()).toEqual(2); // Projects array has changed, recompute

        selectIsProject(testState2, 'PROJECT_2');
        expect(selectIsProject.recomputations()).toEqual(3); // Code has changed, recompute
      });
    });

    describe('selectAdjustedProjectBounds', () => {
      it('recomputes by code or by state change', () => {
        selectAdjustedProjectBounds(testState1, 'PROJECT_1');
        expect(selectAdjustedProjectBounds.recomputations()).toEqual(1);

        selectAdjustedProjectBounds({ ...testState1, someOtherState: 'irrelevant' }, 'PROJECT_1');
        expect(selectAdjustedProjectBounds.recomputations()).toEqual(1); // Nothing has changed, so don't recompute

        selectAdjustedProjectBounds(testState2, 'PROJECT_1');
        expect(selectAdjustedProjectBounds.recomputations()).toEqual(2); // Projects array has changed, recompute

        selectAdjustedProjectBounds(testState2, 'PROJECT_2');
        expect(selectAdjustedProjectBounds.recomputations()).toEqual(3); // Code has changed, recompute
      });
    });

    describe('selectCurrentProject', () => {
      it('recomputes by code or by state change', () => {
        const routing1 = {
          pathname: '/PROJECT_1/TO/A%20DASHBOARD',
          search: '?overlay=abc%20123',
        };

        const routing2 = {
          pathname: '/PROJECT_1/PG/ANOTHER%20DASHBOARD',
          search: '?overlay=abc%20123',
        };

        const routing3 = {
          pathname: '/PROJECT_2/PG/ANOTHER%20DASHBOARD',
          search: '?overlay=abc%20123',
        };
        selectCurrentProject({ ...testState1, routing: routing1 });
        expect(selectCurrentProject.recomputations()).toEqual(1);

        selectCurrentProject({ ...testState1, routing: routing1, someOtherState: 'irrelevant' });
        expect(selectCurrentProject.recomputations()).toEqual(1); // Nothing has changed, so don't recompute

        selectCurrentProject({ ...testState2, routing: routing1 });
        expect(selectCurrentProject.recomputations()).toEqual(2); // Projects array has changed, recompute

        selectCurrentProject({ ...testState2, routing: routing2 });
        expect(selectCurrentProject.recomputations()).toEqual(2); // Routing has changed but code has not, do not recompute

        selectCurrentProject({ ...testState2, routing: routing3 });
        expect(selectCurrentProject.recomputations()).toEqual(3); // Code has changed, recompute
      });
    });
  });

  describe('functionality', () => {
    describe('selectProjectByCode', () => {
      it('can select a project', () => {
        expect(selectProjectByCode(state, 'explore')).toEqual(state.project.projects[0]);
      });

      it('returns an empty object when trying to select a project when there are no projects in the store', () => {
        expect(
          selectProjectByCode({ ...state, project: { ...state.project, projects: [] } }, 'explore'),
        ).toEqual({});
      });

      it("returns an empty object when trying to select a project that doesn't exist", () => {
        expect(selectProjectByCode(state, 'DOES_NOT_EXIST')).toEqual({});
      });

      it('returned empty objects are shallow equal', () => {
        const project1 = selectProjectByCode(
          { ...state, project: { ...state.project, projects: [] } },
          'explore',
        );
        const project2 = selectProjectByCode(state, 'DOES_NOT_EXIST');
        const project3 = selectProjectByCode(state, undefined);
        expect(project1).toBe(project2);
        expect(project2).toBe(project3);
      });
    });

    describe('selectIsProject', () => {
      it('returns `true` for an existing project', () => {
        expect(selectIsProject(state, 'covidau')).toEqual(true);
      });

      it('returns `false` for a project which does not exist', () => {
        expect(selectIsProject(state, 'DOES_NOT_EXIST')).toEqual(false);
      });
    });

    describe('selectAdjustedProjectBounds', () => {
      it('can select bounds for a project which exists', () => {
        expect(selectAdjustedProjectBounds(state, 'covidau')).toEqual(
          state.project.projects[1].bounds,
        );
      });

      it('can select bounds for the `explore` and `disaster` projects', () => {
        expect(selectAdjustedProjectBounds(state, 'explore')).toEqual(DEFAULT_BOUNDS);

        expect(selectAdjustedProjectBounds(state, 'disaster')).toEqual(DEFAULT_BOUNDS);
      });

      it('can select bounds for a project which does not exist', () => {
        expect(selectAdjustedProjectBounds(state, 'DOES_NOT_EXIST')).toEqual(undefined);
      });
    });

    describe('selectCurrentProject', () => {
      it('can select the current project', () => {
        expect(selectCurrentProject(state)).toEqual(state.project.projects[0]);
      });
    });

    const tileState = {
      project: {
        projects: [
          { code: 'explore' },
          {
            code: 'disaster',
            project: { tileSets: 'osm,satellite,waterways,roads,ethnicity,terrain' },
          },
          { code: 'unfpa', project: { tileSets: 'roads,waterways,eth, terrain' } }, // testing typos in the config
        ],
      },
      routing: {
        pathname: '/disaster/disaster/',
      },
      map: { activeTileSetKey: 'osm' },
    };

    describe('tile sets', () => {
      it('can select the correct tile set', () => {
        expect(selectActiveTileSet(tileState)).toEqual(TILE_SETS[0]);

        expect(
          selectActiveTileSet({ ...tileState, map: { activeTileSetKey: 'satellite' } }),
        ).toEqual(TILE_SETS[1]);

        // test disaster project
        const disasterState = { ...tileState, routing: { pathname: '/disaster/' } };

        expect(selectActiveTileSet({ ...disasterState, map: { activeTileSetKey: 'osm' } })).toEqual(
          TILE_SETS[0],
        );

        expect(
          selectActiveTileSet({ ...disasterState, map: { activeTileSetKey: 'satellite' } }),
        ).toEqual(TILE_SETS[1]);

        expect(
          selectActiveTileSet({ ...disasterState, map: { activeTileSetKey: 'waterways' } }),
        ).toEqual(TILE_SETS[2]);

        expect(
          selectActiveTileSet({ ...disasterState, map: { activeTileSetKey: 'roads' } }),
        ).toEqual(TILE_SETS[3]);

        expect(
          selectActiveTileSet({ ...disasterState, map: { activeTileSetKey: 'ethnicity' } }),
        ).toEqual(TILE_SETS[4]);

        expect(
          selectActiveTileSet({ ...disasterState, map: { activeTileSetKey: 'terrain' } }),
        ).toEqual(TILE_SETS[5]);

        // test unfpa project
        const unfpaState = { ...tileState, routing: { pathname: '/unfpa/' } };

        expect(selectActiveTileSet({ ...unfpaState, map: { activeTileSetKey: 'osm' } })).toEqual(
          TILE_SETS[0],
        );

        expect(
          selectActiveTileSet({ ...unfpaState, map: { activeTileSetKey: 'satellite' } }),
        ).toEqual(TILE_SETS[1]);

        expect(
          selectActiveTileSet({ ...unfpaState, map: { activeTileSetKey: 'terrain' } }), // todo: handle trimming whitespace
        ).toEqual(TILE_SETS[2]);
      });
    });
  });
});
