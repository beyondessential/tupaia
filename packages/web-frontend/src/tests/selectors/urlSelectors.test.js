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
  selectCurrentOverlayCode,
  selectCurrentExpandedReportCode,
} from '../../selectors';

// QUESTION: Can I test these here even though it doesn't match the file structure of the
// actual code because it is easier to write and understand the tests?

describe.only('urlSelectors', () => {
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
    expect(selectCurrentOverlayCode(testState)).toEqual(undefined);
    expect(selectCurrentExpandedReportCode(testState)).toEqual(undefined);
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
    expect(selectCurrentExpandedReportCode(testState)).toEqual('report1');
    expect(selectCurrentOverlayCode(testState)).toEqual('2,3');
  });
  /*
  it('should be able to translate "%20" to " "', () => {
    const testState = {
      routing: {
        pathname: '/SOME_PROJECT/AN%20ORG_UNIT/A%20DASHBOARD',
        search: { REPORT: undefined, MEASURE: 'abc%20123' },
      },
    };
    expect(selectCurrentProjectCode(testState)).toEqual('SOME_PROJECT');
    expect(selectCurrentOrgUnitCode(testState)).toEqual('AN ORG_UNIT');
    expect(selectCurrentDashboardGroupCode(testState)).toEqual('A DASHBOARD');
    expect(selectCurrentOverlayCode(testState)).toEqual('abc 123');
    expect(selectCurrentExpandedReportCode(testState)).toEqual(undefined);
    //TODO Is this wanted behaviour?
  });
*/
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
    expect(selectCurrentOverlayCode(testState)).toEqual(undefined);
    expect(selectCurrentExpandedReportCode(testState)).toEqual(undefined);
    //TODO add tests
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
    expect(selectCurrentOverlayCode(testState)).toEqual(undefined);
    expect(selectCurrentExpandedReportCode(testState)).toEqual(undefined);
    //TODO add tests
  });
});
