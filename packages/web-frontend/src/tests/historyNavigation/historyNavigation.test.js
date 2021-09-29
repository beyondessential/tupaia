/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import {
  setLocationComponents,
  getLocationComponentValue,
} from '../../historyNavigation/historyNavigation';
import { URL_COMPONENTS } from '../../historyNavigation/constants';

const baseLocation = {
  pathname: '/PROJECT_1/ORG_UNIT_1/GROUP_1',
  search: '?overlay=overlay1&report=report1',
};

describe('historyNavigation', () => {
  describe('setLocationComponent', () => {
    it('should be able to set project', () => {
      expect(
        setLocationComponents(baseLocation, { [URL_COMPONENTS.PROJECT]: 'PROJECT_2' }),
      ).toEqual({
        pathname: '/PROJECT_2/ORG_UNIT_1/GROUP_1',
        search: baseLocation.search,
      });
    });

    it('should be able to set org unit', () => {
      expect(
        setLocationComponents(baseLocation, { [URL_COMPONENTS.ORG_UNIT]: 'ORG_UNIT_2' }),
      ).toEqual({
        pathname: '/PROJECT_1/ORG_UNIT_2/GROUP_1',
        search: baseLocation.search,
      });
    });

    it('should be able to set dashboard', () => {
      expect(
        setLocationComponents(baseLocation, { [URL_COMPONENTS.DASHBOARD]: 'GROUP_2' }),
      ).toEqual({
        pathname: '/PROJECT_1/ORG_UNIT_1/GROUP_2',
        search: baseLocation.search,
      });
    });

    it('should be able to set map overlay ids', () => {
      expect(
        setLocationComponents(baseLocation, { [URL_COMPONENTS.MAP_OVERLAY]: 'overlay2' }),
      ).toEqual({
        pathname: baseLocation.pathname,
        search: '?overlay=overlay2&report=report1',
      });
    });

    it('should be able to set expanded report', () => {
      expect(setLocationComponents(baseLocation, { [URL_COMPONENTS.REPORT]: 'report2' })).toEqual({
        pathname: baseLocation.pathname,
        search: '?overlay=overlay1&report=report2',
      });
    });

    it('should be able to set two components', () => {
      expect(
        setLocationComponents(baseLocation, {
          [URL_COMPONENTS.REPORT]: 'report2',
          [URL_COMPONENTS.MAP_OVERLAY]: 'overlay2',
        }),
      ).toEqual({
        pathname: baseLocation.pathname,
        search: '?overlay=overlay2&report=report2',
      });
    });
  });

  describe('getLocationComponentValue', () => {
    it('should be able to set project', () => {
      expect(getLocationComponentValue(baseLocation, URL_COMPONENTS.PROJECT)).toEqual('PROJECT_1');
    });
  });
});
