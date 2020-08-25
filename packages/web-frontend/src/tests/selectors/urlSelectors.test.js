/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  selectCurrentOrgUnitCode,
  selectCurrentProjectCode,
  selectCurrentDashboardGroupCode,
  selectCurrentMeasureId,
  selectCurrentExpandedViewId,
} from '../../selectors';

// TODO: The below tests should work after all PRs are complete
describe.skip('urlSelectors', () => {
  it('should select from an empty url', () => {
    const testState = {
      routing: {
        pathname: '',
        search: {},
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual(undefined);
    expect(selectCurrentOrgUnitCode(testState)).toEqual(undefined);
    expect(selectCurrentDashboardGroupCode(testState)).toEqual(undefined);
    expect(selectCurrentMeasureId(testState)).toEqual(undefined);
    expect(selectCurrentExpandedViewId(testState)).toEqual(undefined);
  });

  it('should select from a normal url', () => {
    const testState = {
      routing: {
        pathname: '/SOME_PROJECT/AN_ORG_UNIT/A_DASHBOARD',
        search: { REPORT: 'report1', MEASURE: '2,3' },
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual('SOME_PROJECT');
    expect(selectCurrentOrgUnitCode(testState)).toEqual('AN_ORG_UNIT');
    expect(selectCurrentDashboardGroupCode(testState)).toEqual('A_DASHBOARD');
    expect(selectCurrentExpandedViewId(testState)).toEqual('report1');
    expect(selectCurrentMeasureId(testState)).toEqual('2,3');
  });
  it('should select from a reset-password url', () => {
    const testState = {
      routing: {
        pathname: '/reset-password',
        search: { PASSWORD_RESET_TOKEN: 'abc123' },
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual(undefined);
    expect(selectCurrentOrgUnitCode(testState)).toEqual(undefined);
    expect(selectCurrentDashboardGroupCode(testState)).toEqual(undefined);
    expect(selectCurrentMeasureId(testState)).toEqual(undefined);
    expect(selectCurrentExpandedViewId(testState)).toEqual(undefined);
  });

  it('should select from a verify-email url', () => {
    const testState = {
      routing: {
        pathname: '/verify-email',
        search: { VERIFY_EMAIL_TOKEN: 'abc123' },
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual(undefined);
    expect(selectCurrentOrgUnitCode(testState)).toEqual(undefined);
    expect(selectCurrentDashboardGroupCode(testState)).toEqual(undefined);
    expect(selectCurrentMeasureId(testState)).toEqual(undefined);
    expect(selectCurrentExpandedViewId(testState)).toEqual(undefined);
  });
});
