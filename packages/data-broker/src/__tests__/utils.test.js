/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { arrayToAnalytic } from '../utils';

describe('utils', () => {
  describe('arrayToAnalytic', () => {
    it('converts an array to an analytic', () => {
      expect(arrayToAnalytic(['BCD1', 'TO', '20190101', 10])).toStrictEqual({
        dataElement: 'BCD1',
        organisationUnit: 'TO',
        period: '20190101',
        value: 10,
      });
    });
  });
});
