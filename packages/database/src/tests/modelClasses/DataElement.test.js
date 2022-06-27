/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { DataElementModel, DataElementType } from '../../modelClasses/DataElement';

describe('DataElement', () => {
  describe('sanitizeConfig()', () => {
    const database = {
      fetchSchemaForTable: () => {},
    };

    const createDataElement = ({ serviceType = 'tupaia', config }) =>
      new DataElementType(new DataElementModel(database), {
        service_type: serviceType,
        config,
      });

    const assertConfigIsSanitized = ({ serviceType }, config, expectedConfig) => {
      const dataElement = createDataElement({ serviceType, config });
      dataElement.sanitizeConfig();
      expect(dataElement.config).to.deep.equal(expectedConfig);
    };

    it('empty config', () => {
      [undefined, null, {}].forEach(emptyConfig => {
        const dataElement = createDataElement({ config: emptyConfig });
        dataElement.sanitizeConfig();
        expect(dataElement.config).be.an('object');
      });
    });

    it('unknown service', () => {
      const dataElement = createDataElement({ serviceType: 'random', config: {} });
      expect(() => dataElement.sanitizeConfig()).to.throw(/config schema .*service/);
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
