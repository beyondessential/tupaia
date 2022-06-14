/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DataGroupModel, DataGroupType } from '../../modelClasses/DataGroup';

describe('DataGroup', () => {
  describe('sanitizeConfig()', () => {
    const database = {
      fetchSchemaForTable: () => {},
    };

    const createDataGroup = ({ serviceType = 'tupaia', config }) =>
      new DataGroupType(new DataGroupModel(database), {
        service_type: serviceType,
        config,
      });

    const assertConfigIsSanitized = ({ serviceType }, config, expectedConfig) => {
      const dataGroup = createDataGroup({ serviceType, config });
      dataGroup.sanitizeConfig();
      expect(dataGroup.config).to.deep.equal(expectedConfig);
    };

    it('dhis service', () => {
      assertConfigIsSanitized(
        {
          serviceType: 'dhis',
        },
        {
          dataElementCode: 'newCode',
          dhisInstanceCode: 'bob',
          other: 'random',
        },
        { dhisInstanceCode: 'bob' },
      );
    });

    it('tupaia service', () => {
      assertConfigIsSanitized(
        {
          serviceType: 'tupaia',
        },
        { dhisInstanceCode: 'bob', other: 'random' },
        {},
      );
    });
  });
});
