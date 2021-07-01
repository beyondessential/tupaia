/**
 * Tupaia Web
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  selectCurrentOrgUnitCode,
  selectCurrentProjectCode,
  selectCurrentMeasureId,
  selectCurrentExpandedViewCode,
} from '../../selectors';
import { selectCurrentDashboardNameFromLocation } from '../../selectors/dashboardSelectors';

describe('urlSelectors', () => {
  it('should select from an empty url', () => {
    const testState = {
      routing: {
        pathname: '',
        search: '',
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual(undefined);
    expect(selectCurrentOrgUnitCode(testState)).toEqual(undefined);
    expect(selectCurrentDashboardNameFromLocation(testState)).toEqual(undefined);
    expect(selectCurrentMeasureId(testState)).toEqual(undefined);
    expect(selectCurrentExpandedViewCode(testState)).toEqual(undefined);
  });

  it('should select from a normal url', () => {
    const testState = {
      routing: {
        pathname: '/SOME_PROJECT/AN_ORG_UNIT/A_DASHBOARD',
        search: '?report=report1&overlay=2,3',
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual('SOME_PROJECT');
    expect(selectCurrentOrgUnitCode(testState)).toEqual('AN_ORG_UNIT');
    expect(selectCurrentDashboardNameFromLocation(testState)).toEqual('A_DASHBOARD');
    expect(selectCurrentExpandedViewCode(testState)).toEqual('report1');
    expect(selectCurrentMeasureId(testState)).toEqual('2,3');
  });

  it('should select from a reset-password url', () => {
    const testState = {
      routing: {
        pathname: '/reset-password',
        search: '?password-reset-token=abc123',
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual(undefined);
    expect(selectCurrentOrgUnitCode(testState)).toEqual(undefined);
    expect(selectCurrentDashboardNameFromLocation(testState)).toEqual(undefined);
    expect(selectCurrentMeasureId(testState)).toEqual(undefined);
    expect(selectCurrentExpandedViewCode(testState)).toEqual(undefined);
  });

  it('should select from a verify-email url', () => {
    const testState = {
      routing: {
        pathname: '/verify-email',
        search: '?verify-email-token=abc123',
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual(undefined);
    expect(selectCurrentOrgUnitCode(testState)).toEqual(undefined);
    expect(selectCurrentDashboardNameFromLocation(testState)).toEqual(undefined);
    expect(selectCurrentMeasureId(testState)).toEqual(undefined);
    expect(selectCurrentExpandedViewCode(testState)).toEqual(undefined);
  });
});
