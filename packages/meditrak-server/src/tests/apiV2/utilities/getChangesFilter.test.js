/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { getChangesFilter } from '../../../apiV2/utilities/getChangesFilter';

const models = {
  getMinAppVersionByType: () => ({
    answer: '0.0.1',
    option: '1.7.92',
    entity: '1.7.102',
  }),
};

const createReq = query => ({ query, models });

describe('getChangesFilter()', () => {
  describe('`appVersion` parameter', () => {
    it('includes the correct types based on the meditrak version', async () => {
      const appVersionToTypes = {
        '0.0.1': ['answer'],
        '1.7.91': ['answer'],
        '1.7.92': ['answer', 'option'],
        '1.7.93': ['answer', 'option'],
        '1.7.100': ['answer', 'option'],
        '1.7.102': ['answer', 'option', 'entity'],
        '1.7.103': ['answer', 'option', 'entity'],
        '1.8.200': ['answer', 'option', 'entity'],
      };

      const assertCorrectTypesAreUsed = (appVersion, expectedTypes) => {
        const req = createReq({ appVersion, since: 1581030601 });

        return expect(getChangesFilter(req)).to.eventually.have.deep.property(
          'record_type',
          expectedTypes,
        );
      };

      return Promise.all(
        Object.entries(appVersionToTypes).map(([appVersion, expectedTypes]) =>
          assertCorrectTypesAreUsed(appVersion, expectedTypes),
        ),
      );
    });
  });
});
