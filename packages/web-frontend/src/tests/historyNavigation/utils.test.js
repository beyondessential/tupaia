/**
 * Tupaia Web
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd.
 * This source code is licensed under the AGPL-3.0 license
 * found in the LICENSE file in the root directory of this source tree.
 */

import { decodeLocation } from '../../historyNavigation/utils';

const baseLocation = {
  pathname: '/PROJECT_1/ORG_UNIT_1/GROUP_1',
  search: '?overlay=overlay1&report=report1',
};

describe('historyNavigation/utils', () => {
  describe('decodeLocation', () => {
    it('should be able to decode full location', () => {
      expect(decodeLocation(baseLocation)).toEqual({
        PROJECT: 'PROJECT_1',
        ORG_UNIT: 'ORG_UNIT_1',
        DASHBOARD: 'GROUP_1',
        MAP_OVERLAY: 'overlay1',
        REPORT: 'report1',
      });
    });

    it('should be able to decode locations with missing org unit', () => {
      expect(decodeLocation({ ...baseLocation, pathname: '/PROJECT_1//GROUP_1' })).toEqual({
        PROJECT: 'PROJECT_1',
        ORG_UNIT: '',
        DASHBOARD: 'GROUP_1',
        MAP_OVERLAY: 'overlay1',
        REPORT: 'report1',
      });
    });

    it('should be able to decode locations with missing project', () => {
      expect(decodeLocation({ ...baseLocation, pathname: '//ORG_UNIT_1/GROUP_1' })).toEqual({
        PROJECT: '',
        ORG_UNIT: 'ORG_UNIT_1',
        DASHBOARD: 'GROUP_1',
        MAP_OVERLAY: 'overlay1',
        REPORT: 'report1',
      });
    });

    it('should be able to decode locations with missing group', () => {
      expect(decodeLocation({ ...baseLocation, pathname: '/PROJECT_1/ORG_UNIT_1/' })).toEqual({
        PROJECT: 'PROJECT_1',
        ORG_UNIT: 'ORG_UNIT_1',
        DASHBOARD: '',
        MAP_OVERLAY: 'overlay1',
        REPORT: 'report1',
      });
      expect(decodeLocation({ ...baseLocation, pathname: '/PROJECT_1/ORG_UNIT_1' })).toEqual({
        PROJECT: 'PROJECT_1',
        ORG_UNIT: 'ORG_UNIT_1',
        MAP_OVERLAY: 'overlay1',
        REPORT: 'report1',
      });
    });

    it('should be able to decode locations with empty path', () => {
      expect(decodeLocation({ ...baseLocation, pathname: '' })).toEqual({
        projectSelector: true,
        MAP_OVERLAY: 'overlay1',
        REPORT: 'report1',
      });
    });
  });
});
