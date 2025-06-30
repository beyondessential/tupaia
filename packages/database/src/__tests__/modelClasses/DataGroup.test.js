import { DataGroupModel, DataGroupRecord } from '../../core/modelClasses/DataGroup';

describe('DataGroup', () => {
  describe('sanitizeConfig()', () => {
    const database = {
      fetchSchemaForTable: () => {},
    };

    const createDataGroup = ({ serviceType = 'tupaia', config }) =>
      new DataGroupRecord(new DataGroupModel(database), {
        service_type: serviceType,
        config,
      });

    const assertConfigIsSanitized = ({ serviceType }, config, expectedConfig) => {
      const dataGroup = createDataGroup({ serviceType, config });
      dataGroup.sanitizeConfig();
      expect(dataGroup.config).toStrictEqual(expectedConfig);
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
