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

    const createDataSource = ({ serviceType = 'tupaia', config }) =>
      new DataSourceType(new DataSourceModel(database), {
        service_type: serviceType,
        config,
      });

    const assertConfigIsSanitized = ({ serviceType }, config, expectedConfig) => {
      const dataSource = createDataSource({ serviceType, config });
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

    describe('dhis service', () => {
      it('data element', () => {
        assertConfigIsSanitized(
          {
            serviceType: 'dhis',
          },
          {
            categoryOptionCombo: 'Female_50-70Years',
            dataElementCode: 'Gender_Age',
            isDataRegional: true,
            other: 'random',
          },
          {
            categoryOptionCombo: 'Female_50-70Years',
            dataElementCode: 'Gender_Age',
            isDataRegional: true,
          },
        );
      });

      it('should default `isDataRegional` to true', () => {
        assertConfigIsSanitized(
          {
            serviceType: 'dhis',
          },
          {},
          { isDataRegional: true },
        );

        ['', undefined, null].forEach(emptyValue => {
          assertConfigIsSanitized(
            {
              serviceType: 'dhis',
            },
            { isDataRegional: emptyValue },
            { isDataRegional: true },
          );
        });
      });

      it('should allow `isDataRegional` to be false', () => {
        assertConfigIsSanitized(
          {
            serviceType: 'dhis',
          },
          { isDataRegional: false },
          { isDataRegional: false },
        );
      });
    });

    describe('tupaia service', () => {
      it('data element', () => {
        assertConfigIsSanitized(
          {
            serviceType: 'tupaia',
          },
          { isDataRegional: false, other: 'random' },
          {},
        );
      });
    });

    it('should remove valid fields when empty', () => {
      ['', undefined, null].forEach(emptyValue => {
        assertConfigIsSanitized(
          {
            serviceType: 'dhis',
          },
          { isDataRegional: true, dataElementCode: emptyValue },
          { isDataRegional: true },
        );
      });
    });
  });
});
