/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { setUrlComponent, getUrlComponent } from '../../historyNavigation/historyNavigation';
import { URL_COMPONENTS } from '../../historyNavigation/constants';

const baseLocation = {
  pathname: '/PROJECT_1/ORG_UNIT_1/GROUP_1',
  search: {
    MEASURE: 'overlay1',
    REPORT: 'report1',
  },
};
describe('historyNavigation', () => {
  describe('setUrlComponent', () => {
    it('should be able to set project', () => {
      expect(setUrlComponent(URL_COMPONENTS.PROJECT, 'PROJECT_2', baseLocation)).toEqual({
        pathname: '/PROJECT_2/ORG_UNIT_1/GROUP_1',
        search: baseLocation.search,
      });
    });
    it('should be able to set org unit', () => {
      expect(setUrlComponent(URL_COMPONENTS.ORG_UNIT, 'ORG_UNIT_2', baseLocation)).toEqual({
        pathname: '/PROJECT_1/ORG_UNIT_2/GROUP_1',
        search: baseLocation.search,
      });
    });
    it('should be able to set dashboard', () => {
      expect(setUrlComponent(URL_COMPONENTS.DASHBOARD, 'GROUP_2', baseLocation)).toEqual({
        pathname: '/PROJECT_1/ORG_UNIT_1/GROUP_2',
        search: baseLocation.search,
      });
    });
    it('should be able to set measure', () => {
      expect(setUrlComponent(URL_COMPONENTS.MEASURE, 'overlay2', baseLocation)).toEqual({
        pathname: baseLocation.pathname,
        search: { ...baseLocation.search, MEASURE: 'overlay2' },
      });
    });
    it('should be able to set expanded report', () => {
      expect(setUrlComponent(URL_COMPONENTS.REPORT, 'report2', baseLocation)).toEqual({
        pathname: baseLocation.pathname,
        search: { ...baseLocation.search, REPORT: 'report2' },
      });
    });
  });
  describe('getUrlComponent', () => {
    // QUESTION: Handled in selectors test?
    it('should be able to set project', () => {
      expect(getUrlComponent(URL_COMPONENTS.PROJECT, baseLocation)).toEqual('PROJECT_1');
    });
  });
});
