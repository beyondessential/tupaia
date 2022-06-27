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
          type: 'dataGroup',
          serviceType: 'dhis',
        },
        {
          dataElementCode: 'newCode',
          isDataRegional: true,
          other: 'random',
        },
        { isDataRegional: true },
      );
    });

    it('tupaia service', () => {
      assertConfigIsSanitized(
        {
          type: 'dataGroup',
          serviceType: 'tupaia',
        },
        { isDataRegional: false, other: 'random' },
        {},
      );
    });
  });
});
