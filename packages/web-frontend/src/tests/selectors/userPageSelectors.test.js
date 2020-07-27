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
} from '../../selectors';
import { initialOrgUnit } from '../../defaults';
import { state } from './selectors.test.fixtures';

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

describe('userPageSelectors', () => {
  /*
  describe('memoization', () => {
    describe('selectCurrentProject', () => {
      it('recomputes by code or by state change', () => {
        const routing1 = {
          pathname: '/PROJECT_1/TO/A%20DASHBOARD',
          search: '?overlay=abc%20123',
        };

        const routing2 = {
          pathname: '/PROJECT_1/TO/A%20DASHBOARD',
          search: '?overlay=abc%20123',
        };

        const routing3 = {
          pathname: '/PROJECT_2/TO/A%20DASHBOARD',
          search: '?overlay=abc%20123',
        };
        selectCurrentProject({ ...testState1, routing: routing1 });
        expect(selectCurrentProject.recomputations()).toEqual(1);

        selectCurrentProject({ ...testState1, routing: routing1, someOtherState: 'irrelevent' });
        expect(selectCurrentProject.recomputations()).toEqual(1); // Nothing has changed, so don't recompute

        selectCurrentProject({ ...testState2, routing: routing1 });
        expect(selectCurrentProject.recomputations()).toEqual(2); // Projects array has changed, recompute

        selectCurrentProject({ ...testState2, routing: routing2 });
        expect(selectCurrentProject.recomputations()).toEqual(2); // Routing has changed but code has not, do not recompute

        selectCurrentProject({ ...testState2, routing: routing3 });
        expect(selectCurrentProject.recomputations()).toEqual(3); // Code has changed, recompute
      });
    });

    describe('functionality', () => {
      describe('selectProjectByCode', () => {
        it('can select a project', () => {
          expect(selectProjectByCode(state, 'explore')).toEqual(state.project.projects[0]);
        });

        it('can select a project code which does not exist', () => {
          expect(selectProjectByCode(state, 'DOES_NOT_EXIST')).toEqual(undefined);
        });

        it('can select undefined', () => {
          expect(selectProjectByCode(state, undefined)).toEqual(undefined);
        });
      });
    });
  });
  */
});
