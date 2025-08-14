import { DataElementModel, DataElementRecord } from '../../core/modelClasses/DataElement';

describe('DataElement', () => {
  describe('sanitizeConfig()', () => {
    const database = {
      fetchSchemaForTable: () => {},
    };

    const createDataElement = ({ serviceType = 'tupaia', config }) =>
      new DataElementRecord(new DataElementModel(database), {
        service_type: serviceType,
        config,
      });

    const assertConfigIsSanitized = ({ serviceType }, config, expectedConfig) => {
      const dataElement = createDataElement({ serviceType, config });
      dataElement.sanitizeConfig();
      expect(dataElement.config).toStrictEqual(expectedConfig);
    };

    it('empty config', () => {
      [undefined, null, {}].forEach(emptyConfig => {
        const dataElement = createDataElement({ config: emptyConfig });
        dataElement.sanitizeConfig();
        expect(dataElement.config).toBeInstanceOf(Object);
      });
    });

    it('unknown service', () => {
      const dataElement = createDataElement({ serviceType: 'random', config: {} });
      expect(() => dataElement.sanitizeConfig()).toThrowError(/config schema .*service/);
    });

    it('should remove valid fields when empty', () => {
      ['', undefined, null].forEach(emptyValue => {
        assertConfigIsSanitized(
          {
            serviceType: 'dhis',
          },
          { dhisInstanceCode: 'bob', dataElementCode: emptyValue },
          { dhisInstanceCode: 'bob' },
        );
      });
    });

    describe('dhis service', () => {
      it('data element', () => {
        assertConfigIsSanitized(
          {
            serviceType: 'dhis',
          },
          {
            categoryOptionCombo: 'Female_50-70Years',
            dataElementCode: 'Gender_Age',
            dhisInstanceCode: 'bob',
            other: 'random',
          },
          {
            categoryOptionCombo: 'Female_50-70Years',
            dataElementCode: 'Gender_Age',
            dhisInstanceCode: 'bob',
          },
        );
      });

      it('should default `dhisInstanceCode` if missing', () => {
        assertConfigIsSanitized(
          {
            serviceType: 'dhis',
          },
          {},
          { dhisInstanceCode: 'regional' },
        );
        ['', undefined].forEach(emptyValue => {
          assertConfigIsSanitized(
            {
              serviceType: 'dhis',
            },
            { dhisInstanceCode: emptyValue },
            { dhisInstanceCode: 'regional' },
          );
        });
      });
    });

    describe('tupaia service', () => {
      it('data element', () => {
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
});
