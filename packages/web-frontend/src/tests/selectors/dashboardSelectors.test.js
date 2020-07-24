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

describe('dashboardSelectors', () => {
  describe('memoization', () => {
    describe('selectCurrentDashboardKey', () => {
      it('recomputes by code or by state change', () => {
        expect(false); // TODO: write this test
        selectProjectByCode(testState1, 'PROJECT_1');
        expect(selectProjectByCode.recomputations()).toEqual(1);

        selectProjectByCode({ ...testState1, someOtherState: 'irrelevent' }, 'PROJECT_1');
        expect(selectProjectByCode.recomputations()).toEqual(1); // Nothing has changed, so don't recompute

        selectProjectByCode(testState2, 'PROJECT_1');
        expect(selectProjectByCode.recomputations()).toEqual(2); // Projects array has changed, recompute

        selectProjectByCode(testState2, 'PROJECT_2');
        expect(selectProjectByCode.recomputations()).toEqual(3); // Code has changed, recompute
      });
    });
  });
  describe('functionality', () => {
    describe('selectCurrentDashboardKey', () => {
      it('can select a project', () => {
        expect(false); // TODO: write this test
        expect(selectProjectByCode(state, 'explore')).toEqual(state.project.projects[0]);
      });
    });
  });
});
