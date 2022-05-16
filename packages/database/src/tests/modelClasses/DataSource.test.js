/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DataSourceModel, DataSourceType } from '../../modelClasses/DataSource';

describe('DataSource', () => {
  describe('sanitizeConfig()', () => {
    const database = {
      fetchSchemaForTable: () => {},
    };

    const createDataSource = ({ type = 'dataElement', serviceType = 'tupaia', config }) =>
      new DataSourceType(new DataSourceModel(database), {
        type,
        service_type: serviceType,
        config,
      });

    const assertConfigIsSanitized = ({ type, serviceType }, config, expectedConfig) => {
      const dataSource = createDataSource({ type, serviceType, config });
      dataSource.sanitizeConfig();
      expect(dataSource.config).to.deep.equal(expectedConfig);
    };

    it('empty config', () => {
      [undefined, null, {}].forEach(emptyConfig => {
        const dataSource = createDataSource({ config: emptyConfig });
        dataSource.sanitizeConfig();
        expect(dataSource.config).be.an('object');
      });
    });

    it('unknown service', () => {
      const dataSource = createDataSource({ serviceType: 'random', config: {} });
      expect(() => dataSource.sanitizeConfig()).to.throw(/config schema .*service/);
    });

    it('should remove valid fields when empty', () => {
      ['', undefined, null].forEach(emptyValue => {
        assertConfigIsSanitized(
          {
            type: 'dataElement',
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
            type: 'dataElement',
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

      it('data group', () => {
        assertConfigIsSanitized(
          {
            type: 'dataGroup',
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

      it('should default `dhisInstanceCode` if missing', () => {
        assertConfigIsSanitized(
          {
            type: 'dataElement',
            serviceType: 'dhis',
          },
          {},
          { dhisInstanceCode: 'regional' },
        );
        ['', undefined].forEach(emptyValue => {
          assertConfigIsSanitized(
            {
              type: 'dataElement',
              serviceType: 'dhis',
            },
            { dhisInstanceCode: emptyValue },
            { dhisInstanceCode: 'regional' },
          );
        });
      });

      it('should allow `dhisInstanceCode` to be null', () => {
        assertConfigIsSanitized(
          {
            type: 'dataElement',
            serviceType: 'dhis',
          },
          { dhisInstanceCode: null },
          { dhisInstanceCode: null },
        );
      });
    });

    describe('tupaia service', () => {
      it('data element', () => {
        assertConfigIsSanitized(
          {
            type: 'dataElement',
            serviceType: 'tupaia',
          },
          { dhisInstanceCode: 'bob', other: 'random' },
          {},
        );
      });

      it('data group', () => {
        assertConfigIsSanitized(
          {
            type: 'dataGroup',
            serviceType: 'tupaia',
          },
          { dhisInstanceCode: 'bob', other: 'random' },
          {},
        );
      });
    });
  });
});
